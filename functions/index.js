const { onRequest } = require('firebase-functions/v2/https')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')
const { getFirestore } = require('firebase-admin/firestore')
const { Resend } = require('resend')
const QRCode = require('qrcode')
const { confirmationEmail, reminderEmail } = require('./emailTemplates')

admin.initializeApp()

const RESEND_API_KEY = defineSecret('RESEND_API_KEY')
const FROM_EMAIL = 'TEDx OKADH <no-reply@mail.tedxokadh.co>'
const SITE_URL = 'https://www.tedxokadh.co'
const BATCH_SIZE = 100
const DB_NAME = 'default'

// ─────────────────────────────────────────────
// Shared: send reminders to all registrants
// ─────────────────────────────────────────────
async function dispatchReminders(resend) {
  const db = getFirestore(admin.app(), DB_NAME)
  const allRecipients = []
  let lastDoc = null

  do {
    let q = db.collection('registrations').orderBy('createdAt').limit(500)
    if (lastDoc) q = q.startAfter(lastDoc)
    const snapshot = await q.get()
    if (snapshot.empty) break
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    snapshot.docs.forEach(doc => {
      const { name, email, code } = doc.data()
      if (email && code && emailRegex.test(email)) allRecipients.push({ name, email, code })
    })
    lastDoc = snapshot.docs[snapshot.docs.length - 1]
  } while (lastDoc)

  // Deduplicate by email address
  const seen = new Set()
  const unique = allRecipients.filter(({ email }) => {
    if (seen.has(email)) return false
    seen.add(email)
    return true
  })

  if (unique.length === 0) return { sent: 0, failed: 0, total: 0 }

  let totalSent = 0
  let totalFailed = 0

  for (const { name, email, code } of unique) {
    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'TEDxOkadh — 2 Days Away',
        html: reminderEmail({
          name,
          confirmLink: `${SITE_URL}/confirm/${encodeURIComponent(code)}`,
        }),
      })

      if (result.error) {
        console.error(`Failed for ${email}:`, JSON.stringify(result.error))
        totalFailed++
      } else {
        totalSent++
        console.log(`Sent reminder to ${email} (${totalSent}/${unique.length})`)
      }
    } catch (e) {
      console.error(`Exception for ${email}:`, e.message)
      totalFailed++
    }

    // Resend rate limit: max 2 requests/second — wait 600ms to stay safe
    await new Promise(r => setTimeout(r, 600))
  }

  return { sent: totalSent, failed: totalFailed, total: unique.length }
}

// ─────────────────────────────────────────────
// 1. إيميل التأكيد — HTTP endpoint مفتوح لجميع الأجهزة والمتصفحات
//    POST /sendConfirmationEmail  body: { name, email, code }
// ─────────────────────────────────────────────
exports.sendConfirmationEmail = onRequest(
  { secrets: [RESEND_API_KEY], cors: true, invoker: 'public' },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).end()

    const { name, email, code } = req.body || {}
    if (!name || !email || !code) return res.status(400).json({ success: false })

    const resend = new Resend(RESEND_API_KEY.value())

    // Generate QR as raw PNG buffer — avoids base64 blocking in email clients
    const qrBuffer = await QRCode.toBuffer(
      `${name}|${email}|${code}`,
      { width: 220, margin: 2 }
    )

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your TEDxOkadh Registration Confirmation',
      html: confirmationEmail({ name, code }),
      attachments: [{
        filename: 'qrcode.png',
        content: qrBuffer,
        contentId: 'qrcode',
        contentDisposition: 'inline',
        contentType: 'image/png',
      }],
    })

    if (result.error) {
      console.error(`Failed to send confirmation to ${email}:`, result.error)
      return res.status(500).json({ success: false })
    }

    console.log(`Confirmation sent to ${email} — ID: ${result.data?.id}`)
    res.json({ success: true })
  }
)

// ─────────────────────────────────────────────
// 2. إيميل التذكير — مجدول تلقائياً يوم 13 مايو 2026 الساعة 8 صباحاً
// ─────────────────────────────────────────────
exports.scheduledReminders = onSchedule(
  { schedule: '0 8 * * *', timeZone: 'Asia/Riyadh', secrets: [RESEND_API_KEY] },
  async () => {
    const eventDate = new Date('2026-05-15T00:00:00+03:00')
    const now = new Date()
    const diffDays = Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays !== 2) {
      console.log(`Skipping reminders — days until event: ${diffDays}`)
      return
    }

    console.log('2 days before event — dispatching reminder emails...')
    const resend = new Resend(RESEND_API_KEY.value())
    const stats = await dispatchReminders(resend)
    console.log('Reminder dispatch complete:', stats)
  }
)

// ─────────────────────────────────────────────
// 3. إيميل التذكير — يُشغَّل يدوياً من الأدمن
//    POST https://sendreminderemails-3x5om53ymq-uc.a.run.app
// ─────────────────────────────────────────────
exports.sendReminderEmails = onRequest(
  { secrets: [RESEND_API_KEY], timeoutSeconds: 540, cors: true, invoker: 'public' },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

    const resend = new Resend(RESEND_API_KEY.value())
    const stats = await dispatchReminders(resend)
    res.json(stats)
  }
)
