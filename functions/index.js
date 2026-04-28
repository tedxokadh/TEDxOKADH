const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')
const { Resend } = require('resend')
const QRCode = require('qrcode')
const { confirmationEmail, reminderEmail } = require('./emailTemplates')

admin.initializeApp()

const RESEND_API_KEY = defineSecret('RESEND_API_KEY')
const FROM_EMAIL = 'TEDx OKADH <no-reply@mail.tedxokadh.co>'
const SITE_URL = 'https://www.tedxokadh.co'
const BATCH_SIZE = 100

// ─────────────────────────────────────────────
// 1. إيميل التأكيد — يُفعَّل تلقائياً عند كل تسجيل جديد في Firestore
// ─────────────────────────────────────────────
exports.sendConfirmationEmail = onDocumentCreated(
  { document: 'registrations/{docId}', secrets: [RESEND_API_KEY] },
  async (event) => {
    const data = event.data?.data()
    if (!data) return

    const { name, email, code } = data
    if (!email || !code) return

    const resend = new Resend(RESEND_API_KEY.value())

    const qrDataUrl = await QRCode.toDataURL(
      `${name}|${email}|${code}`,
      { width: 220, margin: 2, color: { dark: '#ffffff', light: '#0a0a0a' } }
    )

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your TEDxOkadh Registration Confirmation',
      html: confirmationEmail({ name, code, qrBase64: qrDataUrl }),
    })

    if (result.error) {
      console.error(`Failed to send confirmation to ${email}:`, result.error)
    } else {
      console.log(`Confirmation sent to ${email} — ID: ${result.data?.id}`)
    }
  }
)

// ─────────────────────────────────────────────
// 2. إيميل التذكير — يُشغَّل يدوياً من الأدمن قبل الحدث بيومين
//    POST https://<region>-tedxokadh2026.cloudfunctions.net/sendReminderEmails
// ─────────────────────────────────────────────
exports.sendReminderEmails = onRequest(
  { secrets: [RESEND_API_KEY], timeoutSeconds: 540 },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

    const db = admin.firestore()
    const resend = new Resend(RESEND_API_KEY.value())

    // جلب كل المسجلين مع pagination
    const allRecipients = []
    let lastDoc = null
    do {
      let query = db.collection('registrations').orderBy('createdAt').limit(500)
      if (lastDoc) query = query.startAfter(lastDoc)
      const snapshot = await query.get()
      if (snapshot.empty) break
      snapshot.docs.forEach(doc => {
        const { name, email, code } = doc.data()
        if (email && code) allRecipients.push({ name, email, code })
      })
      lastDoc = snapshot.docs[snapshot.docs.length - 1]
    } while (lastDoc)

    if (allRecipients.length === 0)
      return res.json({ sent: 0, message: 'No registrations found' })

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

    res.json({ sent: totalSent, failed: totalFailed, total: allRecipients.length })
  }
)
