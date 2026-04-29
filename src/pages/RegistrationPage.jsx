import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp, enableNetwork } from 'firebase/firestore'

const STEPS_AR = ['المعلومات الشخصية', 'الخلفية المهنية', 'الاهتمامات والتأكيد']
const STEPS_EN = ['Personal Info', 'Professional Background', 'Interests & Confirmation']

export default function RegistrationPage({ lang }) {
  const navigate = useNavigate()
  const ar = lang === 'ar'
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    status: '', statusOther: '',
    mediaLicense: '',
    specialization: '',
    sector: '',
    workplace: '',
    interests: [],
    notifications: '',
    attendance: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [passCode, setPassCode] = useState('')
  const [qrUrl, setQrUrl] = useState('')


  const statusOptions = ar
    ? ['طالب', 'موظف', 'إعلامي', 'باحث عن عمل', 'ريادي أعمال', 'أخرى']
    : ['Student', 'Employee', 'Media', 'Job Seeker', 'Entrepreneur', 'Other']

  const specializationOptions = ar
    ? ['تخصص تقني (مثل الهندسة، تقنية المعلومات)', 'تخصص إدارة أعمال أو إدارة عامة', 'تخصص علمي أو صحي (مثل الطب، الأحياء)', 'تخصص أدبي أو إنساني']
    : ['Technical (Engineering, IT)', 'Business Administration', 'Scientific / Medical (Medicine, Biology)', 'Arts & Humanities']

  const sectorOptions = ar
    ? ['قطاع حكومي', 'قطاع خاص', 'قطاع عسكري', 'القطاع غير الربحي']
    : ['Government', 'Private', 'Military', 'Non-Profit']

  const interestOptions = ar
    ? ['الابتكار والتكنولوجيا', 'الفنون والثقافة', 'العلوم والبحث', 'ريادة الأعمال', 'التعليم', 'الاستدامة والبيئة', 'القيادة والتطوير']
    : ['Innovation & Technology', 'Arts & Culture', 'Science & Research', 'Entrepreneurship', 'Education', 'Sustainability', 'Leadership & Development']

  function update(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  function toggleInterest(val) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(val)
        ? f.interests.filter(i => i !== val)
        : [...f.interests, val]
    }))
  }

  function validateStep(s) {
    const e = {}
    if (s === 0) {
      if (!form.name.trim() || form.name.trim().split(' ').length < 3) e.name = ar ? 'يرجى إدخال الاسم الثلاثي كاملاً' : 'Please enter your full three-part name'
      if (!/^[\x00-\x7F]+$/.test(form.email)) e.email = ar ? 'يرجى كتابة البريد الإلكتروني بالأحرف الإنجليزية فقط' : 'Email must be written in English characters only'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = ar ? 'يرجى التأكد من صحة البريد الإلكتروني' : 'Please enter a valid email'
      const digits = form.phone.replace(/\D/g, '')
      if (!(digits.length === 10 || (digits.length === 12 && digits.startsWith('966')))) e.phone = ar ? 'رقم الهاتف يجب أن يكون 10 أرقام (مثال: 0512345678)' : 'Phone must be 10 digits (e.g. 0512345678)'
    }
    if (s === 1) {
      if (!form.status) e.status = ar ? 'يرجى اختيار الحالة المهنية' : 'Please select your status'
      if (!form.sector) e.sector = ar ? 'يرجى تحديد القطاع' : 'Please select sector'
      if (!form.workplace.trim()) e.workplace = ar ? 'يرجى إدخال جهة العمل أو الدراسة' : 'Please enter workplace/university'
    }
    if (s === 2) {
      if (!form.attendance) e.attendance = ar ? 'يرجى تأكيد الحضور' : 'Please confirm attendance'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validateStep(step)) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  const submit = async () => {
    if (!validateStep(2)) return
    setLoading(true)
    setSubmitError('')

    const ts = Date.now().toString(36).toUpperCase()
    const r1 = Math.random().toString(36).slice(2,8).toUpperCase()
    const r2 = Math.random().toString(36).slice(2,6).toUpperCase()
    const code = `TEDXOKADH-${ts}-${r1}-${r2}`
    setPassCode(code)

    // timeout يظهر خطأ بعد 12 ثانية إذا لم يكتمل التسجيل
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setSubmitError(ar
        ? 'استغرق الاتصال وقتاً طويلاً. تحقق من الإنترنت وأعد المحاولة.'
        : 'Connection timed out. Please check your internet and try again.')
    }, 12000)

    try {
      // QR — لا يوقف التسجيل إذا فشل
      let qrDataUrl = ''
      try {
        qrDataUrl = await QRCode.toDataURL(
          `${form.name.trim()}|${form.email.trim()}|${code}`,
          { width: 220, margin: 2, color: { dark: '#000000', light: '#ffffff' } }
        )
        setQrUrl(qrDataUrl)
      } catch { /* QR اختياري */ }

      // ضمان الاتصال بالشبكة قبل الكتابة
      await enableNetwork(db)

      await addDoc(collection(db, 'registrations'), {
        name:          form.name.trim(),
        email:         form.email.trim().toLowerCase(),
        phone:         form.phone,
        status:        form.status,
        statusOther:   form.statusOther || '',
        specialization:form.specialization || '',
        sector:        form.sector,
        workplace:     form.workplace.trim(),
        interests:     form.interests,
        notifications: form.notifications || '',
        attendance:    form.attendance,
        code,
        checkedIn: false,
        workshop1: false,
        workshop2: false,
        workshop3: false,
        createdAt: serverTimestamp(),
      })

      clearTimeout(timeoutId)
      setDone(true)
    } catch(e) {
      clearTimeout(timeoutId)
      console.error('Registration error:', e)
      const msg = e?.code === 'permission-denied'
        ? (ar ? 'غير مصرح بالتسجيل. تواصل مع الإدارة.' : 'Registration not permitted. Contact the team.')
        : (ar ? 'حدث خطأ أثناء حفظ التسجيل. يرجى المحاولة مرة أخرى.' : 'Unable to save registration. Please try again.')
      setSubmitError(msg)
    } finally {
      setLoading(false)
    }
  }

  const S = {
    wrap: { minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px,4vw,40px)', position: 'relative', overflow: 'hidden', fontFamily: "'Cairo',sans-serif", direction: ar ? 'rtl' : 'ltr' },
    glow: { position: 'fixed', top: 0, right: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(230,43,30,0.14) 0%,transparent 65%)', pointerEvents: 'none', zIndex: 0 },
    card: { background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 'clamp(24px,4vw,40px)', width: '100%', maxWidth: 580, position: 'relative', zIndex: 1 },
    label: { color: '#888', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' },
    hint: { color: '#555', fontSize: 11, marginBottom: 8, display: 'block', lineHeight: 1.5 },
    input: (e) => ({ width: '100%', background: '#0d0d0d', border: `1px solid ${e ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, color: '#fff', padding: '11px 14px', fontSize: 14, outline: 'none', fontFamily: "'Cairo',sans-serif", boxSizing: 'border-box', transition: 'border-color 0.2s' }),
    err: { color: '#ef4444', fontSize: 11, marginTop: 4, display: 'block' },
    field: { marginBottom: 16 },
    btnNext: { background: '#E62B1E', border: 'none', borderRadius: 12, color: '#fff', padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif", transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: 8 },
    btnBack: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#888', padding: '13px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" },
  }

  // SUCCESS
  if (done) return (
    <div style={S.wrap}>
      <div style={S.glow} />
      <div style={{ ...S.card, textAlign: 'center', maxWidth: 460 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#4ade8022', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#4ade80', margin: '0 auto 14px' }}>✓</div>
        <h2 style={{ color: '#4ade80', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{ar ? 'تم استلام طلبك!' : 'Request Received!'}</h2>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>{ar ? 'شكراً لتسجيلك في TEDx OKADH 2026. بطاقة الدخول الرقمية جاهزة أدناه.' : 'Thank you for registering. Your digital pass is ready below.'}</p>
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(230,43,30,0.2)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 2, marginBottom: 12 }}><span style={{ color: '#E62B1E' }}>TEDx</span><span style={{ color: '#fff' }}>OKADH</span></div>
          <p style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{form.name}</p>
          {qrUrl && <img src={qrUrl} alt="QR" style={{ width: 190, height: 190, borderRadius: 10, display: 'block', margin: '0 auto' }} />}
          <p style={{ color: '#E62B1E', fontSize: 11, fontWeight: 900, letterSpacing: 2, margin: '10px 0 4px' }}>{passCode}</p>
          <p style={{ color: '#555', fontSize: 12, marginBottom: 16 }}>{ar ? 'اعرض هذا الرمز عند بوابة الدخول' : 'Show this code at the entrance gate'}</p>
          <button onClick={() => { const a = document.createElement('a'); a.href = qrUrl; a.download = `${form.name.replace(/\s+/g, '_')}_TEDxOKADH.png`; a.click() }}
            style={{ background: '#E62B1E', border: 'none', borderRadius: 10, color: '#fff', padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
            ⬇ {ar ? 'تحميل البطاقة' : 'Download Pass'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#888', padding: '9px 20px', fontSize: 13, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
            {ar ? '← العودة للرئيسية' : '← Back to Home'}
          </button>
        </div>
      </div>
    </div>
  )

  const steps = ar ? STEPS_AR : STEPS_EN

  return (
    <div style={S.wrap}>
      <div style={S.glow} />
      <div style={S.card}>
        {/* Back to home */}
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Cairo',sans-serif" }}>
          {ar ? '← العودة' : '← Back'}
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4, fontFamily: "'Cairo',sans-serif" }}><span style={{ color: '#E62B1E' }}>TED</span><sup style={{ color: '#E62B1E', fontSize: 10 }}>x</sup><span style={{ color: '#fff' }}>OKADH</span></div>
          <p style={{ color: '#555', fontSize: 13 }}>{ar ? 'نموذج التسجيل — TEDx OKADH 2026' : 'Registration Form — TEDx OKADH 2026'}</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 0 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, background: i < step ? '#4ade80' : i === step ? '#E62B1E' : '#1a1a1a', color: i < step ? '#000' : '#fff', border: i > step ? '1px solid rgba(255,255,255,0.1)' : 'none', boxShadow: i === step ? '0 0 14px rgba(230,43,30,0.5)' : 'none' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i === step ? '#fff' : '#555', whiteSpace: 'nowrap', maxWidth: 80, textAlign: 'center', lineHeight: 1.3 }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? '#4ade8044' : 'rgba(255,255,255,0.08)', margin: '0 6px', marginBottom: 20 }} />}
            </div>
          ))}
        </div>

        {/* ===== STEP 0 ===== */}
        {step === 0 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{ar ? 'المعلومات الشخصية' : 'Personal Information'}</h2>

            <div style={S.field}>
              <label style={S.label}>{ar ? 'الاسم الثلاثي *' : 'Full Name (3 parts) *'}</label>
              <span style={S.hint}>{ar ? 'يرجى كتابة الاسم كما هو موضح في الهوية' : 'Please write your name as it appears on your ID'}</span>
              <input style={S.input(errors.name)} value={form.name} onChange={e => update('name', e.target.value)} placeholder={ar ? 'مثال: محمد أحمد الغامدي' : 'e.g. Mohammed Ahmad AlGhamdi'} />
              {errors.name && <span style={S.err}>{errors.name}</span>}
            </div>

            <div style={S.field}>
              <label style={S.label}>{ar ? 'البريد الإلكتروني *' : 'Email *'}</label>
              <span style={S.hint}>{ar ? 'يُكتب بالأحرف الإنجليزية فقط — مثال: name@domain.com' : 'English characters only — e.g. name@domain.com'}</span>
              <input style={S.input(errors.email)} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="name@domain.com" dir="ltr" />
              {errors.email && <span style={S.err}>{errors.email}</span>}
            </div>

            <div style={S.field}>
              <label style={S.label}>{ar ? 'رقم الهاتف *' : 'Phone Number *'}</label>
              <span style={S.hint}>{ar ? 'أدخل 10 أرقام — مثال: 0512345678' : '10 digits — e.g. 0512345678'}</span>
              <input style={S.input(errors.phone)} value={form.phone} onChange={e => update('phone', e.target.value.replace(/[^\d+\s-]/g, ''))} placeholder="0512345678" dir="ltr" />
              {errors.phone && <span style={S.err}>{errors.phone}</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={S.btnNext} onClick={next}>{ar ? 'التالي' : 'Next'} →</button>
            </div>
          </div>
        )}

        {/* ===== STEP 1 ===== */}
        {step === 1 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{ar ? 'الخلفية المهنية' : 'Professional Background'}</h2>

            {/* الحالة المهنية */}
            <div style={S.field}>
              <label style={S.label}>{ar ? 'الحالة المهنية / الوظيفية *' : 'Professional Status *'}</label>
              <span style={S.hint}>{ar ? 'اختر الأنسب' : 'Choose the most applicable'}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {statusOptions.map((opt, i) => (
                  <button key={i} type="button" onClick={() => { update('status', opt); if (opt !== (ar ? 'أخرى' : 'Other')) update('statusOther', '') }}
                    style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${form.status === opt ? '#E62B1E' : 'rgba(255,255,255,0.1)'}`, background: form.status === opt ? 'rgba(230,43,30,0.15)' : '#0d0d0d', color: form.status === opt ? '#E62B1E' : '#888', transition: 'all 0.2s', fontFamily: "'Cairo',sans-serif" }}>
                    {opt}
                  </button>
                ))}
              </div>
              {form.status === (ar ? 'أخرى' : 'Other') && (
                <input style={{ ...S.input(false), marginTop: 10 }} value={form.statusOther} onChange={e => update('statusOther', e.target.value)} placeholder={ar ? 'يرجى التوضيح...' : 'Please specify...'} />
              )}
              {errors.status && <span style={S.err}>{errors.status}</span>}
            </div>

            {/* الترخيص الإعلامي / التخصص */}
            {(form.status === (ar ? 'إعلامي' : 'Media')) && (
              <div style={S.field}>
                <label style={S.label}>{ar ? 'الترخيص الإعلامي' : 'Media License'}</label>
                <input style={S.input(false)} value={form.mediaLicense} onChange={e => update('mediaLicense', e.target.value)} placeholder={ar ? 'رقم الترخيص الإعلامي (اختياري)' : 'Media license number (optional)'} dir="ltr" />
              </div>
            )}

            {/* التخصص */}
            <div style={S.field}>
              <label style={S.label}>{ar ? 'التخصص الأكاديمي / المهني' : 'Academic / Professional Specialization'}</label>
              <span style={S.hint}>{ar ? 'يرجى تحديد تخصصك' : 'Please select your specialization'}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {specializationOptions.map((opt, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', border: `1px solid ${form.specialization === opt ? '#E62B1E' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, background: form.specialization === opt ? 'rgba(230,43,30,0.08)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
                    <input type="radio" name="specialization" value={opt} checked={form.specialization === opt} onChange={() => update('specialization', opt)} style={{ accentColor: '#E62B1E', width: 16, height: 16, flexShrink: 0 }} />
                    <span style={{ color: form.specialization === opt ? '#fff' : '#888', fontSize: 13 }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* القطاع */}
            <div style={S.field}>
              <label style={S.label}>{ar ? 'يرجى تحديد القطاع *' : 'Please Select Sector *'}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sectorOptions.map((opt, i) => (
                  <button key={i} type="button" onClick={() => update('sector', opt)}
                    style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${form.sector === opt ? '#E62B1E' : 'rgba(255,255,255,0.1)'}`, background: form.sector === opt ? 'rgba(230,43,30,0.15)' : '#0d0d0d', color: form.sector === opt ? '#E62B1E' : '#888', transition: 'all 0.2s', fontFamily: "'Cairo',sans-serif" }}>
                    {opt}
                  </button>
                ))}
              </div>
              {errors.sector && <span style={S.err}>{errors.sector}</span>}
            </div>

            {/* جهة العمل */}
            <div style={S.field}>
              <label style={S.label}>{ar ? 'جهة العمل أو الدراسة *' : 'Employer / University *'}</label>
              <input style={S.input(errors.workplace)} value={form.workplace} onChange={e => update('workplace', e.target.value)} placeholder={ar ? 'مثال: جامعة الطائف / وزارة التعليم' : 'e.g. Taif University / Ministry of Education'} />
              {errors.workplace && <span style={S.err}>{errors.workplace}</span>}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 8 }}>
              <button style={S.btnBack} onClick={back}>{ar ? '← السابق' : '← Back'}</button>
              <button style={S.btnNext} onClick={next}>{ar ? 'التالي' : 'Next'} →</button>
            </div>
          </div>
        )}

        {/* ===== STEP 2 ===== */}
        {step === 2 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{ar ? 'الاهتمامات والتأكيد' : 'Interests & Confirmation'}</h2>

            {/* الاهتمامات */}
            <div style={S.field}>
              <label style={S.label}>{ar ? 'ما المواضيع التي تهمك في الحدث؟' : 'What topics interest you at the event?'}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {interestOptions.map((opt, i) => (
                  <button key={i} type="button" onClick={() => toggleInterest(opt)}
                    style={{ padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${form.interests.includes(opt) ? '#E62B1E' : 'rgba(255,255,255,0.1)'}`, background: form.interests.includes(opt) ? 'rgba(230,43,30,0.15)' : '#0d0d0d', color: form.interests.includes(opt) ? '#E62B1E' : '#888', transition: 'all 0.2s', fontFamily: "'Cairo',sans-serif" }}>
                    {form.interests.includes(opt) ? '✓ ' : ''}{opt}
                  </button>
                ))}
              </div>
            </div>

            {/* الإشعارات */}
            <div style={S.field}>
              <label style={S.label}>{ar ? 'هل تود تلقي إشعارات عن النسخ المستقبلية لـ TEDx؟' : 'Would you like to receive notifications about future TEDx events?'}</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(ar ? ['نعم', 'لا'] : ['Yes', 'No']).map(opt => (
                  <button key={opt} type="button" onClick={() => update('notifications', opt)}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: `1px solid ${form.notifications === opt ? '#E62B1E' : 'rgba(255,255,255,0.1)'}`, background: form.notifications === opt ? 'rgba(230,43,30,0.15)' : '#0d0d0d', color: form.notifications === opt ? '#E62B1E' : '#888', transition: 'all 0.2s', fontFamily: "'Cairo',sans-serif" }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* تأكيد الحضور */}
            <div style={S.field}>
              <label style={S.label}>{ar ? 'تأكيد الحضور *' : 'Attendance Confirmation *'}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(ar ? ['مؤكد', 'غير متأكد'] : ['Confirmed', 'Not Sure']).map((opt, i) => {
                  const colors = { 0: '#4ade80', 1: '#f59e0b' }
                  const selected = form.attendance === opt
                  return (
                    <button key={i} type="button" onClick={() => update('attendance', opt)}
                      style={{ padding: '12px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: `1px solid ${selected ? colors[i] : 'rgba(255,255,255,0.08)'}`, background: selected ? `${colors[i]}15` : '#0d0d0d', color: selected ? colors[i] : '#888', transition: 'all 0.2s', fontFamily: "'Cairo',sans-serif", textAlign: ar ? 'right' : 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected ? colors[i] : 'rgba(255,255,255,0.2)'}`, background: selected ? colors[i] : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#000', flexShrink: 0 }}>
                        {selected ? '✓' : ''}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {errors.attendance && <span style={S.err}>{errors.attendance}</span>}
            </div>

            {/* ملخص البيانات */}
            <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ color: '#555', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{ar ? 'ملخص التسجيل' : 'Registration Summary'}</p>
              {[
                { l: ar ? 'الاسم' : 'Name', v: form.name },
                { l: ar ? 'البريد' : 'Email', v: form.email },
                { l: ar ? 'الحالة' : 'Status', v: form.status },
                { l: ar ? 'القطاع' : 'Sector', v: form.sector },
                { l: ar ? 'جهة العمل' : 'Workplace', v: form.workplace },
              ].filter(r => r.v).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: '#555', fontSize: 12 }}>{r.l}</span>
                  <span style={{ color: '#ccc', fontSize: 12, fontWeight: 600, maxWidth: '60%', textAlign: 'left', wordBreak: 'break-word' }}>{r.v}</span>
                </div>
              ))}
            </div>

            <p style={{ color: '#444', fontSize: 11, marginBottom: 16, lineHeight: 1.7 }}>
              {ar ? 'بالتسجيل فإنك توافق على شروط الحدث وميثاق الحضور الخاص بـ TEDx OKADH.' : 'By registering, you agree to the event terms and TEDx OKADH code of conduct.'}
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <button style={S.btnBack} onClick={back}>{ar ? '← السابق' : '← Back'}</button>
              <button style={{ ...S.btnNext, opacity: loading ? 0.7 : 1 }} onClick={submit} disabled={loading}>
                {loading
                  ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />{ar ? ' جارٍ الإرسال' : ' Sending'}</>
                  : <>{ar ? '🎉 تأكيد التسجيل' : '🎉 Confirm Registration'}</>
                }
              </button>
            </div>
            {submitError && <div style={{ color: '#ef4444', marginTop: 12, fontSize: 13 }}>{submitError}</div>}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}
