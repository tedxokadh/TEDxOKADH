import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, doc, updateDoc, getCountFromServer } from 'firebase/firestore'

const PASSWORD = 'tedx2026'

const T = {
  ar: {
    teamPage: 'صفحة الفريق', password: 'كلمة المرور', enter: 'دخول ←', wrongPw: 'كلمة المرور غلط',
    scanTitle: 'مسح QR / إدخال يدوي', clickCam: 'اضغط لتشغيل الكاميرا', startCam: '📷 تشغيل الكاميرا', stopCam: '✕ إيقاف',
    or: 'أو', search: 'بحث', scanPrompt: 'امسح QR أو أدخل رمز التسجيل', recentOps: '⏱ آخر العمليات', noOps: 'لا توجد عمليات بعد',
    stats: 'الإحصائيات', mainEvent: 'الحدث: ', w1: 'ورشة 1: ', w2: 'ورشة 2: ',
    notFound: '❌ لم يتم إيجاد هذا الرمز', mainLabel: 'الحدث الرئيسي', w1Label: 'ورشة الأولى', w2Label: 'ورشة الثانية',
    alreadyDone: (lbl) => `⚠️ سبق تسجيل ${lbl}`, checkedInMsg: (lbl, name) => `✅ تم تسجيل ${lbl} لـ ${name}`,
    mainBtn: '✅ الحدث الرئيسي', w1Btn: '🔵 ورشة العمل الأولى', w2Btn: '🟣 ورشة العمل الثانية',
    doneLbl: (lbl) => `✓ تم — ${lbl}`, camDenied: '❌ لم تسمح بالوصول للكاميرا — اضغط السماح في المتصفح',
    camNotFound: '❌ لم يتم إيجاد كاميرا على هذا الجهاز', camErr: (msg) => `❌ خطأ في الكاميرا: ${msg}`,
    camInitErr: '❌ خطأ في تهيئة الكاميرا', mainStat: 'الحدث', w1Stat: 'ورشة 1', w2Stat: 'ورشة 2',
    loading: 'جارٍ البحث...', dbErr: '❌ خطأ في الاتصال بالقاعدة',
  },
  en: {
    teamPage: 'Team Page', password: 'Password', enter: 'Enter →', wrongPw: 'Wrong password',
    scanTitle: 'QR Scan / Manual Entry', clickCam: 'Click to start camera', startCam: '📷 Start Camera', stopCam: '✕ Stop',
    or: 'or', search: 'Search', scanPrompt: 'Scan QR or enter registration code', recentOps: '⏱ Recent Operations', noOps: 'No operations yet',
    stats: 'Statistics', mainEvent: 'Event: ', w1: 'Workshop 1: ', w2: 'Workshop 2: ',
    notFound: '❌ Registration code not found', mainLabel: 'Main Event', w1Label: 'Workshop 1', w2Label: 'Workshop 2',
    alreadyDone: (lbl) => `⚠️ Already checked in: ${lbl}`, checkedInMsg: (lbl, name) => `✅ Checked in ${lbl} for ${name}`,
    mainBtn: '✅ Main Event', w1Btn: '🔵 Workshop 1', w2Btn: '🟣 Workshop 2',
    doneLbl: (lbl) => `✓ Done — ${lbl}`, camDenied: '❌ Camera access denied — click Allow in your browser',
    camNotFound: '❌ No camera found on this device', camErr: (msg) => `❌ Camera error: ${msg}`,
    camInitErr: '❌ Camera initialization error', mainStat: 'Event', w1Stat: 'Workshop 1', w2Stat: 'Workshop 2',
    loading: 'Searching...', dbErr: '❌ Database connection error',
  },
}

