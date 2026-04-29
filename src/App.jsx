import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Splide from '@splidejs/splide'
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll'
import '@splidejs/splide/css/core'
import QRCode from 'qrcode'
import ScannerPage from './pages/ScannerPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import RegistrationPage from './pages/RegistrationPage.jsx'
import VIPRegistrationPage from './pages/VIPRegistrationPage.jsx'
import ConfirmPage from './pages/ConfirmPage.jsx'

// =============================================
// DATA
// =============================================
const I18N = {
  ar: {
    nav: { about:"عن TEDx", speakers:"المتحدثون", agenda:"الأجندة", register:"التسجيل", contact:"تواصل" },
    cta: "سجّل الآن",
    hero: {
      title: "أثـــر يمتد",
      sub: "حيث ينبعثُ الإرثُ ليرسمَ ملامحَ المستقبل",
      desc: "نستحضر روح سوق عكاظ التاريخي في ليلتين من الأفكار الجريئة، نجمع أصواتًا من السعودية والعالم العربي لتُلقي على مسرح TEDx ما لم يُقل من قبل.",
      tickets: "احجز تذكرتك", agenda: "استعرض الأجندة",
      dateVal: "١٥-١٦ مايو ٢٠٢٦", timeVal: "٤:٠٠ م — ١٠:٠٠ م", city: "فندق أنتركونتيننتال الطائف",
    },
    count: { d:"يوم", h:"ساعة", m:"دقيقة", s:"ثانية" },
    about: {
      eyebrow: "عن الفعالية",
      stats: [{n:"١٠",unit:"متحدث"},{n:"١٬٠٠٠",unit:"حاضر"},{n:"٦",unit:"ساعات"},{n:"٢",unit:"ليلتان"}],
      col1Title: "ما هو تيد؟",
      col1p1: "TED هو مؤتمر يُقام حول العالم، ويهتم بنشر الأفكار التي تستحق التقدير والاهتمام في مجالات متعددة. كانت بداية TED في عام 1984م في مجالات التقنية والتصميم والترفيه.",
      col1Abbr: "TED = Technology, Entertainment, Design",
      col1p2: "ثم أصبح يغطي جميع مجالات الحياة، من العلوم إلى الأعمال ومنها إلى القضايا العالمية بأكثر من 100 لغة.",
      col1p3: "أما تيدكس TEDx فهو ينظم بشكل مستقل للمساهمة في نشر الأفكار المجتمعية حول العالم.",
      col3Title: "تيدكس عكاظ",
      col3body: "تُعد منصة TEDxOkadh حدثًا فكريًا وثقافيًا مُستقلًا يُقام بترخيص من منظمة TED العالمية، مستلهمًا روحه من إرث \"سوق عكاظ\" التاريخي ليكون جسرًا يربط بين أصالة الماضي وابتكارات المستقبل. يهدف الحدث إلى تسليط الضوء على الأفكار التي تستحق الانتشار عبر استضافة نخبة من المبدعين والمتحدثين في مجالات متنوعة لتوفير بيئة محفزة تبرز الطاقات الوطنية وتساهم في إثراء المحتوى المعرفي بما يتواكب مع رؤية المملكة الطموحة.",
    },
    speakers: { eyebrow:"متحدثوا ٢٠٢٦", title:"تعرّف على المتحدثين", lead:"عشرةُ أصوات من مجالاتٍ مختلفة، كلٌّ منهم يقف على المسرح ليقول فكرةً واحدةً تستحق الانتشار.", more:"عرض الملف" },
    agenda: { eyebrow:"أجندة الفعالية", lead:"ستّ ساعات من الأفكار، موزّعة على ثلاث جلسات، تتخللها استراحات وعروض فنية.", day1Title:"اليوم الأول · الجمعة", day1Date:"١٥ مايو ٢٠٢٦", day2Title:"اليوم الثاني · السبت", day2Date:"١٦ مايو ٢٠٢٦", openLabel:"عرض الجدول", closeLabel:"إخفاء الجدول" },
    sponsors: { eyebrow:"الرعاة والشركاء", title:"رعاتنا وشركاؤنا" },
    moments: {
      eyebrow:"لحظاتنا",
      title:"لحظاتنا مع TEDxOkadh",
      lead:"بدأنا من ٥٥٠+ مشارك، أمّا اليوم فنحنُ نكتب فصلًا جديدًا من التميّز..\nنرتقي هذا العام إلى تجربة من مستوى جديد كليّا مع توقعات تتخطى حاجز ١٢٬٠٠٠+ مسجّل، في تجربة أضخم ومعرض أكبر من أي وقت مضى!"
    },
    ctaSection: { eyebrow:"احجز مكانك", title:"فكرةٌ واحدة، ليلتان، ألف كرسي..", lead:"التذاكر محدودة، سجّل الآن لتضمن مقعدك ضمن جمهور TEDx OKADH 2026.", btn:"سجّل الآن مجانًا ←" },
    foot: {
      about:"TEDx OKADH فعالية مستقلة مرخّصة من مؤسسة TED، تُنظَّم في الطائف · السعودية بروح سوق عكاظ التاريخي.",
      explore:"استكشف", contact:"تواصل", legal:"قانوني",
      links:{about:"عن الحدث",speakers:"المتحدثون",agenda:"الأجندة",register:"التسجيل",press:"للصحافة",partners:"الشركاء",code:"ميثاق الحضور",privacy:"الخصوصية",ted:"TED.com"},
      address:"فندق أنتركونتيننتال · الطائف · المملكة العربية السعودية",
      rights:"© 2026 TEDx OKADH. جميع الحقوق محفوظة.",
      indep:"هذا الحدث TEDx حدث مستقل يُنظَّم تحت ترخيص من TED.",
      scanner:"مسح",
    },
  },
  en: {
    nav: { about:"About", speakers:"Speakers", agenda:"Agenda", register:"Register", contact:"Contact" },
    cta: "Register Now",
    hero: {
      title: "A Legacy That Extends",
      sub: "Where heritage rises to shape the future",
      desc: "We echo the spirit of the historic Souq Okadh in two nights of bold ideas, gathering voices from Saudi Arabia and the Arab world to the TEDx stage.",
      tickets: "Get Tickets", agenda: "View Agenda",
      dateVal: "May 15–16, 2026", timeVal: "4:00 PM — 10:00 PM", city: "InterContinental Taif",
    },
    count: { d:"Days", h:"Hours", m:"Minutes", s:"Seconds" },
    about: {
      eyebrow:"About the Event",
      stats:[{n:"10",unit:"Speakers"},{n:"1,000",unit:"Attendees"},{n:"6",unit:"Hours"},{n:"2",unit:"Nights"}],
      col1Title:"What is TED?",
      col1p1:"TED is a nonprofit devoted to spreading ideas, usually in the form of short powerful talks. It started in 1984 focusing on Technology, Entertainment and Design.",
      col1Abbr:"TED = Technology, Entertainment, Design",
      col1p2:"TED now covers virtually all topics — from science to business to global issues — in more than 100 languages.",
      col1p3:"TEDx events are independently organized to help share ideas in communities around the world.",
      col3Title:"TEDx OKADH",
      col3body:"TEDx OKADH is an independent intellectual and cultural event held under license from TED, drawing inspiration from the historic Souq Okadh to bridge the authenticity of the past with the innovations of the future. The event highlights ideas worth spreading by hosting distinguished creators and speakers across various fields, fostering an environment that nurtures national talents and enriches knowledge in alignment with Saudi Arabia's Vision.",
    },
    speakers:{ eyebrow:"2026 Lineup", title:"Meet the Speakers", lead:"Ten voices from across fields, each stepping onto the red circle to share one idea worth spreading.", more:"View Profile" },
    agenda:{ eyebrow:"Event Agenda", lead:"Six hours of ideas across three sessions, with intermissions, food, and outdoor performances.", day1Title:"Day One · Friday", day1Date:"May 15, 2026", day2Title:"Day Two · Saturday", day2Date:"May 16, 2026", openLabel:"View Schedule", closeLabel:"Hide Schedule" },
    sponsors:{ eyebrow:"Sponsors & Partners", title:"Our Sponsors & Partners" },
    moments:{
      eyebrow:"Moments",
      title:"Our Moments with TEDxOkadh",
      lead:"We started with 550+ participants — today, we're writing a new chapter of excellence.\nThis year we rise to an entirely new level, with expectations exceeding 12,000+ registrants, in a bigger experience and a larger exhibition than ever before!"
    },
    ctaSection:{ eyebrow:"Reserve Your Seat", title:"One Idea, Two Nights, A Thousand Chairs..", lead:"Seats are limited. Register now to secure your spot at TEDx OKADH 2026.", btn:"Register Free Now →" },
    foot:{
      about:"TEDx OKADH is an independently organized event, operated under license from TED, held in Taif, Saudi Arabia.",
      explore:"Explore", contact:"Contact", legal:"Legal",
      links:{about:"About",speakers:"Speakers",agenda:"Agenda",register:"Register",press:"Press",partners:"Partners",code:"Code of Conduct",privacy:"Privacy",ted:"TED.com"},
      address:"InterContinental Hotel · Taif · Saudi Arabia",
      rights:"© 2026 TEDx OKADH. All rights reserved.",
      indep:"This independent TEDx event is operated under license from TED.",
      scanner:"Scanner",
    },
  },
}

