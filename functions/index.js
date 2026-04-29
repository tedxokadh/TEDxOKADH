const { onCall, onRequest } = require('firebase-functions/v2/https')
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
// Shared: fetch all registrants and send reminder emails
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
    snapshot.docs.forEach(doc => {
      const { name, email, code } = doc.data()
      if (email && code) allRecipients.push({ name, email, code })
    })
    lastDoc = snapshot.docs[snapshot.docs.length - 1]
  } while (lastDoc)

  if (allRecipients.length === 0) return { sent: 0, failed: 0, total: 0 }

  let totalSent = 0
  let totalFailed = 0

  for (let i = 0; i < allRecipients.length; i += BATCH_SIZE) {
    const batch = allRecipients.slice(i, i + BATCH_SIZE)

    const batchPayload = batch.map(({ name, email, code }) => ({
      from: FROM_EMAIL,
      to: email,
      subject: 'TEDxOkadh — 2 Days Away',
      html: reminderEmail({
        name,
        confirmLink: `${SITE_URL}/confirm/${encodeURIComponent(code)}`,
      }),
    }))

    const result = await resend.batch.send(batchPayload)
    if (result.error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, result.error)
      totalFailed += batch.length
    } else {
      totalSent += batch.length
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allRecipients.length / BATCH_SIZE)} — sent: ${totalSent}`)
    }

    if (i + BATCH_SIZE < allRecipients.length)
      await new Promise(r => setTimeout(r, 200))
  }

  return { sent: totalSent, failed: totalFailed, total: allRecipients.length }
}

// ─────────────────────────────────────────────
// 1. إيميل التأكيد — يُستدعى من العميل مباشرة بعد اكتمال التسجيل
// ─────────────────────────────────────────────
exports.sendConfirmationEmail = onCall(
  { secrets: [RESEND_API_KEY], invoker: 'public', cors: true },
  async (request) => {
    const { name, email, code } = request.data || {}
    if (!name || !email || !code) return { success: false }

    const resend = new Resend(RESEND_API_KEY.value())

    // Black-on-white QR — always readable in both dark & light email mode
    const qrDataUrl = await QRCode.toDataURL(
      `${name}|${email}|${code}`,
      { width: 220, margin: 2, color: { dark: '#000000', light: '#ffffff' } }
    )

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your TEDxOkadh Registration Confirmation',
      html: confirmationEmail({ name, code, qrBase64: qrDataUrl }),
    })

    if (result.error) {
      console.error(`Failed to send confirmation to ${email}:`, result.error)
      return { success: false }
    }

    console.log(`Confirmation sent to ${email} — ID: ${result.data?.id}`)
    return { success: true }
  }
)

// ─────────────────────────────────────────────
// 2. إيميل التذكير — مجدول تلقائياً يوم 13 مايو 2026 الساعة 8 صباحاً (توقيت الرياض)
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
// 3. إيميل التذكير — يُشغَّل يدوياً من الأدمن عند الحاجة
//    POST https://<region>-tedxokadh2026.cloudfunctions.net/sendReminderEmails
// ─────────────────────────────────────────────
exports.sendReminderEmails = onRequest(
  { secrets: [RESEND_API_KEY], timeoutSeconds: 540, invoker: 'public' },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

    const resend = new Resend(RESEND_API_KEY.value())
    const stats = await dispatchReminders(resend)
    res.json(stats)
  }
)