export default function ScannerPage({ lang = 'ar' }) {
  const L = T[lang] || T.ar
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState(false)
  const [scanInput, setScanInput] = useState('')
  const [scanned, setScanned] = useState(null)
  const [toast, setToast] = useState(null)
  const [history, setHistory] = useState([])
  const [counts, setCounts] = useState({ main: 0, w1: 0, w2: 0 })
  const [totalReg, setTotalReg] = useState(0)
  const [camActive, setCamActive] = useState(false)
  const [camErr, setCamErr] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const scannerRef = useRef(null)
  const inputRef = useRef(null)

  // Load counts from Firestore on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const snap = await getDocs(collection(db, 'registrations'))
        let m = 0, w1 = 0, w2 = 0
        snap.forEach(d => {
          const data = d.data()
          if (data.checkedIn) m++
          if (data.workshop1) w1++
          if (data.workshop2) w2++
        })
        setCounts({ main: m, w1, w2 })
        setTotalReg(snap.size)
      } catch (e) { console.error('Firestore counts error:', e) }
    }
    if (authed) fetchCounts()
  }, [authed])

  useEffect(() => () => stopCam(), [])

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const startCam = async () => {
    setCamErr('')
    await stopCam()
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const el = document.getElementById('qr-reader')
      if (!el) { setCamErr(L.camInitErr); return }
      const qr = new Html5Qrcode('qr-reader')
      scannerRef.current = qr
      const config = { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 }
      try {
        await qr.start({ facingMode: 'environment' }, config,
          (text) => { stopCam(); handleLookup(text.trim()) }, () => {})
      } catch {
        await qr.start({ facingMode: 'user' }, config,
          (text) => { stopCam(); handleLookup(text.trim()) }, () => {})
      }
      setCamActive(true)
    } catch (err) {
      const msg = err.name === 'NotAllowedError' ? L.camDenied
        : err.name === 'NotFoundError' ? L.camNotFound
        : L.camErr(err.message || err.name)
      setCamErr(msg)
      setCamActive(false)
      scannerRef.current = null
    }
  }

  const stopCam = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState?.()
        if (state && state !== 1) await scannerRef.current.stop()
      } catch (_) {}
      try { scannerRef.current.clear?.() } catch (_) {}
      scannerRef.current = null
    }
    setCamActive(false)
  }

  // Parse QR content: could be "name|email|CODE" or just "CODE"
  const parseCode = (raw) => {
    const parts = raw.split('|')
    return (parts.length === 3 ? parts[2] : raw).trim().toUpperCase()
  }

  const handleLookup = async (raw) => {
    const code = parseCode(raw)
    if (!code) return
    setLookupLoading(true)
    try {
      const q = query(collection(db, 'registrations'), where('code', '==', code))
      const snap = await getDocs(q)
      if (snap.empty) {
        showToast(L.notFound, 'error')
        setScanned(null)
      } else {
        const docSnap = snap.docs[0]
        setScanned({ docId: docSnap.id, ...docSnap.data() })
        setScanInput('')
        inputRef.current?.focus()
      }
    } catch (e) {
      showToast(L.dbErr, 'error')
      console.error(e)
    }
    setLookupLoading(false)
  }

  const handleCheckIn = async (type) => {
    if (!scanned) return
    const labels = { main: L.mainLabel, workshop1: L.w1Label, workshop2: L.w2Label }
    const fields = { main: 'checkedIn', workshop1: 'workshop1', workshop2: 'workshop2' }
    const f = fields[type]
    if (scanned[f]) { showToast(L.alreadyDone(labels[type]), 'warning'); return }
    try {
      const docRef = doc(db, 'registrations', scanned.docId)
      await updateDoc(docRef, { [f]: true })
      const time = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US')
      setHistory(prev => [{ name: scanned.name, action: labels[type], time }, ...prev.slice(0, 9)])
      setScanned(prev => ({ ...prev, [f]: true }))
      const countKey = type === 'main' ? 'main' : type === 'workshop1' ? 'w1' : 'w2'
      setCounts(prev => ({ ...prev, [countKey]: prev[countKey] + 1 }))
      showToast(L.checkedInMsg(labels[type], scanned.name), 'success')
    } catch (e) {
      showToast(L.dbErr, 'error')
      console.error(e)
    }
  }

  const Sbg = { minHeight: '100vh', background: '#080808', fontFamily: "'Cairo',sans-serif", direction: dir, position: 'relative', overflow: 'hidden' }

  if (!authed) return (
    <div style={Sbg}>
      <div style={S.glow} />
      <div style={{ ...S.card, maxWidth: 400, margin: '10vh auto 0', textAlign: 'center', gap: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={S.logo}><span style={{ color: '#e62b1e' }}>TEDx</span>OKADH</div>
        <div style={{ fontSize: 44 }}>🔐</div>
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{L.teamPage}</h2>
        <input className={pwErr ? 'shake' : ''} style={S.input} type="password" placeholder={L.password} value={pw}
          onChange={e => { setPw(e.target.value); setPwErr(false) }}
          onKeyDown={e => e.key === 'Enter' && (pw === PASSWORD ? setAuthed(true) : (setPwErr(true), setTimeout(() => setPwErr(false), 600)))}
        />
        <button style={S.btnRed} onClick={() => pw === PASSWORD ? setAuthed(true) : (setPwErr(true), setTimeout(() => setPwErr(false), 600))}>{L.enter}</button>
        {pwErr && <p style={{ color: '#ef4444', fontSize: 13 }}>{L.wrongPw}</p>}
      </div>
      <style>{sharedCSS}</style>
    </div>
  )

  return (
    <div style={Sbg}>
      <div style={S.glow} />
      <style>{sharedCSS}</style>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <header style={S.header}>
        <div style={S.logo}><span style={{ color: '#e62b1e' }}>TEDx</span>OKADH</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[{ dot: '#e62b1e', lbl: `${L.mainEvent}${counts.main}` }, { dot: '#3b82f6', lbl: `${L.w1}${counts.w1}` }, { dot: '#7c3aed', lbl: `${L.w2}${counts.w2}` }].map(p => (
            <div key={p.lbl} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '5px 14px', color: '#ccc', fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.dot, boxShadow: `0 0 6px ${p.dot}`, display: 'inline-block' }} />
              {p.lbl}
            </div>
          ))}
        </div>
        <div style={{ background: '#e62b1e20', color: '#e62b1e', border: '1px solid #e62b1e44', borderRadius: 8, padding: '5px 14px', fontSize: 13, fontWeight: 700 }}>TEDx</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, padding: '24px 28px' }}>
        {/* LEFT */}
        <div style={S.card}>
          <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{L.scanTitle}</h2>

          {/* Camera — qr-reader always in DOM */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: '100%', maxWidth: 320, position: 'relative' }}>
              <div id="qr-reader" style={{ width: '100%', borderRadius: 16, overflow: 'hidden', display: camActive ? 'block' : 'none' }} />
              {camActive && (
                <>
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 16 }}>
                    {['tl', 'tr', 'bl', 'br'].map(c => (
                      <div key={c} style={{ position: 'absolute', width: 24, height: 24, borderColor: '#e62b1e', borderStyle: 'solid', ...(c === 'tl' ? { top: 12, right: 12, borderWidth: '3px 0 0 3px' } : c === 'tr' ? { top: 12, left: 12, borderWidth: '3px 3px 0 0' } : c === 'bl' ? { bottom: 12, right: 12, borderWidth: '0 0 3px 3px' } : { bottom: 12, left: 12, borderWidth: '0 3px 3px 0' }) }} />
                    ))}
                    <div style={{ position: 'absolute', left: 12, right: 12, height: 2, background: 'linear-gradient(90deg,transparent,#e62b1e,transparent)', animation: 'scanLine 2s ease-in-out infinite', top: '50%' }} />
                  </div>
                  <button onClick={stopCam} style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, color: '#fff', padding: '6px 18px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 2 }}>{L.stopCam}</button>
                </>
              )}
              {!camActive && (
                <div style={{ height: 220, background: '#161616', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }} onClick={startCam}>
                  <span style={{ fontSize: 40, opacity: 0.35 }}>📷</span>
                  <p style={{ color: '#555', fontSize: 14 }}>{L.clickCam}</p>
                </div>
              )}
            </div>
            {camErr && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>{camErr}</p>}
            {!camActive && <button style={{ ...S.btnRed, maxWidth: 320, background: '#161616', border: '1px solid rgba(230,43,30,0.35)', color: '#e62b1e' }} onClick={startCam}>{L.startCam}</button>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#333', fontSize: 13, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span>{L.or}</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input ref={inputRef} style={{ ...S.input, flex: 1, fontSize: 16, letterSpacing: 2, textAlign: 'center' }} placeholder="TEDXOKADH-..."
              value={scanInput} onChange={e => setScanInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && (handleLookup(scanInput), setScanInput(''))} autoFocus dir="ltr" />
            <button style={{ ...S.btnRed, width: 'auto', padding: '12px 20px', fontSize: 14, opacity: lookupLoading ? 0.6 : 1 }}
              disabled={lookupLoading}
              onClick={() => { handleLookup(scanInput); setScanInput('') }}>
              {lookupLoading ? '...' : L.search}
            </button>
          </div>

          {scanned ? (
            <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.3s ease' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#e62b1e,#8b0000)', color: '#fff', fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {scanned.name?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 3 }}>{scanned.name}</p>
                  <p style={{ color: '#666', fontSize: 12, marginBottom: 2 }}>{scanned.email}</p>
                  <p style={{ color: '#555', fontSize: 11, marginBottom: 2 }}>{scanned.phone}</p>
                  <p style={{ color: '#e62b1e', fontSize: 10, letterSpacing: 1, marginTop: 4, direction: 'ltr', textAlign: 'left' }}>{scanned.code}</p>
                </div>
                <button onClick={() => { setScanned(null); setScanInput('') }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#666', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ f: 'checkedIn', l: L.mainStat, c: '#4ade80' }, { f: 'workshop1', l: L.w1Stat, c: '#60a5fa' }, { f: 'workshop2', l: L.w2Stat, c: '#a78bfa' }].map(b => (
                  <span key={b.f} style={{ padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600, background: scanned[b.f] ? `${b.c}15` : 'rgba(255,255,255,0.04)', color: scanned[b.f] ? b.c : '#555', border: `1px solid ${scanned[b.f] ? b.c + '33' : 'rgba(255,255,255,0.08)'}` }}>
                    {scanned[b.f] ? '✓' : '○'} {b.l}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { type: 'main', label: L.mainBtn, done: scanned.checkedIn, bg: '#e62b1e', lbl: L.mainLabel },
                  { type: 'workshop1', label: L.w1Btn, done: scanned.workshop1, bg: '#1d4ed8', lbl: L.w1Label },
                  { type: 'workshop2', label: L.w2Btn, done: scanned.workshop2, bg: '#6d28d9', lbl: L.w2Label },
                ].map(b => (
                  <button key={b.type} onClick={() => handleCheckIn(b.type)} disabled={b.done}
                    style={{ padding: '13px', border: b.done ? '1px solid rgba(255,255,255,0.08)' : 'none', borderRadius: 12, background: b.done ? '#1e1e1e' : b.bg, color: b.done ? '#555' : '#fff', fontSize: 14, fontWeight: 700, cursor: b.done ? 'not-allowed' : 'pointer', opacity: b.done ? 0.5 : 1, fontFamily: "'Cairo',sans-serif" }}>
                    {b.done ? L.doneLbl(b.lbl) : b.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 36, color: '#444', fontSize: 14, border: '2px dashed rgba(255,255,255,0.05)', borderRadius: 14 }}>
              <span style={{ fontSize: 36, opacity: 0.3 }}>👤</span>
              <p>{L.scanPrompt}</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ ...S.card, gap: 16 }}>
          <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>{L.recentOps}</h2>
          {history.length === 0
            ? <p style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>{L.noOps}</p>
            : history.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#161616', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 10, animation: 'fadeUp 0.3s ease' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(230,43,30,0.15)', color: '#e62b1e', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{h.name?.[0]}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#ccc', fontSize: 13, fontWeight: 700 }}>{h.name}</p>
                  <p style={{ color: '#555', fontSize: 11 }}>{h.action}</p>
                </div>
                <span style={{ color: '#444', fontSize: 11, whiteSpace: 'nowrap' }}>{h.time}</span>
              </div>
            ))
          }
          <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
            <p style={{ color: '#666', fontSize: 12, fontWeight: 700 }}>{L.stats}</p>
            {[{ l: L.mainStat, v: counts.main, c: '#e62b1e' }, { l: L.w1Stat, v: counts.w1, c: '#3b82f6' }, { l: L.w2Stat, v: counts.w2, c: '#7c3aed' }].map(s => (
              <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#555', fontSize: 12, width: 60, textAlign: dir === 'rtl' ? 'right' : 'left' }}>{s.l}</span>
                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: s.c, width: `${totalReg ? (s.v / totalReg) * 100 : 0}%`, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ color: '#555', fontSize: 12, width: 40, textAlign: 'left' }}>{s.v}/{totalReg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const S = {
  glow: { position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, background: 'radial-gradient(ellipse at top,rgba(230,43,30,0.12) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  logo: { fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 1 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 10, flexWrap: 'wrap', gap: 10 },
  card: { background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 },
  input: { width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', padding: '12px 16px', fontSize: 15, outline: 'none', fontFamily: "'Cairo',sans-serif" },
  btnRed: { width: '100%', background: '#e62b1e', border: 'none', borderRadius: 12, color: '#fff', padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" },
}

const sharedCSS = `
  @keyframes scanLine { 0%{top:12px;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:calc(100% - 12px);opacity:0} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .toast { position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 28px;border-radius:50px;font-size:14px;font-weight:700;z-index:9999;white-space:nowrap;animation:toastIn 0.3s ease; }
  .toast-success{background:#052e16;color:#4ade80;border:1px solid #4ade8044}
  .toast-error{background:#1f0000;color:#ef4444;border:1px solid #ef444444}
  .toast-warning{background:#1c1000;color:#f59e0b;border:1px solid #f59e0b44}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  .shake{animation:shake 0.4s ease}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
  #qr-reader{border-radius:12px;overflow:hidden}
  #qr-reader video{border-radius:12px!important;width:100%!important}
  #qr-reader__header_message{display:none!important}
  #qr-reader__status_span{display:none!important}
`