const SPEAKERS = [
  { id:1, ar:"د. نورة الفايز", en:"Dr. Noura AlFayez", rolAr:"عالمة أعصاب · جامعة الملك عبدالعزيز", rolEn:"Neuroscientist · KAU", talkAr:"ما الذي تُفكّر فيه عقولنا حين لا نُفكّر؟", talkEn:"What our minds think when we don't", color:"#E62B1E", initAr:"ن", initEn:"N" },
  { id:2, ar:"خالد السُّفياني", en:"Khalid AlSufyani", rolAr:"مهندس معماري", rolEn:"Architect", talkAr:"المدينة التي تُصغي لسكّانها", talkEn:"The city that listens back", color:"#C9A24A", initAr:"خ", initEn:"K" },
  { id:3, ar:"ليلى الرّشيد", en:"Layla AlRashid", rolAr:"شاعرة · روائية", rolEn:"Poet & Novelist", talkAr:"لماذا نحتاج إلى صمتٍ عربي", talkEn:"Why we need an Arab silence", color:"#4B5563", initAr:"ل", initEn:"L" },
  { id:4, ar:"ياسر الزّهراني", en:"Yasser AlZahrani", rolAr:"رائد أعمال تقني", rolEn:"Tech Entrepreneur", talkAr:"الذكاء الاصطناعي يتعلّم العربية", talkEn:"When AI learns Arabic", color:"#E62B1E", initAr:"ي", initEn:"Y" },
  { id:5, ar:"د. مها القحطاني", en:"Dr. Maha AlQahtani", rolAr:"طبيبة نفسية", rolEn:"Psychiatrist", talkAr:"قصّة قصيرة عن الحزن الجميل", talkEn:"A short story of beautiful sadness", color:"#4B5563", initAr:"م", initEn:"M" },
  { id:6, ar:"سلطان العمري", en:"Sultan AlOmari", rolAr:"رائد فضاء متدرّب", rolEn:"Astronaut Candidate", talkAr:"ما الذي تعلّمته من الجاذبية؟", talkEn:"Lessons from zero gravity", color:"#C9A24A", initAr:"س", initEn:"S" },
  { id:7, ar:"أمل الدّوسري", en:"Amal AlDosari", rolAr:"مؤسِّسة مشروع بيئي", rolEn:"Climate Founder", talkAr:"الصحراء ليست فارغة", talkEn:"The desert isn't empty", color:"#B81810", initAr:"أ", initEn:"A" },
  { id:8, ar:"فهد المطيري", en:"Fahad AlMutairi", rolAr:"مخرج سينمائي", rolEn:"Filmmaker", talkAr:"قصّة نصف مكتوبة", talkEn:"A half-written story", color:"#1F2937", initAr:"ف", initEn:"F" },
  { id:9, ar:"د. ريم الزّين", en:"Dr. Reem AlZain", rolAr:"عالمة بيانات", rolEn:"Data Scientist", talkAr:"ما تقوله البيانات عن الصمت", talkEn:"What data says about silence", color:"#C9A24A", initAr:"ر", initEn:"R" },
  { id:10, ar:"بدر الحُربي", en:"Badr AlHarbi", rolAr:"مؤرِّخ", rolEn:"Historian", talkAr:"سوق عكاظ لم يُغلق فعلًا", talkEn:"Souq Okadh never really closed", color:"#4B5563", initAr:"ب", initEn:"B" },
]

const AGENDA = [
  { t:"4:00", tAr:"٤:٠٠", ampm:"PM", ar:{h:"الاستقبال والافتتاح",p:"تسجيل الحضور، جولة في معرض الأعمال التراثية، وكلمة ترحيب من الفريق المنظِّم."}, en:{h:"Arrival & Welcome",p:"Guest check-in, heritage-arts exhibition walkthrough, and a welcome note from the organizing team."}, tag:"arrival", tagKind:"mute" },
  { t:"5:00", tAr:"٥:٠٠", ampm:"PM", ar:{h:"الجلسة الأولى — نبرة الفكرة",p:"أربعة متحدثين يفتتحون الليلة بمواضيع عن اللغة، المدينة، والعقل."}, en:{h:"Session I — The Tone of Ideas",p:"Four speakers open the night with talks on language, the city, and the mind."}, tag:"session", tagKind:"red" },
  { t:"6:20", tAr:"٦:٢٠", ampm:"PM", ar:{h:"استراحة · عرض موسيقي",p:"وقت التواصل بين الحضور على أنغام فرقة أوتار من الطائف."}, en:{h:"Intermission · Live Music",p:"Networking break with a live set from the Awtar ensemble of Taif."}, tag:"break", tagKind:"gold" },
  { t:"7:00", tAr:"٧:٠٠", ampm:"PM", ar:{h:"الجلسة الثانية — حدود المعرفة",p:"ثلاثة متحدثين عن الذكاء الاصطناعي، الفضاء، والبيئة."}, en:{h:"Session II — Edges of Knowledge",p:"Three talks on artificial intelligence, space, and the environment."}, tag:"session", tagKind:"red" },
  { t:"8:15", tAr:"٨:١٥", ampm:"PM", ar:{h:"عشاء تحت السماء",p:"أطباق من المطبخ الحجازي في ساحة السوق."}, en:{h:"Dinner Under the Sky",p:"A Hijazi-inspired menu served in the open plaza."}, tag:"dinner", tagKind:"gold" },
  { t:"9:00", tAr:"٩:٠٠", ampm:"PM", ar:{h:"الجلسة الثالثة — خاتمة",p:"ثلاث محطّات أخيرة تُنهي الليلة بسؤالٍ واحد."}, en:{h:"Session III — The Closing",p:"Three final talks ending the night with one question."}, tag:"session", tagKind:"red" },
  { t:"10:00", tAr:"١٠:٠٠", ampm:"PM", ar:{h:"لحظةٌ أخيرة",p:"توقيع الكتاب التذكاري والتقاط الصور على المسرح."}, en:{h:"One Last Moment",p:"Keepsake book signing and photos on the red circle."}, tag:"close", tagKind:"mute" },
]

