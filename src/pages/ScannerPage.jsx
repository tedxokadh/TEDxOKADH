import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { db } from '../firebase'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'

const PASSWORD = 'tedx2026'

const T = {
  ar: {
    teamPage: 'صفحة الفريق', password: 'كلمة المرور', enter: 'دخول ←', wrongPw: 'كلمة المرور غلط',
    scanTitle: 'مسح QR / إدخال يدوي', clickCam: 'اضغط لتشغيل الكاميرا', startCam: '📷 تشغيل الكاميرا', stopCam: '✕ إيقاف',
    or: 'أو', search: 'بحث', scanPrompt: 'امسح QR أو أدخل رمز التسجيل', recentOps: '⏱ آخر العمليات', noOps: 'لا توجد عمليات بعد',
    stats: 'الإحصائيات', mainEvent: 'الدخول: ', w1: 'ورشة أ: ', w2: 'ورشة ب: ', w3: 'ورشة ج: ',
    notFound: '❌ لم يتم إيجاد هذا الرمز',
    mainLabel: 'الدخول', w1Label: 'ورشة أ', w2Label: 'ورشة ب', w3Label: 'ورشة ج',
    alreadyDone: (lbl) => `⚠️ سبق تسجيل ${lbl}`,
    checkedInMsg: (lbl, name) => `✅ تم تسجيل ${lbl} لـ ${name}`,
    mainBtn: '✅ دخول الحدث', w1Btn: '🔵 ورشة أ', w2Btn: '🟣 ورشة ب', w3Btn: '🟢 ورشة ج',
    doneLbl: (lbl) => `✓ تم — ${lbl}`,
    camDenied: '❌ لم تسمح بالوصول للكاميرا — اضغط السماح في المتصفح',
    camNotFound: '❌ لم يتم إيجاد كاميرا على هذا الجهاز',
    camErr: (msg) => `❌ خطأ في الكاميرا: ${msg}`,
    camInitErr: '❌ خطأ في تهيئة الكاميرا',
    mainStat: 'الدخول', w1Stat: 'ورشة أ', w2Stat: 'ورشة ب', w3Stat: 'ورشة ج',
    loading: 'جارٍ البحث...', dbErr: '❌ خطأ في الاتصال بالقاعدة',
  },
  en: {
    teamPage: 'Team Page', password: 'Password', enter: 'Enter →', wrongPw: 'Wrong password',
    scanTitle: 'QR Scan / Manual Entry', clickCam: 'Click to start camera', startCam: '📷 Start Camera', stopCam: '✕ Stop',
    or: 'or', search: 'Search', scanPrompt: 'Scan QR or enter registration code', recentOps: '⏱ Recent Operations', noOps: 'No operations yet',
    stats: 'Statistics', mainEvent: 'Entry: ', w1: 'WS A: ', w2: 'WS B: ', w3: 'WS C: ',
    notFound: '❌ Registration code not found',
    mainLabel: 'Entry', w1Label: 'Workshop A', w2Label: 'Workshop B', w3Label: 'Workshop C',
    alreadyDone: (lbl) => `⚠️ Already checked in: ${lbl}`,
    checkedInMsg: (lbl, name) => `✅ Checked in ${lbl} for ${name}`,
    mainBtn: '✅ Entry', w1Btn: '🔵 Workshop A', w2Btn: '🟣 Workshop B', w3Btn: '🟢 Workshop C',
    doneLbl: (lbl) => `✓ Done — ${lbl}`,
    camDenied: '❌ Camera access denied — click Allow in your browser',
    camNotFound: '❌ No camera found on this device',
    camErr: (msg) => `❌ Camera error: ${msg}`,
    camInitErr: '❌ Camera initialization error',
    mainStat: 'Entry', w1Stat: 'WS A', w2Stat: 'WS B', w3Stat: 'WS C',
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
  const [counts, setCounts] = useState({ main: 0, w1: 0, w2: 0, w3: 0 })
  const [totalReg, setTotalReg] = useState(0)
  const [camActive, setCamActive] = useState(false)
  const [camErr, setCamErr] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const scannerRef = useRef(null)
  const inputRef = useRef(null)
  const scanLockRef = useRef(false)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const snap = await getDocs(collection(db, 'registrations'))
        let m = 0, w1 = 0, w2 = 0, w3 = 0
        snap.forEach(d => {
          const data = d.data()
          if (data.checkedIn) m++
          if (data.workshop1) w1++
          if (data.workshop2) w2++
          if (data.workshop3) w3++
        })
        setCounts({ main: m, w1, w2, w3 })
        setTotalReg(snap.size)
      } catch (e) { console.error('Firestore counts error:', e) }
    }
    if (authed) fetchCounts()
  }, [authed])

  useEffect(() => () => { stopCam() }, [])

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const startCam = async () => {
    setCamErr('')
    await stopCam()
    try {
      const el = document.getElementById('qr-reader')
      if (!el) { setCamErr(L.camInitErr); return }
      el.innerHTML = ''
      const qr = new Html5Qrcode('qr-reader', { verbose: false })
      scannerRef.current = qr
      const config = { fps: 10, qrbox: { width: 250, height: 250 } }
      const onSuccess = (text) => {
        if (scanLockRef.current) return
        scanLockRef.current = true
        stopCam()
        handleLookup(text.trim())
        setTimeout(() => { scanLockRef.current = false }, 3000)
      }
      try {
        await qr.start({ facingMode: 'environment' }, config, onSuccess, () => {})
      } catch {
        await qr.start({ facingMode: 'user' }, config, onSuccess, () => {})
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

  const parseCode = (raw) => {
    const cleaned = raw.trim()
    const parts = cleaned.split('|')
    const code = parts.length >= 3 ? parts[parts.length - 1] : cleaned
    return code.trim().toUpperCase().replace(/\s+/g, '')
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
    const labels = { main: L.mainLabel, workshop1: L.w1Label, workshop2: L.w2Label, workshop3: L.w3Label }
    const fields = { main: 'checkedIn', workshop1: 'workshop1', workshop2: 'workshop2', workshop3: 'workshop3' }
    const f = fields[type]
    if (scanned[f]) { showToast(L.alreadyDone(labels[type]), 'warning'); return }
    try {
      const docRef = doc(db, 'registrations', scanned.docId)
      await updateDoc(docRef, { [f]: true })
      const time = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US')
      setHistory(prev => [{ name: scanned.name, action: labels[type], time }, ...prev.slice(0, 9)])
      setScanned(prev => ({ ...prev, [f]: true }))
      const countKey = type === 'main' ? 'main' : type === 'workshop1' ? 'w1' : type === 'workshop2' ? 'w2' : 'w3'
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
        <div style={{ background: '#e62b1e20', color: '#e62b1e', border: '1px solid #e62b1e44', borderRadius: 8, padding: '5px 14px', fontSize: 13, fontWeight: 700 }}>TEDx</div>
      </header>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          { dot: '#e62b1e', lbl: `${L.mainEvent}${counts.main}` },
          { dot: '#3b82f6', lbl: `${L.w1}${counts.w1}` },
          { dot: '#7c3aed', lbl: `${L.w2}${counts.w2}` },
          { dot: '#16a34a', lbl: `${L.w3}${counts.w3}` },
        ].map(p => (
          <div key={p.lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 50, padding: '4px 12px', color: '#ccc', fontSize: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.dot, display: 'inline-block', flexShrink: 0 }} />
            {p.lbl}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Scanner card */}
        <div style={S.card}>
          <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{L.scanTitle}</h2>

          <div style={{ position: 'relative', width: '100%' }}>
            <div id="qr-reader" style={{ width: '100%', borderRadius: 14, overflow: 'hidden', display: camActive ? 'block' : 'none' }} />
            {camActive && (
              <button onClick={stopCam} style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, color: '#fff', padding: '6px 18px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 10 }}>{L.stopCam}</button>
            )}
            {!camActive && (
              <div style={{ height: 200, background: '#161616', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }} onClick={startCam}>
                <span style={{ fontSize: 38, opacity: 0.35 }}>📷</span>
                <p style={{ color: '#555', fontSize: 13 }}>{L.clickCam}</p>
              </div>
            )}
          </div>

          {camErr && <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>{camErr}</p>}
          {!camActive && (
            <button style={{ ...S.btnRed, background: '#161616', border: '1px solid rgba(230,43,30,0.35)', color: '#e62b1e' }} onClick={startCam}>{L.startCam}</button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#333', fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span>{L.or}</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input ref={inputRef} style={{ ...S.input, flex: 1, fontSize: 14, letterSpacing: 1, textAlign: 'center' }} placeholder="TEDXOKADH-..."
              value={scanInput} onChange={e => setScanInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && (handleLookup(scanInput), setScanInput(''))} dir="ltr" />
            <button style={{ ...S.btnRed, width: 'auto', padding: '12px 18px', fontSize: 14, opacity: lookupLoading ? 0.6 : 1 }}
              disabled={lookupLoading}
              onClick={() => { handleLookup(scanInput); setScanInput('') }}>
              {lookupLoading ? '...' : L.search}
            </button>
          </div>
        </div>

        {/* Scanned result */}
        {scanned ? (
          <div style={{ ...S.card, gap: 14, animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#e62b1e,#8b0000)', color: '#fff', fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {scanned.name?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{scanned.name}</p>
                <p style={{ color: '#666', fontSize: 12, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scanned.email}</p>
                <p style={{ color: '#e62b1e', fontSize: 10, letterSpacing: 1, marginTop: 3, direction: 'ltr', textAlign: 'left' }}>{scanned.code}</p>
              </div>
              <button onClick={() => { setScanned(null); setScanInput('') }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#666', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { f: 'checkedIn', l: L.mainStat, c: '#4ade80' },
                { f: 'workshop1', l: L.w1Stat, c: '#60a5fa' },
                { f: 'workshop2', l: L.w2Stat, c: '#a78bfa' },
                { f: 'workshop3', l: L.w3Stat, c: '#4ade80' },
              ].map(b => (
                <span key={b.f} style={{ padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600, background: scanned[b.f] ? `${b.c}15` : 'rgba(255,255,255,0.04)', color: scanned[b.f] ? b.c : '#555', border: `1px solid ${scanned[b.f] ? b.c + '33' : 'rgba(255,255,255,0.08)'}` }}>
                  {scanned[b.f] ? '✓' : '○'} {b.l}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { type: 'main',      label: L.mainBtn, done: scanned.checkedIn,  bg: '#e62b1e', lbl: L.mainLabel },
                { type: 'workshop1', label: L.w1Btn,   done: scanned.workshop1,  bg: '#1d4ed8', lbl: L.w1Label },
                { type: 'workshop2', label: L.w2Btn,   done: scanned.workshop2,  bg: '#6d28d9', lbl: L.w2Label },
                { type: 'workshop3', label: L.w3Btn,   done: scanned.workshop3,  bg: '#15803d', lbl: L.w3Label },
              ].map(b => (
                <button key={b.type} onClick={() => handleCheckIn(b.type)} disabled={b.done}
                  style={{ padding: '13px', border: b.done ? '1px solid rgba(255,255,255,0.08)' : 'none', borderRadius: 12, background: b.done ? '#1e1e1e' : b.bg, color: b.done ? '#555' : '#fff', fontSize: 14, fontWeight: 700, cursor: b.done ? 'not-allowed' : 'pointer', opacity: b.done ? 0.5 : 1, fontFamily: "'Cairo',sans-serif" }}>
                  {b.done ? L.doneLbl(b.lbl) : b.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 28, color: '#444', fontSize: 13, border: '2px dashed rgba(255,255,255,0.05)', borderRadius: 14 }}>
            <span style={{ fontSize: 32, opacity: 0.3 }}>👤</span>
            <p>{L.scanPrompt}</p>
          </div>
        )}

        {/* Recent ops */}
        <div style={S.card}>
          <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{L.recentOps}</h2>
          {history.length === 0
            ? <p style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>{L.noOps}</p>
            : history.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#161616', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 12px', animation: 'fadeUp 0.3s ease' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(230,43,30,0.15)', color: '#e62b1e', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{h.name?.[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#ccc', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</p>
                  <p style={{ color: '#555', fontSize: 11 }}>{h.action}</p>
                </div>
                <span style={{ color: '#444', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>{h.time}</span>
              </div>
            ))
          }
        </div>

        {/* Stats */}
        <div style={{ ...S.card, marginBottom: 24 }}>
          <p style={{ color: '#666', fontSize: 13, fontWeight: 700 }}>{L.stats}</p>
          {[
            { l: L.mainStat, v: counts.main, c: '#e62b1e' },
            { l: L.w1Stat,   v: counts.w1,   c: '#3b82f6' },
            { l: L.w2Stat,   v: counts.w2,   c: '#7c3aed' },
            { l: L.w3Stat,   v: counts.w3,   c: '#16a34a' },
          ].map(s => (
            <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#555', fontSize: 12, width: 55, flexShrink: 0 }}>{s.l}</span>
              <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: s.c, width: `${totalReg ? (s.v / totalReg) * 100 : 0}%`, transition: 'width 0.5s ease' }} />
              </div>
              <span style={{ color: '#555', fontSize: 12, width: 36, textAlign: 'left', flexShrink: 0 }}>{s.v}/{totalReg}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

const S = {
  glow: { position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, background: 'radial-gradient(ellipse at top,rgba(230,43,30,0.12) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  logo: { fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 1 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 10 },
  card: { background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 },
  input: { width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff', padding: '12px 16px', fontSize: 15, outline: 'none', fontFamily: "'Cairo',sans-serif", boxSizing: 'border-box' },
  btnRed: { width: '100%', background: '#e62b1e', border: 'none', borderRadius: 12, color: '#fff', padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo',sans-serif" },
}

const sharedCSS = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .toast { position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 28px;border-radius:50px;font-size:14px;font-weight:700;z-index:9999;white-space:nowrap;animation:toastIn 0.3s ease; }
  .toast-success{background:#052e16;color:#4ade80;border:1px solid #4ade8044}
  .toast-error{background:#1f0000;color:#ef4444;border:1px solid #ef444444}
  .toast-warning{background:#1c1000;color:#f59e0b;border:1px solid #f59e0b44}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  .shake{animation:shake 0.4s ease}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
  #qr-reader { border-radius:14px; overflow:hidden; background:#000; }
  #qr-reader * { box-sizing:border-box; }
  #qr-reader video { width:100%!important; height:auto!important; border-radius:14px!important; display:block!important; }
  #qr-reader canvas { display:none!important; }
  #qr-reader img { display:none!important; }
  #qr-reader__second_region { display:none!important; }
  #qr-reader__dashboard { display:none!important; }
  #qr-reader__header_message { display:none!important; }
  #qr-reader__status_span { display:none!important; }
  #qr-reader__scan_region canvas { display:none!important; }
  #qr-reader__scan_region img { display:none!important; }
`
