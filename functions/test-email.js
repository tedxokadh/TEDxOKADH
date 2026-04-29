/**
 * سكريبت اختبار محلي — يرسل إيميل تأكيد تجريبي
 * تشغيل: node test-email.js
 */

const { Resend } = require('resend')
const QRCode = require('qrcode')
const { confirmationEmail, reminderEmail } = require('./emailTemplates')

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_2M9HN2SG_MjxCFeJKoE8D3H54ebWj1eay'
const FROM_EMAIL = 'TEDx OKADH <no-reply@mail.tedxokadh.co>'

// ← غيّر هذا الإيميل لإيميلك الشخصي للتجربة
const TEST_TO_EMAIL = process.env.TEST_EMAIL || 'aamsa3579@gmail.com'

const resend = new Resend(RESEND_API_KEY)

async function testConfirmationEmail() {
  console.log('⏳ جاري توليد QR Code...')

  const testName  = 'عبير محمد الأحمد'
  const testEmail = TEST_TO_EMAIL
  const testCode  = 'TEDXOKADH-TEST-ABC123-XYZ9'

  const qrDataUrl = await QRCode.toDataURL(
    `${testName}|${testEmail}|${testCode}`,
    { width: 220, margin: 2, color: { dark: '#ffffff', light: '#0a0a0a' } }
  )

  console.log('✅ QR Code جاهز')
  console.log(`📧 إرسال إيميل تأكيد إلى: ${testEmail}`)

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: testEmail,
    subject: '🎉 تم تأكيد تسجيلك في TEDx OKADH 2026',
    html: confirmationEmail({ name: testName, code: testCode, qrBase64: qrDataUrl }),
  })

  if (result.error) {
    console.error('❌ فشل الإرسال:', result.error)
  } else {
    console.log('✅ تم الإرسال بنجاح! ID:', result.data?.id)
  }
}

async function testReminderEmail() {
  console.log(`📧 إرسال إيميل تذكير إلى: ${TEST_TO_EMAIL}`)

  const testCode = 'TEDXOKADH-TEST-ABC123-XYZ9'
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: TEST_TO_EMAIL,
    subject: 'TEDxOkadh — 2 Days Away',
    html: reminderEmail({
      name: 'Abeer Mohammed',
      confirmLink: `https://www.tedxokadh.co/confirm/${encodeURIComponent(testCode)}`,
    }),
  })

  if (result.error) {
    console.error('❌ فشل الإرسال:', result.error)
  } else {
    console.log('✅ تم إرسال التذكير بنجاح! ID:', result.data?.id)
  }
}

const arg = process.argv[2]

if (arg === 'reminder') {
  testReminderEmail().catch(console.error)
} else {
  testConfirmationEmail().catch(console.error)
}