const AGENDA_DAY2 = [
  { t:"4:00", tAr:"٤:٠٠", ampm:"PM", ar:{h:"الاستقبال واستكمال المعرض",p:"تسجيل حضور اليوم الثاني وجولة مفتوحة في أركان الابتكار والمعرض التراثي."}, en:{h:"Day Two Arrival & Exhibition",p:"Second-day check-in with open access to innovation corners and the heritage exhibition."}, tag:"arrival", tagKind:"mute" },
  { t:"5:00", tAr:"٥:٠٠", ampm:"PM", ar:{h:"ورشة عمل تفاعلية",p:"جلسة نقاش مفتوحة مع المتحدثين، فرصة للتفاعل المباشر وطرح الأسئلة على المسرح."}, en:{h:"Interactive Workshop",p:"An open discussion session with speakers — a chance for direct engagement and live Q&A."}, tag:"session", tagKind:"red" },
  { t:"6:30", tAr:"٦:٣٠", ampm:"PM", ar:{h:"استراحة · عرض فني",p:"وقت للتواصل يصاحبه عرض فني من فناني المنطقة."}, en:{h:"Intermission · Art Performance",p:"Networking break accompanied by a live art performance from regional artists."}, tag:"break", tagKind:"gold" },
  { t:"7:15", tAr:"٧:١٥", ampm:"PM", ar:{h:"الجلسة الختامية — الأثر الممتد",p:"آخر ثلاثة متحدثين يُقدّمون أفكارًا تُجيب على سؤال الليلتين الكبير."}, en:{h:"Closing Session — The Lasting Impact",p:"The final three speakers deliver ideas that answer the two nights' ultimate question."}, tag:"session", tagKind:"red" },
  { t:"8:30", tAr:"٨:٣٠", ampm:"PM", ar:{h:"عشاء الختام",p:"عشاء احتفالي في ساحة السوق يجمع المتحدثين بالحضور على مائدة واحدة."}, en:{h:"Closing Dinner",p:"A celebratory dinner in the open plaza bringing speakers and attendees together."}, tag:"dinner", tagKind:"gold" },
  { t:"9:30", tAr:"٩:٣٠", ampm:"PM", ar:{h:"لحظة الختام الكبرى",p:"كلمة الإغلاق، تسليم التقدير للمتحدثين، والكشف عن موعد الموسم القادم."}, en:{h:"Grand Finale",p:"Closing remarks, speaker appreciation ceremony, and announcement of next season."}, tag:"close", tagKind:"mute" },
]

const SPONSOR_IMGS = ["/d.png","/F1C.png","/ge_project.png","/Resize_image_project.png","/t.png","/ject.png","/Remove_background_project.png","/Resize_ima_project.png","/Resize_imect.png","/Resize_image_projct.png"]
const MOMENT_IMGS = ["/moments_img1.JPG","/moments_img2.JPG","/moments_img3.jpg","/moments_img4.png","/moments_img5.JPG"]

// =============================================
// HERO CANVAS — خلفية متحركة ثابتة للصفحة كلها
// =============================================
function HeroCanvas() {
  const ref = useRef(null)
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return
    const ctx=canvas.getContext('2d')
    let raf,w,h; const DPR=Math.min(window.devicePixelRatio||1,2)
    let startTime = null
    const FADE_DURATION = 3000

    const orbs=[
      {x:.2,y:.3,r:520,vx:.00006,vy:.00004},
      {x:.8,y:.6,r:620,vx:-.00005,vy:.00007},
      {x:.55,y:.15,r:420,vx:.00004,vy:-.00003},
      {x:.4,y:.85,r:500,vx:-.00003,vy:-.00005},
    ]
    const orbColors = [
      (a)=>`rgba(230,43,30,${a})`,
      (a)=>`rgba(184,24,16,${a})`,
      (a)=>`rgba(201,162,74,${a})`,
      (a)=>`rgba(10,10,10,${a})`,
    ]
    const orbAlphas = [0.55, 0.4, 0.18, 1]
    const parts=Array.from({length:60},()=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.00012,vy:(Math.random()-.5)*.00012,r:Math.random()*1.4+.4,a:Math.random()*.6+.2}))
    function resize(){ w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=w*DPR;canvas.height=h*DPR;ctx.setTransform(DPR,0,0,DPR,0,0) }
    resize(); window.addEventListener('resize',resize)
    let t0=performance.now()
    function frame(now){
      if(!startTime) startTime=now
      const elapsed=now-startTime
      const progress=Math.min(elapsed/FADE_DURATION, 1)
      const eased = progress < 0.5 ? 2*progress*progress : 1-(Math.pow(-2*progress+2,2)/2)
      const dt=now-t0;t0=now
      ctx.fillStyle='#050505';ctx.fillRect(0,0,w,h)
      ctx.globalCompositeOperation='lighter'
      orbs.forEach((o,i)=>{
        o.x+=o.vx*dt;o.y+=o.vy*dt
        if(o.x<-.2||o.x>1.2)o.vx*=-1;if(o.y<-.2||o.y>1.2)o.vy*=-1
        const cx=o.x*w,cy=o.y*h
        const alpha = i < 3 ? orbAlphas[i]*eased : orbAlphas[i]
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,o.r)
        g.addColorStop(0,orbColors[i](alpha));g.addColorStop(1,'rgba(0,0,0,0)')
        ctx.fillStyle=g;ctx.fillRect(0,0,w,h)
      })
      ctx.globalCompositeOperation='source-over'
      parts.forEach(p=>{
        p.x+=p.vx*dt;p.y+=p.vy*dt
        if(p.x<0)p.x=1;if(p.x>1)p.x=0;if(p.y<0)p.y=1;if(p.y>1)p.y=0
        ctx.fillStyle=`rgba(255,255,255,${p.a*eased})`;ctx.beginPath();ctx.arc(p.x*w,p.y*h,p.r,0,Math.PI*2);ctx.fill()
      })
      raf=requestAnimationFrame(frame)
    }
    raf=requestAnimationFrame(frame)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])
  return <canvas ref={ref} style={{position:'fixed',inset:0,width:'100vw',height:'100vh',zIndex:0,pointerEvents:'none'}} aria-hidden="true"/>
}

// =============================================
// COUNTDOWN
// =============================================
const TARGET_DATE = new Date('2026-05-15T16:00:00+03:00').getTime()
const AR_D = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩']
const toAr = s => s.replace(/[0-9]/g, d=>AR_D[d])
const pad = (n,w=2) => String(n).padStart(w,'0')

