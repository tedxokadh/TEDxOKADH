import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore'

export default function ConfirmPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | already | error

  useEffect(() => {
    if (!code) { setStatus('error'); return }

    async function confirm() {
      try {
        const q = query(collection(db, 'registrations'), where('code', '==', decodeURIComponent(code)))
        const snap = await getDocs(q)

        if (snap.empty) { setStatus('error'); return }

        const docRef = snap.docs[0].ref
        const data = snap.docs[0].data()

        if (data.attendanceConfirmed) { setStatus('already'); return }

        await updateDoc(docRef, {
          attendanceConfirmed: true,
          confirmedAt: serverTimestamp(),
        })

        setStatus('success')
      } catch (e) {
        console.error(e)
        setStatus('error')
      }
    }

    confirm()
  }, [code])

  const wrap = {
    minHeight: '100vh',
    background: '#080808',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'Arial, sans-serif',
  }

  const card = {
    background: '#111',
    border: '1px solid #222',
    borderRadius: 14,
    padding: '48px 40px',
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
  }

  if (status === 'loading') return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ width: 40, height: 40, border: '3px solid #222', borderTopColor: '#E62B1E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
        <p style={{ color: '#666', fontSize: 14 }}>Verifying your registration...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (status === 'success') return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 20px' }}>✓</div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>
          <span style={{ color: '#E62B1E' }}>TED</span><sup style={{ color: '#E62B1E', fontSize: 12 }}>x</sup><span style={{ color: '#fff' }}>OKADH</span>
        </div>
        <h2 style={{ color: '#4ade80', fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>Attendance Confirmed</h2>
        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.8, margin: '0 0 28px' }}>
          Thank you for confirming. We look forward to seeing you at TEDxOkadh on <strong style={{ color: '#ccc' }}>May 15–16, 2026</strong>.
        </p>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid #333', borderRadius: 8, color: '#888', padding: '10px 24px', fontSize: 13, cursor: 'pointer' }}>
          ← Back to Home
        </button>
      </div>
    </div>
  )

  if (status === 'already') return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 20px' }}>✓</div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>
          <span style={{ color: '#E62B1E' }}>TED</span><sup style={{ color: '#E62B1E', fontSize: 12 }}>x</sup><span style={{ color: '#fff' }}>OKADH</span>
        </div>
        <h2 style={{ color: '#f59e0b', fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>Already Confirmed</h2>
        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.8, margin: '0 0 28px' }}>
          Your attendance has already been confirmed. See you at TEDxOkadh!
        </p>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid #333', borderRadius: 8, color: '#888', padding: '10px 24px', fontSize: 13, cursor: 'pointer' }}>
          ← Back to Home
        </button>
      </div>
    </div>
  )

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 20px' }}>✗</div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>
          <span style={{ color: '#E62B1E' }}>TED</span><sup style={{ color: '#E62B1E', fontSize: 12 }}>x</sup><span style={{ color: '#fff' }}>OKADH</span>
        </div>
        <h2 style={{ color: '#ef4444', fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>Link Not Found</h2>
        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.8, margin: '0 0 28px' }}>
          This confirmation link is invalid or expired. Please contact us at <a href="mailto:tedxokadh1@gmail.com" style={{ color: '#E62B1E' }}>tedxokadh1@gmail.com</a>.
        </p>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid #333', borderRadius: 8, color: '#888', padding: '10px 24px', fontSize: 13, cursor: 'pointer' }}>
          ← Back to Home
        </button>
      </div>
    </div>
  )
}
