import { useState } from 'react'

const mockDB = {
  'REG-ABC123': { name:'محمد العتيبي', email:'m@example.com', phone:'0501234567', city:'الطائف', checkedIn:false, workshop1:false, workshop2:false },
  'REG-XYZ456': { name:'سارة الغامدي', email:'s@example.com', phone:'0507654321', city:'جدة', checkedIn:true, workshop1:false, workshop2:false },
  'REG-QRS789': { name:'فيصل الشمري', email:'f@example.com', phone:'0509876543', city:'الرياض', checkedIn:false, workshop1:true, workshop2:false },
  'REG-LMN321': { name:'نورة الزهراني', email:'n@example.com', phone:'0503456789', city:'الطائف', checkedIn:true, workshop1:true, workshop2:true },
}

const PASSWORD = 'tedxadmin2026'

export default function DashboardPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  const total = Object.keys(mockDB).length
  const checkedIn = Object.values(mockDB).filter(p=>p.checkedIn).length
  const w1 = Object.values(mockDB).filter(p=>p.workshop1).length
  const w2 = Object.values(mockDB).filter(p=>p.workshop2).length

  if (!authed) return (
    <div style={S.bg}>
      <div style={S.glow}/>
      <div style={{...S.card,maxWidth:400,margin:'10vh auto 0',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
        <div style={{fontSize:44}}>📊</div>
        <h2 style={{color:'#fff',fontSize:22,fontWeight:700}}>لوحة التحكم</h2>
        <input style={S.input} type="password" placeholder="كلمة مرور الأدمن" value={pw} onChange={e=>{setPw(e.target.value);setErr('')}}
          onKeyDown={e=>e.key==='Enter'&&(pw===PASSWORD?setAuthed(true):setErr('كلمة المرور غلط'))}/>
        <button style={S.btnRed} onClick={()=>pw===PASSWORD?setAuthed(true):setErr('كلمة المرور غلط')}>دخول ←</button>
        {err && <p style={{color:'#ef4444',fontSize:13}}>{err}</p>}
      </div>
    </div>
  )

  return (
    <div style={S.bg}>
      <div style={S.glow}/>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'32px 24px',position:'relative',zIndex:1}}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{color:'#fff',fontSize:28,fontWeight:900,marginBottom:4}}>
              <span style={{color:'#e62b1e'}}>TEDx</span>Okadh — لوحة التحكم
            </h1>
            <p style={{color:'#555',fontSize:14}}>إحصائيات الحضور الكاملة</p>
          </div>
          <button onClick={()=>setAuthed(false)} style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#888',padding:'8px 20px',fontSize:13,cursor:'pointer'}}>تسجيل خروج</button>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:32}}>
          {[
            {label:'إجمالي المسجلين',val:total,color:'#fff',border:'rgba(255,255,255,0.15)'},
            {label:'حضروا الحدث',val:checkedIn,color:'#e62b1e',border:'rgba(230,43,30,0.3)'},
            {label:'ورشة العمل الأولى',val:w1,color:'#3b82f6',border:'rgba(59,130,246,0.3)'},
            {label:'ورشة العمل الثانية',val:w2,color:'#7c3aed',border:'rgba(124,58,237,0.3)'},
          ].map(s=>(
            <div key={s.label} style={{background:'#111',border:`1px solid ${s.border}`,borderRadius:16,padding:24,textAlign:'center'}}>
              <div style={{fontSize:52,fontWeight:900,color:s.color,lineHeight:1}}>{s.val}</div>
              <div style={{color:'#666',fontSize:13,marginTop:8}}>{s.label}</div>
              <div style={{height:3,background:'rgba(255,255,255,0.05)',borderRadius:2,marginTop:12,overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:2,background:s.color,width:`${total?(s.val/total)*100:0}%`,transition:'width 0.5s ease'}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{background:'#111',border:'1px solid rgba(255,255,255,0.07)',borderRadius:20,overflow:'hidden'}}>
          <div style={{padding:'20px 24px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            <h2 style={{color:'#fff',fontSize:17,fontWeight:700}}>قائمة المسجلين</h2>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#161616'}}>
                  {['الاسم','الإيميل','المدينة','الحدث','ورشة 1','ورشة 2'].map(h=>(
                    <th key={h} style={{padding:'12px 16px',color:'#666',fontSize:13,fontWeight:600,textAlign:'right',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(mockDB).map(([id,p])=>(
                  <tr key={id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td style={{padding:'14px 16px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#e62b1e,#8b0000)',color:'#fff',fontSize:13,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{p.name[0]}</div>
                        <div>
                          <p style={{color:'#fff',fontSize:13,fontWeight:700}}>{p.name}</p>
                          <p style={{color:'#555',fontSize:11}}>{id}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'14px 16px',color:'#888',fontSize:13}}>{p.email}</td>
                    <td style={{padding:'14px 16px',color:'#888',fontSize:13}}>{p.city}</td>
                    {[p.checkedIn,p.workshop1,p.workshop2].map((v,i)=>(
                      <td key={i} style={{padding:'14px 16px',textAlign:'right'}}>
                        <span style={{background:v?'#4ade8015':'rgba(255,255,255,0.04)',color:v?'#4ade80':'#555',border:`1px solid ${v?'#4ade8033':'rgba(255,255,255,0.08)'}`,borderRadius:50,padding:'3px 12px',fontSize:12,fontWeight:700}}>
                          {v?'✓ حضر':'✗ غائب'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const S = {
  bg: { minHeight:'100vh', background:'#080808', fontFamily:"'Cairo',sans-serif", direction:'rtl', position:'relative', overflow:'hidden' },
  glow: { position:'fixed', top:0, left:'50%', transform:'translateX(-50%)', width:700, height:350, background:'radial-gradient(ellipse at top,rgba(230,43,30,0.12) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  card: { background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:24, padding:'40px 36px', position:'relative', zIndex:1 },
  input: { width:'100%', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, color:'#fff', padding:'13px 16px', fontSize:15, outline:'none' },
  btnRed: { width:'100%', background:'#e62b1e', border:'none', borderRadius:12, color:'#fff', padding:'13px', fontSize:16, fontWeight:700, cursor:'pointer' },
}