// =============================================
// SPLASH
// =============================================
function Splash({ onDone }) {
  const [p,setP]=useState(0)
  useEffect(()=>{
    const t1=setTimeout(()=>setP(1),300)
    const t2=setTimeout(()=>setP(2),2000)
    const t3=setTimeout(()=>onDone(),2800)
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3)}
  },[])
  return (
    <div style={{position:'fixed',inset:0,background:'#050505',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,opacity:p===2?0:1,transition:p===2?'opacity 0.7s ease':'none',pointerEvents:p===2?'none':'all'}}>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:600,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(230,43,30,0.28) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{textAlign:'center',position:'relative',zIndex:1,opacity:p>=1?1:0,transform:p>=1?'translateY(0)':'translateY(24px)',transition:'all 1s cubic-bezier(0.34,1.2,0.64,1)'}}>
        <div style={{fontSize:'clamp(42px,9vw,80px)',fontWeight:900,letterSpacing:4,marginBottom:16,lineHeight:1,fontFamily:"var(--font-display)"}}>
          <span style={{color:'#E62B1E'}}>TEDx</span><span style={{color:'#fff'}}>OKADH</span>
        </div>
        <div style={{width:80,height:3,background:'#E62B1E',margin:'0 auto 20px',borderRadius:2,transform:p>=1?'scaleX(1)':'scaleX(0)',transition:'transform 0.7s ease 0.5s'}}/>
        <p style={{color:'#888',fontSize:'clamp(14px,2vw,18px)',letterSpacing:1,opacity:p>=1?1:0,transition:'opacity 0.6s ease 0.7s',fontFamily:"var(--font-display)"}}>حيث ينبعثُ الإرثُ ليرسمَ ملامحَ المستقبل</p>
        <p style={{color:'#444',fontSize:11,marginTop:8,letterSpacing:3,opacity:p>=1?1:0,transition:'opacity 0.6s ease 0.9s',fontFamily:"var(--font-sans)"}}>EST. 501 CE · REVIVED 2026</p>
      </div>
    </div>
  )
}

