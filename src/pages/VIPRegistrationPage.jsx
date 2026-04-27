import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function VIPRegistrationPage({ lang }) {
  const navigate = useNavigate()
  const ar = lang === 'ar'
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const addDocWithTimeout = (promise, ms = 15000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Firestore request timed out.')), ms)
    promise.then(value => { clearTimeout(timer); resolve(value) }).catch(err => { clearTimeout(timer); reject(err) })
  })

  const S = {
    wrap: { minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px,4vw,40px)', position: 'relative', overflow: 'hidden', fontFamily: "'Cairo',sans-serif", direction: ar ? 'rtl' : 'ltr' },
    glow: { position: 'fixed', top: 0, right: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(230,43,30,0.14) 0%,transparent 65%)', pointerEvents: 'none', zIndex: 0 },
    card: { background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 'clamp(24px,4vw,40px)', width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 },
    label: { color: '#888', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' },
    hint: { color: '#555', fontSize: 11, marginBottom: 8, display: 'block', lineHeight: 1.5 },
    input: (e) => ({ width: '100%', background: '#0d0d0d', border: `1px solid ${e ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, color: '#fff', padding: '11px 14px', fontSize: 14, outline: 'none', fontFamily: "'Cairo',sans-serif", boxSizing: 'border-box', transition: 'border-color 0.2s' }),
    err: { color: '#ef4444', fontSize: 11, marginTop: 4, display: 'block' },
    field: { marginBottom: 18 },
  }

  function update(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  function validate() {
    const e = {}
    const nameParts = form.name.trim().split(/\s+/)
    if (nameParts.length < 3 || nameParts.some(p => p.length < 2))
      e.name = ar ? 'يرجى إدخال الاسم الثلاثي كاملاً' : 'Please enter your full three-part name'
    if (!/^[\x00-\x7F]+$/.test(form.email))
      e.email = ar ? 'يرجى كتابة البريد بالأحرف الإنجليزية فقط' : 'Email must be in English characters only'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = ar ? 'صيغة البريد غير صحيحة — مثال: name@domain.com' : 'Invalid email — e.g. name@domain.com'
    const digits = form.phone.replace(/\D/g, '')
    if (digits.length !== 10)
      e.phone = ar ? 'رقم الجوال يجب أن يكون 10 أرقام بالضبط' : 'Phone must be exactly 10 digits'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit() {
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    try {
      await addDocWithTimeout(addDoc(collection(db, 'vip_requests'), {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        status: 'pending',
        createdAt: serverTimestamp(),
      }), 15000)
      setDone(true)
    } catch(e) {
      console.error('Firestore error:', e)
      setSubmitError(ar ? 'حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.' : 'Unable to submit your request. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div style={S.wrap}>
      <div style={S.glow} />
      <div style={{ ...S.card, textAlign: 'center', maxWidth: 440 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(230,43,30,0.1)', border: '2px solid #E62B1E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 18px' }}>⏳</div>
        <h2 style={{ color: '#E62B1E', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
          {ar ? 'تم استلام طلبك' : 'Request Received'}
        </h2>
        <p style={{ color: '#888', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
          {ar
            ? 'جاري التحقق وسيتم إرسال الدعوة لكم في أقرب وقت.'
            : 'Your request is being reviewed. An invitation will be sent to you shortly.'}
        </p>
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: ar ? 'right' : 'left' }}>
          <p style={{ color: '#555', fontSize: 11, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>{ar ? 'البريد المسجل' : 'Registered Email'}</p>
          <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, direction: 'ltr', textAlign: 'left' }}>{form.email}</p>
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#888', padding: '10px 24px', fontSize: 14, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
          {ar ? '← العودة للرئيسية' : '← Back to Home'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={S.wrap}>
      <div style={S.glow} />
      <div style={S.card}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0, display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Cairo',sans-serif" }}>
          {ar ? '← العودة' : '← Back'}
        </button>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              <span style={{ color: '#E62B1E' }}>TED</span><sup style={{ color: '#E62B1E', fontSize: 10 }}>x</sup><span style={{ color: '#fff' }}>OKADH</span>
            </div>
            <span style={{ background: 'rgba(230,43,30,0.1)', border: '1px solid rgba(230,43,30,0.3)', color: '#E62B1E', fontSize: 10, fontWeight: 900, letterSpacing: 2, padding: '2px 8px', borderRadius: 6 }}>VIP</span>
          </div>
          <p style={{ color: '#555', fontSize: 13 }}>{ar ? 'نموذج التسجيل — دعوة VIP' : 'Registration — VIP Invitation'}</p>
        </div>

        <div style={S.field}>
          <label style={S.label}>{ar ? 'الاسم الثلاثي *' : 'Full Name (3 parts) *'}</label>
          <span style={S.hint}>{ar ? 'يرجى كتابة الاسم كما هو في الهوية الوطنية' : 'Please enter your name as it appears on your ID'}</span>
          <input style={S.input(errors.name)} value={form.name} onChange={e => update('name', e.target.value)}
            placeholder={ar ? 'مثال: محمد أحمد العمري' : 'e.g. Mohammed Ahmad AlOmari'} />
          {errors.name && <span style={S.err}>{errors.name}</span>}
        </div>

        <div style={S.field}>
          <label style={S.label}>{ar ? 'البريد الإلكتروني *' : 'Email Address *'}</label>
          <span style={S.hint}>{ar ? 'بالأحرف الإنجليزية فقط — مثال: name@domain.com' : 'English characters only — e.g. name@domain.com'}</span>
          <input style={S.input(errors.email)} type="email" value={form.email} onChange={e => update('email', e.target.value)}
            placeholder="name@domain.com" dir="ltr" />
          {errors.email && <span style={S.err}>{errors.email}</span>}
        </div>

        <div style={S.field}>
          <label style={S.label}>{ar ? 'رقم الجوال *' : 'Mobile Number *'}</label>
          <span style={S.hint}>{ar ? '10 أرقام بالضبط — مثال: 0512345678' : 'Exactly 10 digits — e.g. 0512345678'}</span>
          <input style={S.input(errors.phone)} value={form.phone}
            onChange={e => update('phone', e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
            placeholder="0512345678" dir="ltr" maxLength={10} />
          {errors.phone && <span style={S.err}>{errors.phone}</span>}
        </div>

        <button onClick={submit} disabled={loading} style={{ width: '100%', background: loading ? 'rgba(230,43,30,0.5)' : '#E62B1E', border: 'none', borderRadius: 12, color: '#fff', padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Cairo',sans-serif", transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          {loading
            ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />{ar ? ' جارٍ الإرسال...' : ' Sending...'}</>
            : ar ? 'إرسال طلب الدعوة' : 'Submit VIP Request'}
        </button>
        {submitError && <div style={{ color: '#ef4444', marginTop: 12, fontSize: 13 }}>{submitError}</div>}
      </div>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}