// =============================================
// NAV
// =============================================
function Nav({ lang, setLang, navigate }) {
  const [scrolled,setScrolled]=useState(false)
  const [menuOpen,setMenuOpen]=useState(false)
  const loc=useLocation()
  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>12); fn(); window.addEventListener('scroll',fn,{passive:true}); return()=>window.removeEventListener('scroll',fn) },[])
  const L=I18N[lang].nav
  const scrollTo=id=>{
    setMenuOpen(false)
    if(loc.pathname!=='/'){ navigate('/'); setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'}),200) }
    else document.getElementById(id)?.scrollIntoView({behavior:'smooth'})
  }
  return (
    <>
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:scrolled?'rgba(5,5,5,0.92)':'transparent',backdropFilter:scrolled?'blur(20px)':'none',borderBottom:scrolled?'1px solid rgba(255,255,255,0.07)':'none',transition:'all 0.3s ease',padding:'0 clamp(12px,3vw,32px)',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
        <button onClick={()=>navigate('/')} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,padding:0,flexShrink:0}}>
          <img src="/logo-transparent.png" alt="" style={{height:38,objectFit:'contain',flexShrink:0}} onError={e=>e.target.style.display='none'}/>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <img src="/logo1.png" alt="logo" style={{height:36,objectFit:'contain',flexShrink:0}}/>
            <span style={{fontSize:'clamp(14px,3vw,20px)',fontWeight:900,letterSpacing:1,fontFamily:"var(--font-display)",whiteSpace:'nowrap'}}>
              <span style={{color:'#E62B1E'}}>TED</span><sup style={{color:'#E62B1E',fontSize:10}}>x</sup>
              <span style={{color:'#fff'}}>{lang==='ar'?'عكاظ':'OKADH'}</span>
            </span>
          </div>
        </button>
        <div style={{display:'flex',gap:'clamp(8px,1.5vw,16px)',alignItems:'center',flexWrap:'nowrap',flexShrink:0}}>
          <div className="desktop-nav" style={{display:'flex',gap:16}}>
            {[{id:'about',l:L.about},{id:'speakers',l:L.speakers},{id:'agenda',l:L.agenda},{id:'register',l:L.register},{id:'contact',l:L.contact}].map(it=>(
              <button key={it.id} onClick={()=>scrollTo(it.id)} style={{background:'none',border:'none',color:'#777',fontSize:13,cursor:'pointer',fontFamily:"var(--font-sans)",padding:0,transition:'color 0.2s',whiteSpace:'nowrap'}}
                onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#777'}>{it.l}</button>
            ))}
          </div>
          <div style={{display:'flex',background:'rgba(255,255,255,0.05)',borderRadius:8,padding:3,border:'1px solid rgba(255,255,255,0.08)',flexShrink:0}}>
            {['ar','en'].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{background:lang===l?'#E62B1E':'transparent',border:'none',color:lang===l?'#fff':'#666',padding:'4px 8px',borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer',transition:'all 0.2s',fontFamily:"var(--font-sans)"}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={()=>scrollTo('register')} className="nav-cta-btn" style={{background:'#E62B1E',border:'none',borderRadius:10,color:'#fff',padding:'7px clamp(10px,2vw,18px)',fontSize:'clamp(11px,1.5vw,13px)',fontWeight:700,cursor:'pointer',fontFamily:"var(--font-sans)",whiteSpace:'nowrap',flexShrink:0}}>
            {I18N[lang].cta}
          </button>
          <button className="burger-btn" onClick={()=>setMenuOpen(o=>!o)} style={{display:'none',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',cursor:'pointer',fontSize:18,padding:'6px 10px',borderRadius:8,flexShrink:0,lineHeight:1}}>☰</button>
        </div>
      </nav>
      {menuOpen&&(
        <div style={{position:'fixed',top:64,left:0,right:0,background:'rgba(5,5,5,0.98)',zIndex:99,padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.1)',display:'flex',flexDirection:'column',gap:4}}>
          {[{id:'about',l:L.about},{id:'speakers',l:L.speakers},{id:'agenda',l:L.agenda},{id:'register',l:L.register},{id:'contact',l:L.contact}].map(it=>(
            <button key={it.id} onClick={()=>scrollTo(it.id)} style={{background:'none',border:'none',color:'#ccc',fontSize:16,cursor:'pointer',fontFamily:"var(--font-sans)",padding:'12px 0',textAlign:'start',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>{it.l}</button>
          ))}
          <button onClick={()=>{setMenuOpen(false);navigate('/register')}} style={{background:'#E62B1E',border:'none',borderRadius:10,color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"var(--font-sans)",padding:'13px 0',marginTop:8,textAlign:'center'}}>{I18N[lang].cta}</button>
        </div>
      )}
      <style>{`
        @media(max-width:768px){
          .desktop-nav{display:none!important}
          .nav-scanner-btn{display:none!important}
          .burger-btn{display:flex!important}
        }
        @media(max-width:400px){
          .nav-cta-btn{display:none!important}
        }
      `}</style>
    </>
  )
}

// =============================================
// SPEAKERS SLIDER
// =============================================
function SpeakersSlider({ lang, onOpen }) {
  const L=I18N[lang].speakers
  const splideRef=useRef(null)
  useEffect(()=>{
    const splide=new Splide(splideRef.current,{type:'loop',drag:'free',fixedWidth:200,gap:20,arrows:false,pagination:false,autoScroll:{speed:1,pauseOnHover:false,pauseOnFocus:false}})
    splide.mount({AutoScroll})
    return ()=>splide.destroy()
  },[lang])
  return (
    <section id="speakers" style={{padding:'80px 0',borderTop:'1px solid rgba(255,255,255,0.06)',overflow:'hidden',position:'relative',zIndex:1,background:'rgba(0,0,0,0.52)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 clamp(16px,4vw,40px)',marginBottom:40}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:12}}>
          <div>
            <p style={{color:'#E62B1E',fontSize:'clamp(22px,4vw,36px)',fontWeight:700,marginBottom:10,fontFamily:"var(--font-display)"}}>{L.eyebrow}</p>
            <h2 style={{fontSize:'clamp(18px,4vw,32px)',fontWeight:900,color:'#fff',marginBottom:10}}>{L.title}</h2>
            <p style={{color:'#888',fontSize:'clamp(11px,1.3vw,13px)',maxWidth:520,fontFamily:"var(--font-sans)"}}>{L.lead}</p>
          </div>
          <div style={{color:'#444',fontSize:13,fontFamily:"var(--font-sans)"}}>{SPEAKERS.length} {lang==='ar'?'متحدث':'speakers'} · 2026</div>
        </div>
      </div>
      <div ref={splideRef} className="splide">
        <div className="splide__track">
          <ul className="splide__list">
            {SPEAKERS.map((sp,i)=>(
              <li key={i} className="splide__slide" style={{padding:'10px 0'}}>
                <div onClick={()=>onOpen(sp)}
                  style={{background:'rgba(17,17,17,0.85)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,overflow:'hidden',cursor:'pointer',transition:'border-color 0.3s,transform 0.3s',height:'100%'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor=sp.color+'44'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}}>
                  <div style={{height:120,background:`linear-gradient(160deg,${sp.color},#0A0A0A 120%)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,fontWeight:900,color:'rgba(255,255,255,0.85)',fontFamily:"var(--font-display)"}}>
                    {lang==='ar'?sp.initAr:sp.initEn}
                  </div>
                  <div style={{padding:14}}>
                    <h3 style={{color:'#fff',fontSize:14,fontWeight:700,marginBottom:3,fontFamily:"var(--font-sans)"}}>{lang==='ar'?sp.ar:sp.en}</h3>
                    <p style={{color:sp.color,fontSize:11,marginBottom:8,fontFamily:"var(--font-sans)"}}>{lang==='ar'?sp.rolAr:sp.rolEn}</p>
                    <p style={{color:'#555',fontSize:11,lineHeight:1.4,fontFamily:"var(--font-text)"}}>&quot;{lang==='ar'?sp.talkAr:sp.talkEn}&quot;</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// =============================================
// MOMENTS SLIDER
// =============================================
function MomentsSlider({ lang }) {
  const L=I18N[lang].moments
  const splideRef=useRef(null)
  useEffect(()=>{
    const splide=new Splide(splideRef.current,{type:'loop',drag:'free',fixedWidth:320,fixedHeight:220,gap:16,arrows:false,pagination:false,autoScroll:{speed:0.8,pauseOnHover:true,pauseOnFocus:false}})
    splide.mount({AutoScroll})
    return ()=>splide.destroy()
  },[])
  return (
    <section id="moments" style={{padding:'clamp(60px,8vw,80px) 0',borderTop:'1px solid rgba(255,255,255,0.06)',overflow:'hidden',position:'relative',zIndex:1,background:'rgba(0,0,0,0.42)'}}>
      <div style={{textAlign:'center',marginBottom:36,padding:'0 clamp(16px,4vw,40px)'}}>
        <p style={{color:'#E62B1E',fontSize:'clamp(22px,4vw,34px)',fontWeight:700,marginBottom:10,fontFamily:"var(--font-display)"}}>{L.eyebrow}</p>
        <h2 style={{fontSize:'clamp(20px,3.5vw,30px)',fontWeight:900,color:'#fff',marginBottom:16}}>{L.title}</h2>
        {L.lead && (
          <p style={{color:'#888',fontSize:'clamp(13px,1.5vw,15px)',maxWidth:640,margin:'0 auto',lineHeight:1.9,fontFamily:"var(--font-text)",whiteSpace:'pre-line'}}>{L.lead}</p>
        )}
      </div>
      <div ref={splideRef} className="splide">
        <div className="splide__track">
          <ul className="splide__list">
            {MOMENT_IMGS.map((src,i)=>(
              <li key={i} className="splide__slide">
                <div style={{width:320,height:220,borderRadius:14,overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)',background:'#0d0d0d'}}>
                  <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'}/>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// =============================================
// SPONSORS SLIDER
// =============================================
function SponsorsSlider({ lang }) {
  const L=I18N[lang].sponsors
  const splideRef=useRef(null)
  useEffect(()=>{
    const splide=new Splide(splideRef.current,{type:'loop',drag:'free',fixedWidth:190,fixedHeight:130,gap:16,arrows:false,pagination:false,autoScroll:{speed:1,pauseOnHover:false,pauseOnFocus:false}})
    splide.mount({AutoScroll})
    return ()=>splide.destroy()
  },[])
  return (
    <section id="sponsors" style={{padding:'clamp(60px,8vw,80px) 0',borderTop:'1px solid rgba(255,255,255,0.06)',overflow:'hidden',position:'relative',zIndex:1,background:'rgba(0,0,0,0.55)'}}>
      <div style={{textAlign:'center',marginBottom:36,padding:'0 clamp(16px,4vw,40px)'}}>
        <p style={{color:'#E62B1E',fontSize:'clamp(22px,4vw,34px)',fontWeight:700,marginBottom:10,fontFamily:"var(--font-display)"}}>{L.eyebrow}</p>
        <h2 style={{fontSize:'clamp(18px,3.5vw,28px)',fontWeight:900,color:'#fff'}}>{L.title}</h2>
      </div>
      <div ref={splideRef} className="splide">
        <div className="splide__track">
          <ul className="splide__list">
            {SPONSOR_IMGS.map((src,i)=>(
              <li key={i} className="splide__slide">
                <div style={{width:190,height:130,borderRadius:12,overflow:src==='/Resize_image_projct.png'?'visible':'hidden',border:'1px solid rgba(255,255,255,0.07)',background:'rgba(13,13,13,0.7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <img src={src} alt="" style={src==='/Resize_image_projct.png'?{width:'100%',height:'100%',objectFit:'contain',transform:'scale(1.4)',transformOrigin:'center'}:{maxWidth:'90%',maxHeight:'90%',objectFit:'contain'}} onError={e=>e.target.style.display='none'}/>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// =============================================
// HOMEPAGE
// =============================================
function HomePage({ lang, navigate }) {
  const [modal,setModal]=useState(null)
  const [day1Open,setDay1Open]=useState(false)
  const [day2Open,setDay2Open]=useState(false)
  const L=I18N[lang]
  const scrollTo=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'})

  const downloadAgenda=(items,title)=>{
    const lines=[title,'─'.repeat(36),'']
    items.forEach(row=>{
      const time=lang==='ar'?row.tAr:`${row.t} ${row.ampm}`
      const copy=lang==='ar'?row.ar:row.en
      lines.push(`${time}   ${copy.h}`)
      lines.push(`        ${copy.p}`)
      lines.push('')
    })
    lines.push('─'.repeat(36))
    lines.push('TEDx OKADH 2026 · tedxokadh.sa')
    const blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url;a.download=`TEDxOKADH-${title.replace(/[\s·]/g,'-')}.txt`;a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Fixed animated background — يغطي كامل الصفحة */}
      <HeroCanvas/>

      <div style={{position:'relative',zIndex:1}}>
        <style>{`
          * {box-sizing:border-box}
          @media(max-width:900px){
            .about-grid{grid-template-columns:1fr!important}
            .about-grid>div{border-left:none!important;border-right:none!important;border-bottom:1px solid rgba(255,255,255,0.07)!important}
          }
          @media(max-width:768px){
            .about-grid{grid-template-columns:1fr!important}
            .agenda-header{flex-direction:column!important;align-items:flex-start!important}
            .footer-grid{grid-template-columns:1fr 1fr!important}
            .hero-actions{flex-direction:column!important;align-items:stretch!important;width:100%!important;max-width:300px!important;margin-left:auto!important;margin-right:auto!important}
            .hero-actions button{width:100%!important;justify-content:center!important}
            .hero-meta{flex-direction:column!important;gap:12px!important;align-items:center!important}
            .countdown-wrap{gap:6px!important;justify-content:center!important}
            .countdown-wrap>div{min-width:58px!important}
            .countdown-wrap .num{font-size:26px!important}
          }
          @media(max-width:480px){
            .footer-grid{grid-template-columns:1fr!important}
            .countdown-wrap>div{min-width:50px!important}
            .countdown-wrap .num{font-size:22px!important}
          }
          @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        `}</style>

        {/* HERO */}
        <header style={{minHeight:'100vh',position:'relative',display:'flex',alignItems:'center',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.05) 30%,rgba(8,8,8,0.75) 100%)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:920,margin:'0 auto',padding:'clamp(100px,15vw,140px) clamp(16px,4vw,40px) 80px',textAlign:'center'}}>
            <h1 style={{fontSize:'clamp(38px,8vw,88px)',fontWeight:900,lineHeight:1.05,marginBottom:12,color:'#fff',fontFamily:"var(--font-display)"}}>
              {L.hero.title}
              <br/><span style={{color:'#E62B1E',fontSize:'0.5em',fontStyle:'italic',letterSpacing:4,fontFamily:"var(--font-display)"}}>TEDxOKADH 2026</span>
            </h1>
            <p style={{fontSize:'clamp(15px,2.5vw,21px)',color:'#aaa',marginBottom:10,fontStyle:'italic',fontFamily:"var(--font-display)"}}>{L.hero.sub}</p>
            <p style={{fontSize:'clamp(13px,1.5vw,15px)',color:'#888',maxWidth:560,margin:'0 auto 36px',lineHeight:2,fontFamily:"var(--font-text)"}}>{L.hero.desc}</p>
            <div className="countdown-wrap" style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              {(()=>{
                const calc=()=>{const d=Math.max(0,TARGET_DATE-Date.now());return{d:Math.floor(d/86400000),h:Math.floor(d%86400000/3600000),m:Math.floor(d%3600000/60000),s:Math.floor(d%60000/1000)}}
                const [tick,setTick]=useState(calc)
                useEffect(()=>{const id=setInterval(()=>setTick(calc()),1000);return()=>clearInterval(id)},[])
                const fmt=lang==='ar'?s=>toAr(s):s=>s
                const Lc=I18N[lang].count
                return [{v:fmt(String(tick.d)),l:Lc.d},{v:fmt(pad(tick.h)),l:Lc.h},{v:fmt(pad(tick.m)),l:Lc.m},{v:fmt(pad(tick.s)),l:Lc.s}].map((it,i)=>(
                  <div key={i} style={{textAlign:'center',minWidth:72}}>
                    <div style={{background:'rgba(0,0,0,0.55)',border:'1px solid rgba(255,255,255,0.12)',backdropFilter:'blur(12px)',borderRadius:12,padding:'10px 14px',marginBottom:6}}>
                      <span className="num" style={{fontSize:34,fontWeight:900,color:'#fff',letterSpacing:2,fontVariantNumeric:'tabular-nums',fontFamily:"var(--font-sans)"}}>{it.v}</span>
                    </div>
                    <span style={{color:'#777',fontSize:11,letterSpacing:1,fontFamily:"var(--font-sans)"}}>{it.l}</span>
                  </div>
                ))
              })()}
            </div>
            <div className="hero-actions" style={{display:'flex',gap:14,justifyContent:'center',marginTop:32,flexWrap:'wrap'}}>
              <button onClick={()=>navigate('/register')} style={{background:'#E62B1E',border:'none',borderRadius:12,color:'#fff',padding:'13px 36px',fontSize:'clamp(13px,2vw,15px)',fontWeight:700,cursor:'pointer',fontFamily:"var(--font-sans)",transition:'transform 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>{L.hero.tickets} →</button>
              <button onClick={()=>scrollTo('agenda')} style={{background:'transparent',border:'2px solid rgba(255,255,255,0.18)',borderRadius:12,color:'#fff',padding:'13px 36px',fontSize:'clamp(13px,2vw,15px)',fontWeight:700,cursor:'pointer',fontFamily:"var(--font-sans)",transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.45)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.18)';e.currentTarget.style.transform='translateY(0)'}}>{L.hero.agenda}</button>
            </div>
            <div className="hero-meta" style={{display:'flex',gap:36,justifyContent:'center',marginTop:40,flexWrap:'wrap'}}>
              {[{l:lang==='ar'?'التاريخ':'Date',v:L.hero.dateVal},{l:lang==='ar'?'الوقت':'Time',v:L.hero.timeVal},{l:lang==='ar'?'الموقع':'Venue',v:L.hero.city}].map((m,i)=>(
                <div key={i} style={{textAlign:'center'}}>
                  <div style={{color:'#555',fontSize:10,letterSpacing:2,textTransform:'uppercase',marginBottom:4,fontFamily:"var(--font-sans)"}}>{m.l}</div>
                  <div style={{color:'#ccc',fontSize:'clamp(12px,1.5vw,14px)',fontWeight:600,fontFamily:"var(--font-sans)"}}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ABOUT */}
        <section id="about" style={{paddingTop:'clamp(60px,8vw,100px)',borderTop:'1px solid rgba(255,255,255,0.06)',position:'relative',background:'rgba(0,0,0,0.58)'}}>
          <p style={{color:'#E62B1E',fontSize:'clamp(22px,3.5vw,32px)',fontWeight:700,textAlign:'center',marginBottom:'clamp(32px,5vw,52px)',padding:'0 clamp(16px,4vw,40px)',fontFamily:"var(--font-display)"}}>{L.about.eyebrow}</p>
          <div className="about-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderTop:'1px solid rgba(255,255,255,0.07)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{padding:'clamp(24px,4vw,48px) clamp(20px,3vw,40px)',borderLeft:'1px solid rgba(255,255,255,0.07)'}}>
              <h3 style={{color:'#E62B1E',fontSize:'clamp(18px,2.2vw,24px)',fontWeight:900,marginBottom:18,fontFamily:"var(--font-sans)"}}>{L.about.col1Title}</h3>
              <p style={{color:'#888',fontSize:'clamp(13px,1.4vw,15px)',lineHeight:1.95,marginBottom:14,fontFamily:"var(--font-text)"}}>{L.about.col1p1}</p>
              <p style={{color:'#E62B1E',fontSize:'clamp(11px,1.1vw,13px)',fontWeight:700,letterSpacing:.5,marginBottom:14,fontFamily:"var(--font-sans)"}}>{L.about.col1Abbr}</p>
              <p style={{color:'#888',fontSize:'clamp(13px,1.4vw,15px)',lineHeight:1.95,marginBottom:14,fontFamily:"var(--font-text)"}}>{L.about.col1p2}</p>
              <p style={{color:'#555',fontSize:'clamp(12px,1.2vw,13px)',lineHeight:1.9,fontFamily:"var(--font-text)"}}>{L.about.col1p3}</p>
            </div>
            <div style={{padding:'clamp(24px,4vw,48px) clamp(20px,3vw,40px)'}}>
              <h3 style={{color:'#E62B1E',fontSize:'clamp(18px,2.2vw,24px)',fontWeight:900,marginBottom:18,fontFamily:"var(--font-sans)"}}>{L.about.col3Title}</h3>
              <p style={{color:'#888',fontSize:'clamp(13px,1.4vw,15px)',lineHeight:1.95,fontFamily:"var(--font-text)"}}>{L.about.col3body}</p>
            </div>
          </div>
        </section>

        {/* SPEAKERS */}
        <SpeakersSlider lang={lang} onOpen={setModal}/>

        {/* AGENDA */}
        <section id="agenda" style={{paddingTop:'clamp(60px,8vw,100px)',borderTop:'1px solid rgba(255,255,255,0.06)',position:'relative',background:'rgba(0,0,0,0.52)'}}>
          <p style={{color:'#E62B1E',fontSize:'clamp(22px,3.5vw,32px)',fontWeight:700,textAlign:'center',marginBottom:'clamp(32px,5vw,52px)',padding:'0 clamp(16px,4vw,40px)',fontFamily:"var(--font-display)"}}>{L.agenda.eyebrow}</p>
          <div className="about-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderTop:'1px solid rgba(255,255,255,0.07)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            {[{items:AGENDA,open:day1Open,setOpen:setDay1Open,title:L.agenda.day1Title,date:L.agenda.day1Date,isFirst:true},{items:AGENDA_DAY2,open:day2Open,setOpen:setDay2Open,title:L.agenda.day2Title,date:L.agenda.day2Date,isFirst:false}].map(({items,open,setOpen,title,date,isFirst})=>(
              <div key={title} style={{padding:'clamp(24px,4vw,48px) clamp(20px,3vw,40px)',borderLeft:isFirst?'1px solid rgba(255,255,255,0.07)':undefined}}>
                <p style={{color:'#E62B1E',fontSize:'clamp(10px,1.1vw,12px)',letterSpacing:2,textTransform:'uppercase',fontFamily:"var(--font-sans)",marginBottom:8}}>{date}</p>
                <h3 style={{color:'#fff',fontSize:'clamp(17px,2.3vw,24px)',fontWeight:900,marginBottom:8,fontFamily:"var(--font-sans)"}}>{title}</h3>
                <p style={{color:'#555',fontSize:'clamp(12px,1.3vw,13px)',lineHeight:1.7,fontFamily:"var(--font-text)",marginBottom:20}}>{L.agenda.lead}</p>
                <div style={{display:'flex',gap:8,marginBottom:open?20:0}}>
                  <button onClick={()=>setOpen(o=>!o)} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,background:open?'rgba(230,43,30,0.08)':'rgba(255,255,255,0.04)',border:`1px solid ${open?'rgba(230,43,30,0.28)':'rgba(255,255,255,0.09)'}`,borderRadius:10,padding:'11px 16px',cursor:'pointer',color:open?'#E62B1E':'#777',fontSize:'clamp(12px,1.3vw,13px)',fontWeight:700,fontFamily:"var(--font-sans)",transition:'all 0.25s'}}>
                    <span>{open?L.agenda.closeLabel:L.agenda.openLabel}</span>
                    <span style={{fontSize:10,opacity:0.8}}>{open?'▲':'▼'}</span>
                  </button>
                  {open&&<button onClick={()=>downloadAgenda(items,title)} title={lang==='ar'?'تحميل الجدول':'Download'} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:10,color:'#666',padding:'11px 14px',fontSize:13,cursor:'pointer',transition:'all 0.2s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='#fff'}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='#666'}}>↓</button>}
                </div>
                {open&&(
                  <div style={{animation:'fadeUp 0.3s ease'}}>
                    {items.map((row,i)=>{
                      const copy=lang==='ar'?row.ar:row.en
                      const tl={arrival:lang==='ar'?'استقبال':'Arrival',session:lang==='ar'?'جلسة':'Session',break:lang==='ar'?'استراحة':'Break',dinner:lang==='ar'?'عشاء':'Dinner',close:lang==='ar'?'ختام':'Closing'}[row.tag]
                      const tc={red:'#E62B1E',gold:'#C9A24A',mute:'#555'}[row.tagKind]||'#555'
                      return (
                        <div key={i} style={{display:'flex',gap:'clamp(10px,1.5vw,16px)',padding:'14px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                          <div style={{minWidth:50,flexShrink:0,paddingTop:2}}>
                            <span style={{fontSize:'clamp(14px,2vw,17px)',fontWeight:900,color:'#fff',fontFamily:"var(--font-sans)"}}>{lang==='ar'?row.tAr:row.t}</span>
                            {lang!=='ar'&&<span style={{color:'#444',fontSize:9,marginLeft:2,fontFamily:"var(--font-sans)"}}> {row.ampm}</span>}
                          </div>
                          <div style={{flex:1}}>
                            <h4 style={{color:'#fff',fontSize:'clamp(13px,1.7vw,15px)',fontWeight:700,marginBottom:4,fontFamily:"var(--font-sans)"}}>{copy.h}</h4>
                            <p style={{color:'#666',fontSize:'clamp(11px,1.2vw,12px)',lineHeight:1.6,marginBottom:6,fontFamily:"var(--font-text)"}}>{copy.p}</p>
                            <span style={{background:`${tc}15`,color:tc,border:`1px solid ${tc}30`,borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700,fontFamily:"var(--font-sans)"}}>{tl}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* MOMENTS */}
        <MomentsSlider lang={lang}/>

        {/* SPONSORS */}
        <SponsorsSlider lang={lang}/>

        {/* REGISTER CTA */}
        <section id="register" style={{padding:'clamp(60px,8vw,100px) clamp(16px,4vw,40px)',borderTop:'1px solid rgba(255,255,255,0.06)',textAlign:'center',position:'relative',background:'rgba(0,0,0,0.45)'}}>
          <p style={{color:'#E62B1E',fontSize:'clamp(22px,4vw,36px)',fontWeight:700,marginBottom:16,fontFamily:"var(--font-display)"}}>{L.ctaSection.eyebrow}</p>
          <h2 style={{fontSize:'clamp(22px,4.5vw,38px)',fontWeight:900,color:'#fff',marginBottom:14}}>{L.ctaSection.title}</h2>
          <p style={{color:'#888',fontSize:'clamp(13px,1.5vw,16px)',marginBottom:36,maxWidth:500,margin:'0 auto 36px',fontFamily:"var(--font-text)"}}>{L.ctaSection.lead}</p>
          <button onClick={()=>navigate('/register')} style={{background:'#E62B1E',border:'none',borderRadius:14,color:'#fff',padding:'clamp(12px,2vw,16px) clamp(28px,4vw,48px)',fontSize:'clamp(14px,2vw,18px)',fontWeight:700,cursor:'pointer',fontFamily:"var(--font-sans)",transition:'transform 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
            {L.ctaSection.btn}
          </button>
        </section>

        {/* FOOTER */}
        <footer id="contact" style={{background:'rgba(5,5,5,0.94)',borderTop:'1px solid rgba(255,255,255,0.06)',padding:'clamp(40px,6vw,60px) clamp(16px,4vw,40px) 24px',position:'relative',backdropFilter:'blur(8px)'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div className="footer-grid" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'clamp(20px,3vw,36px)',marginBottom:40}}>
              <div>
                <div style={{fontSize:18,fontWeight:900,marginBottom:12,fontFamily:"var(--font-display)"}}><span style={{color:'#E62B1E'}}>TED</span><sup style={{color:'#E62B1E',fontSize:10}}>x</sup><span style={{color:'#fff'}}>{lang==='ar'?'عكاظ':'OKADH'}</span></div>
                <p style={{color:'#444',fontSize:13,lineHeight:1.8,marginBottom:16,maxWidth:280,fontFamily:"var(--font-text)"}}>{L.foot.about}</p>
                <div style={{display:'flex',gap:8}}>
                  {[
                    {ic:'𝕏', href:'https://x.com/tedx_okadh?s=20'},
                    {ic:'in', href:'https://www.linkedin.com/in/faris-almalki-50732a99?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app'},
                    {ic:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>, href:'https://www.tiktok.com/@tedx_okadh'},
                    {ic:'𝕏', href:'https://x.com/engfarisalmalki?s=21'},
                  ].map((s,i)=>(
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',color:'#555',fontSize:12,textDecoration:'none',transition:'all 0.2s',fontWeight:700,fontFamily:"var(--font-sans)"}}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='#fff'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='#555'}}>{s.ic}</a>
                  ))}
                </div>
              </div>
              {[
                {title:L.foot.explore,links:[{l:L.foot.links.about,h:'#about'},{l:L.foot.links.speakers,h:'#speakers'},{l:L.foot.links.agenda,h:'#agenda'},{l:L.foot.links.register,h:'#register'}]},
                {title:L.foot.contact,links:[{l:'tedxokadh1@gmail.com',h:'mailto:tedxokadh1@gmail.com'}]},
                {title:L.foot.legal,links:[{l:L.foot.links.code,h:'#'},{l:L.foot.links.privacy,h:'#'},{l:L.foot.links.ted,h:'https://ted.com'}]},
              ].map((col,i)=>(
                <div key={i}>
                  <h5 style={{color:'#ccc',fontSize:11,fontWeight:700,marginBottom:12,letterSpacing:1,textTransform:'uppercase',fontFamily:"var(--font-sans)"}}>{col.title}</h5>
                  <ul style={{listStyle:'none',padding:0,display:'flex',flexDirection:'column',gap:8}}>
                    {col.links.map((lk,j)=>(<li key={j}><a href={lk.h} style={{color:'#444',fontSize:13,textDecoration:'none',transition:'color 0.2s',fontFamily:"var(--font-sans)"}} onMouseEnter={e=>e.target.style.color='#ccc'} onMouseLeave={e=>e.target.style.color='#444'}>{lk.l}</a></li>))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:18,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
              <p style={{color:'#333',fontSize:11,fontFamily:"var(--font-sans)"}}>{L.foot.rights}</p>
              <p style={{color:'#333',fontSize:11,fontFamily:"var(--font-sans)"}}>{L.foot.indep}</p>
            </div>
          </div>
        </footer>
      </div>

      {/* SPEAKER MODAL */}
      {modal&&(
        <div onClick={()=>setModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(10px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'rgba(17,17,17,0.96)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:22,width:'100%',maxWidth:440,overflow:'hidden',animation:'fadeUp 0.3s ease'}}>
            <div style={{height:130,background:`linear-gradient(160deg,${modal.color},#0A0A0A 120%)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:56,fontWeight:900,color:'rgba(255,255,255,0.9)',position:'relative',fontFamily:"var(--font-display)"}}>
              {lang==='ar'?modal.initAr:modal.initEn}
              <button onClick={()=>setModal(null)} style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,0.5)',border:'none',color:'#fff',width:28,height:28,borderRadius:8,cursor:'pointer',fontSize:13}}>✕</button>
            </div>
            <div style={{padding:22}}>
              <h3 style={{color:'#fff',fontSize:19,fontWeight:700,marginBottom:4,fontFamily:"var(--font-sans)"}}>{lang==='ar'?modal.ar:modal.en}</h3>
              <p style={{color:modal.color,fontSize:12,marginBottom:12,fontFamily:"var(--font-sans)"}}>{lang==='ar'?modal.rolAr:modal.rolEn}</p>
              <p style={{color:'#666',fontSize:13,lineHeight:1.7,marginBottom:16,fontFamily:"var(--font-text)"}}>{lang==='ar'?'متحدث/ة في TEDx OKADH 2026. السيرة الذاتية الكاملة ستُضاف قريبًا.':'A 2026 TEDx OKADH speaker. Full biography coming soon.'}</p>
              <div style={{background:'rgba(230,43,30,0.07)',border:'1px solid rgba(230,43,30,0.18)',borderRadius:10,padding:14}}>
                <div style={{color:'#E62B1E',fontSize:10,letterSpacing:2,textTransform:'uppercase',marginBottom:6,fontFamily:"var(--font-sans)"}}>{lang==='ar'?'عنوان الكلمة':'Talk Title'}</div>
                <p style={{color:'#ccc',fontSize:14,fontWeight:600,fontFamily:"var(--font-display)"}}>"{lang==='ar'?modal.talkAr:modal.talkEn}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

// =============================================
// ROOT
// =============================================
function AppInner() {
  const [showSplash,setShowSplash]=useState(true)
  const [lang,setLang]=useState(()=>localStorage.getItem('tedx-lang')||'ar')
  const navigate=useNavigate()

  useEffect(()=>{
    document.documentElement.dir=lang==='ar'?'rtl':'ltr'
    document.documentElement.lang=lang
    localStorage.setItem('tedx-lang',lang)
  },[lang])

  return (
    <>
      {showSplash&&<Splash onDone={()=>setShowSplash(false)}/>}
      {!showSplash&&(
        <>
          <Nav lang={lang} setLang={setLang} navigate={navigate}/>
          <div style={{paddingTop:64}}>
            <Routes>
              <Route path="/" element={<HomePage lang={lang} navigate={navigate}/>}/>
              <Route path="/register" element={<RegistrationPage lang={lang}/>}/>
              <Route path="/scanner" element={<ScannerPage lang={lang}/>}/>
              <Route path="/vip" element={<VIPRegistrationPage lang={lang}/>}/>
              <Route path="/dashboard" element={<DashboardPage/>}/>
              <Route path="/confirm/:code" element={<ConfirmPage/>}/>
            </Routes>
          </div>
        </>
      )}
    </>
  )
}

export default function App() {
  return <BrowserRouter><AppInner/></BrowserRouter>
}
