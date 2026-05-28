import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const IMG_BASE = process.env.REACT_APP_IMG_BASE || 'http://localhost:5000';

const ZONES = [
  "ไม่ระบุโซน / อื่นๆ","สยาม / ปทุมวัน / ราชเทวี","สุขุมวิท / ทองหล่อ / เอกมัย",
  "สีลม / สาทร / บางรัก","อารีย์ / พหลโยธิน / ลาดพร้าว","เยาวราช / พระนคร / เกาะรัตนโกสินทร์",
  "ฝั่งธนบุรี / วงเวียนใหญ่","ชานเมือง / ปริมณฑล","ต่างจังหวัด"
];
const ZONE_EMOJI = {
  "ไม่ระบุโซน / อื่นๆ":"📌","สยาม / ปทุมวัน / ราชเทวี":"🏙️",
  "สุขุมวิท / ทองหล่อ / เอกมัย":"✨","สีลม / สาทร / บางรัก":"🌆",
  "อารีย์ / พหลโยธิน / ลาดพร้าว":"🌿","เยาวราช / พระนคร / เกาะรัตนโกสินทร์":"🏮",
  "ฝั่งธนบุรี / วงเวียนใหญ่":"🌉","ชานเมือง / ปริมณฑล":"🏡","ต่างจังหวัด":"🗺️"
};

// Helper: convert stored path to full URL
const imgUrl = (src) => {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('data:')) return src; // base64 fallback
  return IMG_BASE + src;
};

const EMPTY_FORM = { id:null, name:'', recommendedMenu:'', zone:ZONES[0], locationName:'', latitude:'', longitude:'', rating:5, images:[] };
const EMPTY_USER_FORM = { username:'', password:'', role:'user' };

// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=Sarabun:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --or-yellow:#FFCC00;
  --or-yellow-d:#E6B800;
  --or-yellow-l:#FFF8CC;
  --or-orange:#FF8C00;
  --or-red:#E03030;
  --white:#FFFFFF;
  --gray-f:#F7F7F7;
  --gray-e:#EEEEEE;
  --gray-d:#DDDDDD;
  --gray-9:#999999;
  --gray-6:#666666;
  --gray-3:#333333;
  --green:#27AE60;
  --green-l:#E8F8EE;
  --blue:#2980B9;
  --blue-l:#EAF4FB;
  --rouge:#E03030;
  --rouge-l:#FDECEA;
  --shadow:rgba(0,0,0,.08);
  --shadow-m:rgba(0,0,0,.16);
  --header-h:60px;
  --tab-h:62px;
}
html{font-size:16px;scroll-behavior:smooth}
body{background:var(--gray-f);color:var(--gray-3);font-family:'Prompt','Sarabun',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--gray-f)}::-webkit-scrollbar-thumb{background:var(--gray-d);border-radius:4px}
input,select,textarea{font-family:'Prompt','Sarabun',sans-serif;font-size:15px;color:var(--gray-3);background:#fff;border:1.5px solid var(--gray-d);border-radius:10px;padding:12px 15px;width:100%;outline:none;transition:border-color .2s,box-shadow .2s;-webkit-appearance:none;appearance:none;touch-action:manipulation}
input:focus,select:focus,textarea:focus{border-color:var(--or-yellow-d);box-shadow:0 0 0 3px rgba(255,204,0,.2)}
input::placeholder,textarea::placeholder{color:var(--gray-9)}
select option{background:#fff;color:var(--gray-3)}
textarea{resize:vertical;min-height:80px}
button{font-family:'Prompt','Sarabun',sans-serif;cursor:pointer;border:none;outline:none;transition:all .18s ease;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-weight:500;touch-action:manipulation;min-height:44px;-webkit-tap-highlight-color:transparent}
button:active{transform:scale(.97)}
button:disabled{opacity:.5;cursor:not-allowed;transform:none!important}

/* ── Buttons ── */
.btn-primary{background:linear-gradient(135deg,var(--or-yellow),#FFD700);color:var(--gray-3);padding:13px 22px;border-radius:10px;font-size:15px;font-weight:700;width:100%;box-shadow:0 3px 14px rgba(255,204,0,.35)}
.btn-primary:hover:not(:disabled){background:linear-gradient(135deg,var(--or-yellow-d),var(--or-yellow));box-shadow:0 6px 20px rgba(255,204,0,.45);transform:translateY(-1px)}
.btn-outline{background:transparent;color:var(--gray-6);padding:11px 18px;border-radius:10px;font-size:14px;border:1.5px solid var(--gray-d)}
.btn-outline:hover{border-color:var(--gray-9);color:var(--gray-3);background:var(--gray-f)}
.btn-sm{padding:7px 14px;font-size:13px;border-radius:7px;min-height:34px}
.btn-soft{background:var(--or-yellow-l);color:#8B6914;padding:8px 14px;border-radius:8px;font-size:13px;border:1px solid rgba(255,204,0,.4);min-height:36px}
.btn-soft:hover{background:#FFF0A0}
.btn-danger{background:var(--rouge-l);color:var(--rouge);padding:8px 14px;border-radius:8px;font-size:13px;border:1px solid rgba(224,48,48,.18);min-height:36px}
.btn-danger:hover{background:#fad5d2}
.btn-green{background:var(--green-l);color:var(--green);padding:8px 14px;border-radius:8px;font-size:13px;border:1px solid rgba(39,174,96,.2);min-height:36px}
.btn-icon{background:var(--gray-f);color:var(--gray-6);padding:7px;border-radius:8px;font-size:16px;border:1px solid var(--gray-e);min-height:34px;min-width:34px;width:34px;height:34px}
.btn-icon:hover{background:var(--gray-e)}

/* ── Cards ── */
.card{background:#fff;border:1px solid var(--gray-e);border-radius:14px;box-shadow:0 2px 12px var(--shadow);overflow:hidden}
.card-hover{transition:box-shadow .2s,transform .2s}
.card-hover:hover{box-shadow:0 8px 28px var(--shadow-m);transform:translateY(-3px)}

/* ── Tags ── */
.tag{display:inline-flex;align-items:center;gap:3px;background:var(--gray-f);border:1px solid var(--gray-e);color:var(--gray-6);font-size:11px;padding:3px 9px;border-radius:20px;white-space:nowrap;line-height:1.4;font-weight:500}
.tag-yellow{background:var(--or-yellow-l);border-color:rgba(255,204,0,.5);color:#8B6914}
.tag-green{background:var(--green-l);border-color:rgba(39,174,96,.2);color:var(--green)}
.tag-red{background:var(--rouge-l);border-color:rgba(224,48,48,.2);color:var(--rouge)}
.tag-blue{background:var(--blue-l);border-color:rgba(41,128,185,.2);color:var(--blue)}
.tag-admin{background:linear-gradient(135deg,#FFF8CC,#FFEEAA);border-color:var(--or-yellow-d);color:#7A5C00}

.lbl{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gray-9)}
.divider{height:1px;background:var(--gray-e)}

/* ── Animations ── */
.fade-in{animation:fadeIn .3s ease forwards}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* ── Map ── */
.map-container{border-radius:12px;overflow:hidden;border:1.5px solid var(--gray-d)}

/* ── Modal (bottom sheet) ── */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:999;display:flex;align-items:flex-end;justify-content:center;animation:fadeOverlay .2s ease}
@keyframes fadeOverlay{from{opacity:0}to{opacity:1}}
.modal-sheet{background:#fff;border-radius:22px 22px 0 0;width:100%;max-width:580px;max-height:93vh;overflow-y:auto;animation:slideSheet .28s cubic-bezier(.25,.8,.25,1);box-shadow:0 -8px 50px rgba(0,0,0,.22)}
@keyframes slideSheet{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@media(min-width:580px){.modal-overlay{align-items:center}.modal-sheet{border-radius:18px;max-height:88vh}}

/* ── FAB ── */
.fab{position:fixed;bottom:74px;right:18px;z-index:90;width:60px;height:60px;border-radius:18px;background:linear-gradient(135deg,var(--or-yellow),#FFD700);color:var(--gray-3);font-size:30px;font-weight:700;box-shadow:0 6px 28px rgba(255,204,0,.5);display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:all .2s;-webkit-tap-highlight-color:transparent}
.fab:hover{transform:scale(1.08) translateY(-2px);box-shadow:0 10px 36px rgba(255,204,0,.6)}
.fab:active{transform:scale(.93)}

/* ── Tab bar ── */
.tab-bar{display:flex;background:#fff;border-top:1px solid var(--gray-e);position:fixed;bottom:0;left:0;right:0;z-index:80;box-shadow:0 -2px 18px var(--shadow)}
.tab-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:8px 4px;background:none;border:none;font-size:10px;color:var(--gray-9);cursor:pointer;min-height:60px;transition:color .15s;font-family:'Prompt','Sarabun',sans-serif;font-weight:600;-webkit-tap-highlight-color:transparent;position:relative}
.tab-btn.active{color:var(--or-yellow-d)}
.tab-btn.active::after{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:28px;height:3px;background:var(--or-yellow-d);border-radius:0 0 4px 4px}
.tab-btn .tab-icon{font-size:22px;transition:transform .15s}
.tab-btn.active .tab-icon{transform:scale(1.15)}

/* ── Skeleton ── */
.skeleton{background:linear-gradient(90deg,var(--gray-e) 25%,var(--gray-d) 50%,var(--gray-e) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}

/* ── Header ── */
.or-header{background:var(--or-yellow);height:var(--header-h);display:flex;align-items:center;padding:0 16px;position:sticky;top:0;z-index:100;box-shadow:0 2px 16px rgba(0,0,0,.12)}

/* ── Search bar ── */
.or-search{flex:1;margin:0 12px;background:rgba(255,255,255,.95);border:none;border-radius:26px;padding:9px 18px;font-size:14px;height:38px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
.or-search:focus{outline:none;box-shadow:0 2px 14px rgba(0,0,0,.18)}

/* ── Category chips ── */
.cat-scroll{display:flex;gap:12px;overflow-x:auto;padding:14px 16px;background:#fff;border-bottom:1px solid var(--gray-e);scrollbar-width:none}
.cat-scroll::-webkit-scrollbar{display:none}
.cat-chip{display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0;cursor:pointer;min-width:56px}
.cat-chip-icon{width:54px;height:54px;border-radius:16px;background:var(--gray-f);display:flex;align-items:center;justify-content:center;font-size:24px;border:2px solid var(--gray-e);transition:all .18s}
.cat-chip.active .cat-chip-icon{background:var(--or-yellow-l);border-color:var(--or-yellow-d);box-shadow:0 3px 10px rgba(255,204,0,.3)}
.cat-chip-label{font-size:10px;color:var(--gray-6);font-weight:600;text-align:center;white-space:nowrap;max-width:64px;overflow:hidden;text-overflow:ellipsis}
.cat-chip.active .cat-chip-label{color:var(--or-yellow-d)}

/* ── Restaurant card ── */
.res-card{background:#fff;border-radius:14px;box-shadow:0 3px 16px var(--shadow);overflow:hidden;cursor:pointer;transition:box-shadow .22s,transform .22s}
.res-card:hover{box-shadow:0 10px 34px var(--shadow-m);transform:translateY(-3px)}
.res-card-img{width:100%;height:190px;object-fit:cover;background:linear-gradient(135deg,var(--gray-e),var(--gray-d))}
.res-card-img-placeholder{width:100%;height:190px;background:linear-gradient(135deg,#FFF8CC 0%,#FFE566 60%,#FFCC00 100%);display:flex;align-items:center;justify-content:center;font-size:60px}
.res-card-body{padding:14px 16px}
.res-card-name{font-size:16px;font-weight:700;color:var(--gray-3);margin-bottom:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.res-card-menu{font-size:13px;color:var(--gray-6);margin-bottom:10px;display:flex;align-items:center;gap:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.res-card-meta{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px}

/* ── Featured banner ── */
.featured-banner{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:16px;overflow:hidden;position:relative;margin:14px 14px 0}
.featured-img{width:100%;height:200px;object-fit:cover;opacity:.6}
.featured-img-placeholder{width:100%;height:200px;background:linear-gradient(135deg,#FFD700 0%,#FF8C00 100%);display:flex;align-items:center;justify-content:center;font-size:80px}
.featured-overlay{position:absolute;bottom:0;left:0;right:0;padding:20px 18px;background:linear-gradient(to top,rgba(0,0,0,.9) 0%,rgba(0,0,0,.4) 60%,transparent 100%)}

/* ── Gallery ── */
.gallery-main{width:100%;height:270px;object-fit:cover;background:var(--gray-e)}
.gallery-main-placeholder{width:100%;height:270px;background:linear-gradient(135deg,#FFF8CC,#FFE066);display:flex;align-items:center;justify-content:center;font-size:90px}
.gallery-thumbs{display:flex;gap:7px;overflow-x:auto;padding:6px 0;scrollbar-width:none}
.gallery-thumbs::-webkit-scrollbar{display:none}
.gallery-thumb{width:72px;height:72px;flex-shrink:0;border-radius:10px;object-fit:cover;border:2.5px solid transparent;cursor:pointer;transition:border-color .15s,transform .15s}
.gallery-thumb.active{border-color:var(--or-yellow-d);transform:scale(1.05)}
.gallery-thumb-placeholder{width:72px;height:72px;flex-shrink:0;border-radius:10px;background:var(--or-yellow-l);display:flex;align-items:center;justify-content:center;font-size:26px;border:2.5px solid var(--or-yellow-d)}

/* ── Star ── */
.star-btn{background:none;border:none;cursor:pointer;font-size:30px;padding:2px;min-height:unset;transition:transform .12s}
.star-btn:active{transform:scale(.88)!important}

/* ── Image upload ── */
.img-upload-area{border:2px dashed var(--or-yellow-d);border-radius:12px;padding:22px;text-align:center;cursor:pointer;background:var(--or-yellow-l);transition:all .2s}
.img-upload-area:hover{background:#FFF0A0;border-color:var(--or-orange)}
.img-preview-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px}
.img-preview-item{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden}
.img-preview-item img{width:100%;height:100%;object-fit:cover}
.img-preview-remove{position:absolute;top:4px;right:4px;background:rgba(0,0,0,.65);color:#fff;border:none;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;min-height:unset;padding:0}
.img-uploading{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;gap:5px}

/* ── Section title ── */
.section-title{font-size:17px;font-weight:700;color:var(--gray-3);display:flex;align-items:center;gap:8px}
.section-title::before{content:'';display:inline-block;width:4px;height:20px;background:linear-gradient(to bottom,var(--or-yellow),var(--or-yellow-d));border-radius:3px}

/* ── Zone chip ── */
.zone-chip{background:#fff;border:1.5px solid var(--gray-d);color:var(--gray-6);padding:7px 16px;border-radius:24px;font-size:12px;white-space:nowrap;min-height:unset;font-weight:600;cursor:pointer;transition:all .15s}
.zone-chip.active{background:var(--or-yellow);border-color:var(--or-yellow-d);color:var(--gray-3);box-shadow:0 2px 10px rgba(255,204,0,.35)}

/* ── Admin header ── */
.admin-header{background:linear-gradient(135deg,#1a1a2e,#16213e);height:var(--header-h);display:flex;align-items:center;padding:0 16px;position:sticky;top:0;z-index:100;box-shadow:0 2px 18px rgba(0,0,0,.25)}

/* ── Stat card ── */
.stat-card-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(min-width:480px){.stat-card-grid{grid-template-columns:repeat(4,1fr)}}

/* ── Responsive ── */
@media(max-width:480px){.hide-mobile{display:none!important}.stack-mobile{flex-direction:column!important}.full-mobile{width:100%!important}input,select,textarea{font-size:16px}}

/* ── Restaurant grid responsive ── */
.res-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
@media(max-width:640px){.res-grid{grid-template-columns:1fr}}
@media(min-width:641px) and (max-width:1024px){.res-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1025px){.res-grid{grid-template-columns:repeat(3,1fr)}}

/* ── Img error fallback ── */
img.res-card-img{background:linear-gradient(135deg,#FFF8CC 0%,#FFE566 60%,#FFCC00 100%)}

/* ── Image upload preview improvement ── */
.img-preview-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px}
@media(min-width:480px){.img-preview-grid{grid-template-columns:repeat(4,1fr)}}

/* ── Detail modal gallery improvement ── */
.gallery-main{width:100%;height:260px;object-fit:cover;background:linear-gradient(135deg,#FFF8CC,#FFE066)}
@media(min-width:580px){.gallery-main{height:320px}}

/* ── Card image improvement ── */
.res-card-img{width:100%;height:200px;object-fit:cover;background:linear-gradient(135deg,#FFF8CC 0%,#FFE566 60%,#FFCC00 100%);display:block}
@media(max-width:480px){.res-card-img{height:170px}}

/* ── Zone group horizontal scroll cards ── */
.zone-scroll-card{flex-shrink:0;width:165px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 3px 14px rgba(0,0,0,.09);cursor:pointer;transition:box-shadow .2s,transform .2s}
.zone-scroll-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.15)}
@media(max-width:480px){.zone-scroll-card{width:145px}}

/* ── Page container ── */
.page-container{max-width:900px;margin:0 auto;padding:16px 14px;display:flex;flex-direction:column;gap:16px}
@media(max-width:480px){.page-container{padding:12px 10px}}
`;


// ─── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = '#333' }) {
  return <span style={{ display:'inline-block', width:size, height:size, border:`2px solid ${color}30`, borderTopColor:color, borderRadius:'50%', animation:'spin .7s linear infinite', flexShrink:0 }} />;
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3400); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success:{ bg:'#E8F8EE', border:'#27AE60', text:'#145A32', icon:'✓' },
    error:  { bg:'#FDECEA', border:'#E03030', text:'#7B241C', icon:'✕' },
    info:   { bg:'#FFF8CC', border:'#E6B800', text:'#7A5C00', icon:'ℹ' }
  };
  const c = cfg[type] || cfg.info;
  return (
    <div style={{ position:'fixed', bottom:'78px', left:'50%', transform:'translateX(-50%)', background:c.bg, border:`1.5px solid ${c.border}`, borderLeft:`4px solid ${c.border}`, color:c.text, padding:'12px 18px 12px 14px', borderRadius:'14px', boxShadow:'0 8px 32px rgba(0,0,0,.16)', zIndex:9999, fontSize:'14px', display:'flex', alignItems:'center', gap:'10px', animation:'fadeIn .2s ease', whiteSpace:'nowrap', fontWeight:600, maxWidth:'92vw' }}>
      <span style={{ fontWeight:800, fontSize:'16px' }}>{c.icon}</span>
      <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{msg}</span>
      <span onClick={onClose} style={{ marginLeft:'8px', cursor:'pointer', opacity:.5, fontSize:'13px', flexShrink:0 }}>✕</span>
    </div>
  );
}

// ─── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ value, size = 14 }) {
  return (
    <span style={{ display:'inline-flex', gap:'1px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= value ? '#FFCC00':'#DDDDDD', fontSize:size+'px' }}>★</span>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:'flex', gap:'2px', alignItems:'center' }}>
      {[1,2,3,4,5].map(i => (
        <button key={i} className="star-btn" type="button" onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          style={{ color: i <= (hover||value) ? '#FFCC00':'#DDDDDD', transform: i <= (hover||value) ? 'scale(1.25)':'scale(1)' }}>★</button>
      ))}
      <span style={{ fontSize:'13px', color:'var(--gray-9)', marginLeft:'8px', fontWeight:700 }}>{value}/5</span>
    </div>
  );
}

// ─── Image Uploader (uploads to server, returns URL paths) ─────────────────────
function ImageUploader({ images, onChange, showToast }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 5 - images.length);
    if (arr.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      arr.forEach(f => formData.append('images', f));
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.urls) {
        onChange(prev => [...prev, ...res.data.urls].slice(0, 5));
      }
    } catch (err) {
      if (showToast) showToast('อัปโหลดรูปไม่สำเร็จ: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };
  const removeImage = (idx) => { onChange(prev => prev.filter((_, i) => i !== idx)); };

  return (
    <div>
      <div className="img-upload-area" onClick={() => !uploading && inputRef.current.click()}
        onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
        {uploading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', color:'#8B6914' }}>
            <Spinner size={18} color="#8B6914" />
            <span style={{ fontSize:'14px', fontWeight:600 }}>กำลังอัปโหลด...</span>
          </div>
        ) : (
          <>
            <div style={{ fontSize:'36px', marginBottom:'6px' }}>📷</div>
            <p style={{ fontSize:'14px', fontWeight:700, color:'#8B6914' }}>เพิ่มรูปภาพร้านอาหาร</p>
            <p style={{ fontSize:'12px', color:'var(--gray-9)', marginTop:'3px' }}>กดหรือลากไฟล์มาวางที่นี่ (สูงสุด 5 รูป)</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display:'none' }}
          onChange={e => handleFiles(e.target.files)} disabled={uploading} />
      </div>
      {images.length > 0 && (
        <div>
          <p style={{ fontSize:'12px', color:'var(--gray-9)', margin:'8px 0 6px', fontWeight:600 }}>
            รูปที่เลือก {images.length}/5 รูป
          </p>
          <div className="img-preview-grid">
            {images.map((src, idx) => (
              <div key={idx} className="img-preview-item">
                <img src={imgUrl(src)} alt={`preview-${idx}`}
                  onError={e => { e.target.style.display='none'; e.target.parentNode.style.background='#FFF8CC'; }} />
                <button className="img-preview-remove" type="button" onClick={() => removeImage(idx)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Map Picker ────────────────────────────────────────────────────────────────
function MapPicker({ lat, lng, onPick }) {
  const mapRef = useRef(null); const mapInstanceRef = useRef(null); const markerRef = useRef(null);
  const id = useRef('mp-' + Math.random().toString(36).slice(2));
  const makeIcon = (L) => L.divIcon({ html:`<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:var(--or-yellow);transform:rotate(-45deg);border:2.5px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,.3);"></div>`, className:'', iconSize:[28,28], iconAnchor:[14,28], popupAnchor:[0,-28] });
  useEffect(() => {
    if (mapRef.current || mapInstanceRef.current) return;
    const load = async () => {
      if (!window.L) {
        if (!document.getElementById('lf-css')) { const l=document.createElement('link'); l.id='lf-css'; l.rel='stylesheet'; l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(l); }
        await new Promise((res,rej) => { const s=document.createElement('script'); s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
      }
      const L=window.L, defLat=lat||13.7563, defLng=lng||100.5018;
      const map=L.map(id.current,{zoomControl:true,scrollWheelZoom:true}); mapInstanceRef.current=map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
      map.setView([defLat,defLng],13);
      const addMarker=(la,ln)=>{ markerRef.current=L.marker([la,ln],{icon:makeIcon(L),draggable:true}).addTo(map); markerRef.current.on('dragend',e=>{const p=e.target.getLatLng();onPick(p.lat.toFixed(6),p.lng.toFixed(6));}); };
      if (lat&&lng) addMarker(lat,lng);
      map.on('click',e=>{ const{lat:nl,lng:nlg}=e.latlng; if(markerRef.current)markerRef.current.setLatLng([nl,nlg]); else addMarker(nl,nlg); onPick(nl.toFixed(6),nlg.toFixed(6)); });
    };
    load(); mapRef.current=true;
    return()=>{ if(mapInstanceRef.current){mapInstanceRef.current.remove();mapInstanceRef.current=null;markerRef.current=null;mapRef.current=null;} };
  }, []);
  useEffect(() => {
    if(!mapInstanceRef.current||!window.L||!lat||!lng) return;
    const L=window.L;
    if(markerRef.current)markerRef.current.setLatLng([parseFloat(lat),parseFloat(lng)]);
    else{const icon=L.divIcon({html:`<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#FFCC00;transform:rotate(-45deg);border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);"></div>`,className:'',iconSize:[28,28],iconAnchor:[14,28]});markerRef.current=L.marker([parseFloat(lat),parseFloat(lng)],{icon,draggable:true}).addTo(mapInstanceRef.current);markerRef.current.on('dragend',e=>{const p=e.target.getLatLng();onPick(p.lat.toFixed(6),p.lng.toFixed(6));});}
    mapInstanceRef.current.setView([parseFloat(lat),parseFloat(lng)],15);
  }, [lat,lng]);
  return <div id={id.current} className="map-container" style={{height:'230px',width:'100%'}} />;
}

// ─── Map View (read-only) ──────────────────────────────────────────────────────
function MapView({ lat, lng, name }) {
  const id = useRef('mv-'+Math.random().toString(36).slice(2)); const mRef=useRef(null); const init=useRef(false);
  useEffect(()=>{
    if(init.current||mRef.current)return; init.current=true;
    const go=async()=>{
      if(!window.L){if(!document.getElementById('lf-css')){const l=document.createElement('link');l.id='lf-css';l.rel='stylesheet';l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(l);}await new Promise(r=>{const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=r;document.head.appendChild(s);});}
      const L=window.L,map=L.map(id.current,{zoomControl:false,dragging:false,scrollWheelZoom:false}); mRef.current=map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      map.setView([parseFloat(lat),parseFloat(lng)],15);
      const icon=L.divIcon({html:`<div style="width:20px;height:20px;border-radius:50%;background:#FFCC00;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);"></div>`,className:'',iconSize:[20,20],iconAnchor:[10,10]});
      L.marker([parseFloat(lat),parseFloat(lng)],{icon}).addTo(map).bindPopup(name||'ร้านอาหาร');
    };
    go(); return()=>{if(mRef.current){mRef.current.remove();mRef.current=null;}};
  },[]);
  return <div id={id.current} className="map-container" style={{height:'170px',width:'100%'}} />;
}

// ─── Restaurant Form Modal ─────────────────────────────────────────────────────
function RestaurantFormModal({ resForm, setResForm, isEditing, onSave, onClose, saveLoad, showToast }) {
  const [showMap, setShowMap] = useState(!!(resForm.latitude && resForm.longitude));
  const [gpsLoad, setGpsLoad] = useState(false);

  const handleGPS = () => {
    if (!navigator.geolocation) return alert('เบราว์เซอร์ไม่รองรับ GPS');
    setGpsLoad(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setResForm(f => ({ ...f, latitude:pos.coords.latitude.toFixed(6), longitude:pos.coords.longitude.toFixed(6) })); setShowMap(true); setGpsLoad(false); },
      () => { setGpsLoad(false); alert('ไม่สามารถดึงพิกัดได้'); },
      { enableHighAccuracy:true, timeout:10000 }
    );
  };

  return (
    <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ width:'44px', height:'5px', background:'var(--gray-d)', borderRadius:'4px', margin:'14px auto 0' }} />
        <div style={{ padding:'16px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h3 style={{ fontSize:'21px', color:'var(--gray-3)', fontWeight:800 }}>
              {isEditing ? '✏️ แก้ไขข้อมูลร้าน' : '🍜 เพิ่มร้านอาหารโปรด'}
            </h3>
            <p style={{ fontSize:'12px', color:'var(--gray-9)', marginTop:'3px' }}>
              {isEditing ? 'ปรับปรุงรายละเอียดร้านอาหาร' : 'บันทึกร้านโปรดลงคลังของคุณ'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" style={{ fontSize:'18px' }}>✕</button>
        </div>

        <div style={{ padding:'16px 20px 44px', display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Image Upload */}
          <div>
            <label className="lbl" style={{ display:'block', marginBottom:'9px' }}>📷 รูปภาพร้านอาหาร</label>
            <ImageUploader
              images={resForm.images || []}
              showToast={showToast}
              onChange={(updater) => setResForm(f => ({ ...f, images: typeof updater === 'function' ? updater(f.images || []) : updater }))}
            />
          </div>

          {/* Name */}
          <div>
            <label className="lbl" style={{ display:'block', marginBottom:'8px' }}>ชื่อร้านอาหาร *</label>
            <input type="text" placeholder="เช่น ร้านก๋วยเตี๋ยวเรือป้าแดง"
              value={resForm.name} onChange={e => setResForm(f => ({ ...f, name:e.target.value }))} />
          </div>

          {/* Menu */}
          <div>
            <label className="lbl" style={{ display:'block', marginBottom:'8px' }}>เมนูแนะนำ / Signature Dish *</label>
            <input type="text" placeholder="เช่น ก๋วยเตี๋ยวเรือหมู น้ำตก"
              value={resForm.recommendedMenu} onChange={e => setResForm(f => ({ ...f, recommendedMenu:e.target.value }))} />
          </div>

          {/* Zone */}
          <div>
            <label className="lbl" style={{ display:'block', marginBottom:'8px' }}>โซน / ย่านที่ตั้ง</label>
            <div style={{ position:'relative' }}>
              <select value={resForm.zone} onChange={e => setResForm(f => ({ ...f, zone:e.target.value }))}>
                {ZONES.map(z => <option key={z} value={z}>{ZONE_EMOJI[z]} {z}</option>)}
              </select>
              <span style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--gray-9)' }}>▾</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="lbl" style={{ display:'block', marginBottom:'8px' }}>ทำเลละเอียด *</label>
            <input type="text" placeholder="เช่น ทองหล่อ ซ.5 ใกล้ BTS"
              value={resForm.locationName} onChange={e => setResForm(f => ({ ...f, locationName:e.target.value }))} />
          </div>

          {/* Rating */}
          <div style={{ background:'var(--gray-f)', borderRadius:'12px', padding:'14px 16px', border:'1px solid var(--gray-e)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
              <div>
                <label className="lbl">คะแนนความชอบ</label>
                <p style={{ fontSize:'11px', color:'var(--gray-9)', marginTop:'2px' }}>ให้คะแนน 1–5 ดาว</p>
              </div>
              <StarPicker value={resForm.rating} onChange={v => setResForm(f => ({ ...f, rating:v }))} />
            </div>
          </div>

          {/* GPS */}
          <div style={{ border:'1.5px dashed var(--gray-d)', borderRadius:'12px', overflow:'hidden' }}>
            <div style={{ padding:'12px 15px', background:'var(--gray-f)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
              <div>
                <label className="lbl">📍 พิกัด GPS (ไม่บังคับ)</label>
                <p style={{ fontSize:'11px', color:'var(--gray-9)', marginTop:'2px' }}>กดบนแผนที่หรือดึงพิกัดอัตโนมัติ</p>
              </div>
              <div style={{ display:'flex', gap:'7px' }}>
                <button type="button" className="btn-soft btn-sm" onClick={() => setShowMap(v => !v)}>
                  🗺️ {showMap ? 'ซ่อน':'แผนที่'}
                </button>
                <button type="button" className="btn-soft btn-sm" onClick={handleGPS} disabled={gpsLoad}>
                  {gpsLoad ? <Spinner size={12} color="#8B6914" /> : '📡 GPS'}
                </button>
              </div>
            </div>
            <div style={{ padding:'10px 15px', display:'flex', gap:'8px' }}>
              <div style={{ flex:1 }}>
                <label className="lbl" style={{ display:'block', marginBottom:'5px' }}>LATITUDE</label>
                <input type="text" placeholder="13.7563" value={resForm.latitude}
                  onChange={e => setResForm(f => ({ ...f, latitude:e.target.value }))} style={{ fontSize:'14px' }} />
              </div>
              <div style={{ flex:1 }}>
                <label className="lbl" style={{ display:'block', marginBottom:'5px' }}>LONGITUDE</label>
                <input type="text" placeholder="100.5018" value={resForm.longitude}
                  onChange={e => setResForm(f => ({ ...f, longitude:e.target.value }))} style={{ fontSize:'14px' }} />
              </div>
            </div>
            {showMap && (
              <div style={{ padding:'0 15px 15px' }}>
                <MapPicker
                  lat={resForm.latitude ? parseFloat(resForm.latitude) : null}
                  lng={resForm.longitude ? parseFloat(resForm.longitude) : null}
                  onPick={(la,ln) => setResForm(f => ({ ...f, latitude:la, longitude:ln }))} />
                <p style={{ fontSize:'11px', color:'var(--gray-9)', marginTop:'6px', textAlign:'center' }}>
                  กดบนแผนที่เพื่อปักหมุด • ลากหมุดเพื่อเปลี่ยนตำแหน่ง
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display:'flex', gap:'10px', paddingTop:'4px' }}>
            <button type="button" className="btn-outline" onClick={onClose} style={{ flex:1 }}>ยกเลิก</button>
            <button type="button" className="btn-primary" disabled={saveLoad} onClick={onSave} style={{ flex:2, fontSize:'15px' }}>
              {saveLoad ? <><Spinner size={15} color="#333" /> กำลังบันทึก...</> : isEditing ? '💾 บันทึกการแก้ไข' : '✦ บันทึกร้านอาหาร'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── User Modal (Admin) ────────────────────────────────────────────────────────
function UserModal({ mode, data, onClose, onSave, loading }) {
  const [form, setForm] = useState(mode === 'edit' ? { username:data?.username||'', password:'', role:data?.role||'user' } : EMPTY_USER_FORM);
  const [showPw, setShowPw] = useState(false);
  const isEdit = mode === 'edit';

  return (
    <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ width:'44px', height:'5px', background:'var(--gray-d)', borderRadius:'4px', margin:'14px auto 0' }} />
        <div style={{ padding:'16px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h3 style={{ fontSize:'21px', color:'var(--gray-3)', fontWeight:800 }}>
              {isEdit ? '✏️ แก้ไขผู้ใช้' : '👤 เพิ่มผู้ใช้ใหม่'}
            </h3>
            <p style={{ fontSize:'12px', color:'var(--gray-9)', marginTop:'3px' }}>
              {isEdit ? `กำลังแก้ไข: ${data?.username}` : 'สร้างบัญชีผู้ใช้ในระบบ'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" style={{ fontSize:'18px' }}>✕</button>
        </div>
        <div style={{ padding:'18px 22px 44px', display:'flex', flexDirection:'column', gap:'15px' }}>
          <div>
            <label className="lbl" style={{ display:'block', marginBottom:'8px' }}>USERNAME</label>
            <input type="text" placeholder="ชื่อผู้ใช้" value={form.username}
              onChange={e => setForm(f => ({ ...f, username:e.target.value }))}
              disabled={isEdit} style={isEdit ? { background:'var(--gray-f)', color:'var(--gray-9)' } : {}} />
            {isEdit && <p style={{ fontSize:'11px', color:'var(--gray-9)', marginTop:'4px' }}>ไม่สามารถเปลี่ยน username ได้</p>}
          </div>
          <div>
            <label className="lbl" style={{ display:'block', marginBottom:'8px' }}>
              {isEdit ? 'PASSWORD ใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'PASSWORD *'}
            </label>
            <div style={{ position:'relative' }}>
              <input type={showPw ? 'text':'password'} placeholder={isEdit ? 'กรอกรหัสผ่านใหม่...':'ตั้งรหัสผ่าน'}
                value={form.password} onChange={e => setForm(f => ({ ...f, password:e.target.value }))} style={{ paddingRight:'48px' }} />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', minHeight:'unset', padding:'4px', color:'var(--gray-9)', fontSize:'16px' }}>
                {showPw ? '🙈':'👁'}
              </button>
            </div>
          </div>
          <div>
            <label className="lbl" style={{ display:'block', marginBottom:'8px' }}>ROLE</label>
            <div style={{ display:'flex', gap:'10px' }}>
              {['user','admin'].map(r => (
                <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role:r }))}
                  style={{ flex:1, padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:700, border:`2px solid ${form.role===r ? 'var(--or-yellow-d)':'var(--gray-d)'}`, background:form.role===r ? 'var(--or-yellow-l)':'#fff', color:form.role===r ? '#7A5C00':'var(--gray-9)', minHeight:'48px' }}>
                  {r==='admin' ? '🛡️ Admin':'👤 User'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
            <button type="button" className="btn-outline" onClick={onClose} style={{ flex:1 }}>ยกเลิก</button>
            <button type="button" className="btn-primary" disabled={loading} onClick={() => onSave(form)} style={{ flex:2 }}>
              {loading ? <><Spinner size={14} color="#333" /> กำลังบันทึก...</> : isEdit ? '💾 บันทึกการแก้ไข':'✦ สร้างผู้ใช้'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Restaurant Detail Modal ───────────────────────────────────────────────────
function RestaurantDetailModal({ res, onClose, onEdit, onDelete, deleteId, setDeleteId }) {
  const [activeImg, setActiveImg] = useState(0);
  const [imgErr, setImgErr] = useState(false);
  const hasGPS = res.latitude != null && res.longitude != null;
  const images = res.images && res.images.length > 0 ? res.images : [];

  // Reset error when switching images
  const handleImgChange = (i) => { setActiveImg(i); setImgErr(false); };

  return (
    <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal-sheet" style={{ maxWidth:'640px' }} onClick={e => e.stopPropagation()}>
        <div style={{ position:'relative' }}>
          {images.length > 0 && !imgErr ? (
            <div>
              <img src={imgUrl(images[activeImg])} alt="restaurant" className="gallery-main"
                onError={() => setImgErr(true)} />
              {images.length > 1 && (
                <div style={{ padding:'8px 14px' }}>
                  <div className="gallery-thumbs">
                    {images.map((src, i) => (
                      <img key={i} src={imgUrl(src)} alt={`thumb-${i}`} className={`gallery-thumb ${i===activeImg?'active':''}`}
                        onClick={() => handleImgChange(i)}
                        onError={e => e.target.style.opacity='0.3'} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="gallery-main-placeholder">🍽️</div>
          )}
          <button type="button" onClick={onClose}
            style={{ position:'absolute', top:'12px', right:'12px', background:'rgba(255,255,255,.92)', border:'none', borderRadius:'50%', width:'36px', height:'36px', fontSize:'17px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 3px 12px rgba(0,0,0,.25)', minHeight:'unset', padding:0 }}>
            ✕
          </button>
          <div style={{ position:'absolute', bottom:'12px', right:'12px', background:'rgba(0,0,0,.7)', borderRadius:'22px', padding:'5px 12px', display:'flex', alignItems:'center', gap:'4px' }}>
            <span style={{ color:'#FFCC00', fontSize:'15px' }}>★</span>
            <span style={{ color:'#fff', fontSize:'13px', fontWeight:800 }}>{res.rating}/5</span>
          </div>
        </div>

        <div style={{ padding:'18px 20px 44px', display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <h2 style={{ fontSize:'23px', fontWeight:800, color:'var(--gray-3)', marginBottom:'8px' }}>{res.name}</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
              <span className="tag tag-yellow">⭐ {res.rating} ดาว</span>
              <span className="tag">{ZONE_EMOJI[res.zone]||'📌'} {res.zone || 'ไม่ระบุโซน'}</span>
              {hasGPS && <span className="tag tag-green">📍 มีพิกัด GPS</span>}
              {res.createdAt && (
                <span className="tag">🗓 {new Date(res.createdAt).toLocaleDateString('th-TH',{day:'2-digit',month:'short',year:'2-digit'})}</span>
              )}
            </div>
          </div>

          <div className="divider" />

          <div style={{ background:'var(--or-yellow-l)', borderRadius:'12px', padding:'15px 16px', border:'1px solid rgba(255,204,0,.4)' }}>
            <p className="lbl" style={{ marginBottom:'6px' }}>เมนูแนะนำ / Signature Dish</p>
            <p style={{ fontSize:'16px', fontWeight:700, color:'var(--gray-3)' }}>🍴 {res.recommendedMenu}</p>
          </div>

          <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
            <span style={{ fontSize:'22px', flexShrink:0 }}>📍</span>
            <div>
              <p className="lbl" style={{ marginBottom:'4px' }}>ทำเล</p>
              <p style={{ fontSize:'14px', color:'var(--gray-3)', fontWeight:500 }}>
                {res.locationName ? res.locationName.replace(/^\[.*?\]\s*/, '') : '-'}
              </p>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <Stars value={res.rating} size={22} />
            <span style={{ fontSize:'14px', color:'var(--gray-6)', fontWeight:600 }}>{res.rating} / 5 ดาว</span>
          </div>

          {hasGPS && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'9px' }}>
                <p className="lbl">แผนที่</p>
                <a href={`https://maps.google.com/?q=${res.latitude},${res.longitude}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:'12px', color:'var(--blue)', textDecoration:'none', background:'var(--blue-l)', padding:'5px 12px', borderRadius:'20px', border:'1px solid rgba(41,128,185,.2)', fontWeight:700 }}>
                  Google Maps ↗
                </a>
              </div>
              <MapView lat={res.latitude} lng={res.longitude} name={res.name} />
              <p style={{ fontSize:'11px', color:'var(--gray-9)', marginTop:'5px', fontFamily:'monospace' }}>
                {res.latitude?.toFixed(5)}, {res.longitude?.toFixed(5)}
              </p>
            </div>
          )}

          <div className="divider" />

          <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', flexWrap:'wrap' }}>
            <button type="button" className="btn-soft" onClick={() => onEdit(res)} style={{ fontSize:'13px' }}>✏️ แก้ไข</button>
            {deleteId === res._id ? (
              <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                <span style={{ fontSize:'12px', color:'var(--gray-9)' }}>ยืนยันลบ?</span>
                <button type="button" className="btn-danger" onClick={() => onDelete(res._id)} style={{ fontSize:'12px' }}>ลบ</button>
                <button type="button" className="btn-outline" onClick={() => setDeleteId(null)} style={{ fontSize:'12px', padding:'7px 12px' }}>ยกเลิก</button>
              </div>
            ) : (
              <button type="button" className="btn-danger" onClick={() => setDeleteId(res._id)} style={{ fontSize:'13px' }}>🗑 ลบ</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Restaurant Card ───────────────────────────────────────────────────────────
function RestaurantCard({ res, onClick }) {
  const images = res.images && res.images.length > 0 ? res.images : [];
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="res-card fade-in" onClick={onClick}>
      {images.length > 0 && !imgErr ? (
        <img
          src={imgUrl(images[0])} alt={res.name} className="res-card-img"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="res-card-img-placeholder">🍽️</div>
      )}
      <div className="res-card-body">
        <div className="res-card-name">{res.name}</div>
        <div className="res-card-menu">
          <span style={{ color:'var(--or-yellow-d)', flexShrink:0 }}>✦</span>
          <span style={{ overflow:'hidden', textOverflow:'ellipsis' }}>{res.recommendedMenu}</span>
        </div>
        <div className="res-card-meta">
          <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
            <span className="tag" style={{ fontSize:'10px' }}>{ZONE_EMOJI[res.zone]||'📌'} {(res.zone||'').split(' / ')[0]}</span>
            {res.latitude != null && <span className="tag tag-green" style={{ fontSize:'10px' }}>📍 GPS</span>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
            <Stars value={res.rating} size={12} />
            <span style={{ fontSize:'12px', color:'var(--gray-6)', fontWeight:700 }}>{res.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Zone Card Image (with error handling) ────────────────────────────────────
function ZoneCardImage({ imgs, name }) {
  const [err, setErr] = useState(false);
  if (imgs.length > 0 && !err) {
    return <img src={imgUrl(imgs[0])} alt={name} style={{ width:'100%', height:'110px', objectFit:'cover', display:'block' }} onError={() => setErr(true)} />;
  }
  return <div style={{ width:'100%', height:'110px', background:'linear-gradient(135deg,#FFF8CC,#FFE066)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'38px' }}>🍽️</div>;
}

// ─── Featured Restaurants Section ──────────────────────────────────────────────
function FeaturedSection({ restaurants, onCardClick }) {
  const featured = restaurants.filter(r => r.rating >= 4).slice(0, 6);
  if (featured.length === 0) return null;

  const topPick = featured[0];
  const topImages = topPick.images && topPick.images.length > 0 ? topPick.images : [];

  return (
    <div style={{ marginBottom:'6px' }}>
      {/* Hero featured */}
      <div style={{ padding:'14px 14px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
          <span className="section-title">🏆 ร้านแนะนำ Top Pick</span>
          <span className="tag tag-yellow">⭐ คะแนนสูงสุด</span>
        </div>
        <div className="featured-banner card-hover" style={{ cursor:'pointer' }} onClick={() => onCardClick(topPick)}>
          {topImages.length > 0 ? (
            <img src={imgUrl(topImages[0])} alt={topPick.name} className="featured-img"
              onError={e => { e.target.style.display='none'; e.target.nextSibling && (e.target.nextSibling.style.display='flex'); }}
            />
          ) : null}
          {(topImages.length === 0) && (
            <div className="featured-img-placeholder">🍽️</div>
          )}
          <div className="featured-overlay">
            <div style={{ display:'flex', gap:'6px', marginBottom:'6px', flexWrap:'wrap' }}>
              <span style={{ background:'var(--or-yellow)', color:'var(--gray-3)', fontSize:'11px', fontWeight:800, padding:'3px 10px', borderRadius:'20px' }}>⭐ {topPick.rating}/5</span>
              <span style={{ background:'rgba(255,255,255,.15)', color:'#fff', fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', border:'1px solid rgba(255,255,255,.3)' }}>{ZONE_EMOJI[topPick.zone]} {(topPick.zone||'').split(' / ')[0]}</span>
            </div>
            <h3 style={{ color:'#fff', fontSize:'20px', fontWeight:800, marginBottom:'4px', textShadow:'0 2px 8px rgba(0,0,0,.5)' }}>{topPick.name}</h3>
            <p style={{ color:'rgba(255,255,255,.8)', fontSize:'13px', fontWeight:500 }}>🍴 {topPick.recommendedMenu}</p>
          </div>
        </div>
      </div>

      {/* Zone groups */}
      {['กรุงเทพฯ', 'ต่างจังหวัด'].map(group => {
        const zoneKeys = group === 'กรุงเทพฯ'
          ? ["สยาม / ปทุมวัน / ราชเทวี","สุขุมวิท / ทองหล่อ / เอกมัย","สีลม / สาทร / บางรัก","อารีย์ / พหลโยธิน / ลาดพร้าว","เยาวราช / พระนคร / เกาะรัตนโกสินทร์","ฝั่งธนบุรี / วงเวียนใหญ่","ชานเมือง / ปริมณฑล"]
          : ["ต่างจังหวัด"];
        const groupRests = restaurants.filter(r => zoneKeys.includes(r.zone) && r.rating >= 4);
        if (groupRests.length === 0) return null;
        return (
          <div key={group} style={{ padding:'14px 14px 0' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
              <span className="section-title">{group === 'กรุงเทพฯ' ? '🏙️ แนะนำ กทม.' : '🗺️ แนะนำ ต่างจังหวัด'}</span>
              <span className="tag" style={{ fontSize:'11px' }}>{groupRests.length} ร้าน</span>
            </div>
            <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'4px', scrollbarWidth:'none' }}>
              {groupRests.slice(0,8).map(r => {
                const imgs = r.images && r.images.length > 0 ? r.images : [];
                return (
                  <div key={r._id} onClick={() => onCardClick(r)} className="zone-scroll-card">
                    <ZoneCardImage imgs={imgs} name={r.name} />
                    <div style={{ padding:'10px 11px 12px' }}>
                      <div style={{ fontSize:'13px', fontWeight:700, color:'var(--gray-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'3px' }}>{r.name}</div>
                      <div style={{ fontSize:'11px', color:'var(--gray-6)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'7px' }}>✦ {r.recommendedMenu}</div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <Stars value={r.rating} size={11} />
                        <span style={{ fontSize:'11px', fontWeight:800, color:'var(--or-yellow-d)' }}>{r.rating}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user,      setUser]      = useState(null);
  const [loginForm, setLoginForm] = useState({ username:'', password:'' });
  const [loginErr,  setLoginErr]  = useState('');
  const [loginLoad, setLoginLoad] = useState(false);
  const [showPw,    setShowPw]    = useState(false);

  const [restaurants, setRestaurants] = useState([]);
  const [searchQ,     setSearchQ]     = useState('');
  const [filterZone,  setFilterZone]  = useState('');
  const [resForm,     setResForm]     = useState(EMPTY_FORM);
  const [isEditing,   setIsEditing]   = useState(false);
  const [showResForm, setShowResForm] = useState(false);
  const [saveLoad,    setSaveLoad]    = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [activeTab,   setActiveTab]   = useState('home');
  const [detailRes,   setDetailRes]   = useState(null);

  const [adminTab,     setAdminTab]     = useState('users');
  const [adminUsers,   setAdminUsers]   = useState([]);
  const [adminSearch,  setAdminSearch]  = useState('');
  const [stats,        setStats]        = useState({ totalUsers:0, totalRestaurants:0 });
  const [userModal,    setUserModal]    = useState({ open:false, mode:'add', data:null });
  const [userSaveLoad, setUserSaveLoad] = useState(false);
  const [userDeleteId, setUserDeleteId] = useState(null);
  const [userDelLoad,  setUserDelLoad]  = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  const fetchRestaurants = useCallback(async (uid) => {
    try { const r = await axios.get(`${API_URL}/restaurants/${uid}`); setRestaurants(r.data); }
    catch { showToast('โหลดข้อมูลไม่สำเร็จ','error'); }
  }, [showToast]);

  const fetchAdminData = useCallback(async () => {
    try {
      const [u,s] = await Promise.all([axios.get(`${API_URL}/admin/users`), axios.get(`${API_URL}/admin/stats`)]);
      setAdminUsers(u.data); setStats(s.data);
    } catch { showToast('โหลดข้อมูล Admin ไม่สำเร็จ','error'); }
  }, [showToast]);

  useEffect(() => {
    if (!user) return;
    if (user.role==='user')  fetchRestaurants(user._id||user.id);
    if (user.role==='admin') fetchAdminData();
  }, [user, fetchRestaurants, fetchAdminData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username.trim()||!loginForm.password.trim()) { setLoginErr('กรุณากรอกข้อมูลให้ครบถ้วน'); return; }
    setLoginErr(''); setLoginLoad(true);
    try {
      const res = await axios.post(`${API_URL}/login`, loginForm);
      if (res.data.success) { setUser(res.data.user); setLoginForm({ username:'',password:'' }); }
      else setLoginErr(res.data.message||'เข้าสู่ระบบไม่สำเร็จ');
    } catch (err) { setLoginErr(err.response?.data?.message||'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'); }
    finally { setLoginLoad(false); }
  };

  const handleLogout = () => {
    setUser(null); setRestaurants([]); setAdminUsers([]);
    setShowResForm(false); setResForm(EMPTY_FORM); setIsEditing(false);
    setDeleteId(null); setActiveTab('home'); setDetailRes(null);
    setUserModal({ open:false, mode:'add', data:null }); setUserDeleteId(null);
  };

  const handleSaveRestaurant = async () => {
    if (!resForm.name.trim()||!resForm.locationName.trim()||!resForm.recommendedMenu.trim()) {
      showToast('กรุณากรอกชื่อร้าน เมนูแนะนำ และทำเล','error'); return;
    }
    setSaveLoad(true);
    try {
      const lat = resForm.latitude==='' ? null : parseFloat(resForm.latitude);
      const lng = resForm.longitude==='' ? null : parseFloat(resForm.longitude);
      const payload = {
        userId: user._id||user.id,
        name: resForm.name.trim(),
        recommendedMenu: resForm.recommendedMenu.trim(),
        zone: resForm.zone,
        locationName: `[${resForm.zone}] ${resForm.locationName.trim()}`,
        latitude: (lat!==null&&!isNaN(lat)) ? lat : null,
        longitude: (lng!==null&&!isNaN(lng)) ? lng : null,
        rating: resForm.rating,
        images: resForm.images || []
      };
      if (isEditing && resForm.id) {
        await axios.put(`${API_URL}/restaurants/${resForm.id}`, payload);
        showToast('แก้ไขข้อมูลสำเร็จแล้ว ✓');
      } else {
        await axios.post(`${API_URL}/restaurants`, payload);
        showToast('บันทึกร้านใหม่สำเร็จแล้ว ✓');
      }
      setResForm(EMPTY_FORM); setShowResForm(false); setIsEditing(false);
      await fetchRestaurants(user._id||user.id);
    } catch (err) {
      showToast(err.response?.data?.details||err.response?.data?.error||'บันทึกไม่สำเร็จ กรุณาลองใหม่','error');
    } finally { setSaveLoad(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/restaurants/${id}`);
      setDeleteId(null); setDetailRes(null);
      await fetchRestaurants(user._id||user.id);
      showToast('ลบร้านอาหารออกจากคลังแล้ว');
    } catch { showToast('ลบข้อมูลไม่สำเร็จ','error'); }
  };

  const startEdit = (res) => {
    let zone=ZONES[0], locName=res.locationName||'';
    const m=locName.match(/^\[(.*?)\]\s*/);
    if(m){const z=ZONES.find(z=>z===m[1]);if(z)zone=z;locName=locName.replace(/^\[.*?\]\s*/,'');}
    setResForm({ id:res._id||res.id, name:res.name||'', recommendedMenu:res.recommendedMenu||'', zone, locationName:locName, latitude:res.latitude!=null?String(res.latitude):'', longitude:res.longitude!=null?String(res.longitude):'', rating:res.rating||5, images:res.images||[] });
    setIsEditing(true); setShowResForm(true); setDetailRes(null);
  };

  const handleSaveUser = async (form) => {
    setUserSaveLoad(true);
    try {
      if (userModal.mode==='add') {
        if (!form.username.trim()||!form.password.trim()) { showToast('กรุณากรอก username และ password','error'); return; }
        await axios.post(`${API_URL}/admin/users`, form);
        showToast('สร้างผู้ใช้ใหม่สำเร็จ ✓');
      } else {
        if (!form.password.trim()&&form.role===userModal.data?.role) { showToast('ไม่มีการเปลี่ยนแปลง','info'); return; }
        await axios.put(`${API_URL}/admin/users/${userModal.data._id}`, { password:form.password, role:form.role });
        showToast('แก้ไขข้อมูลผู้ใช้สำเร็จ ✓');
      }
      setUserModal({open:false,mode:'add',data:null}); await fetchAdminData();
    } catch(err) { showToast(err.response?.data?.error||'เกิดข้อผิดพลาด','error'); }
    finally { setUserSaveLoad(false); }
  };

  const handleDeleteUser = async (id) => {
    if (id===(user._id||user.id)) { showToast('ไม่สามารถลบบัญชีตัวเองได้','error'); setUserDeleteId(null); return; }
    setUserDelLoad(true);
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`);
      setUserDeleteId(null); showToast('ลบผู้ใช้สำเร็จ'); await fetchAdminData();
    } catch(err) { showToast(err.response?.data?.error||'ลบไม่สำเร็จ','error'); }
    finally { setUserDelLoad(false); }
  };

  const filtered = restaurants.filter(r => {
    const q=searchQ.toLowerCase().trim();
    const ms=!q||r.name?.toLowerCase().includes(q)||r.locationName?.toLowerCase().includes(q)||r.recommendedMenu?.toLowerCase().includes(q);
    const mz=!filterZone||r.zone===filterZone||r.locationName?.includes(`[${filterZone}]`);
    return ms&&mz;
  });
  const filteredAdminUsers = adminUsers.filter(u => !adminSearch||u.username?.toLowerCase().includes(adminSearch.toLowerCase()));

  const totalStars = restaurants.reduce((a,r) => a+r.rating, 0);
  const avgRating  = restaurants.length ? (totalStars/restaurants.length).toFixed(1) : '—';
  const topZone    = (() => { const m={}; restaurants.forEach(r=>{m[r.zone]=(m[r.zone]||0)+1;}); return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'; })();

  // ══════════════════════════════════════════════════════════════════════════════
  // LOGIN PAGE
  // ══════════════════════════════════════════════════════════════════════════════
  if (!user) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#FFFDE7 0%,#FFF8CC 50%,#FFEE80 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
        <div className="fade-in" style={{ width:'100%', maxWidth:'420px' }}>
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div style={{ width:'88px', height:'88px', borderRadius:'26px', background:'linear-gradient(135deg,var(--or-yellow),#FFD700)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'44px', margin:'0 auto 18px', boxShadow:'0 10px 40px rgba(255,204,0,.45)' }}>🍜</div>
            <h1 style={{ fontSize:'38px', fontWeight:800, color:'var(--gray-3)', marginBottom:'5px', letterSpacing:'-.02em', fontFamily:'Prompt,sans-serif' }}>
              YUMMY<span style={{ color:'var(--or-red)' }}>LOG</span>
            </h1>
            <p style={{ color:'var(--gray-6)', fontSize:'14px', fontWeight:500 }}>บันทึกร้านอาหารโปรดของคุณ</p>
          </div>

          <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginBottom:'26px', flexWrap:'wrap' }}>
            {['📷 ใส่รูปภาพ','⭐ ให้คะแนน','📍 ปักหมุด GPS','🔍 ค้นหาง่าย'].map(f => (
              <span key={f} className="tag tag-yellow" style={{ fontSize:'12px', padding:'5px 13px' }}>{f}</span>
            ))}
          </div>

          <div className="card" style={{ padding:'30px 26px', boxShadow:'0 10px 44px rgba(0,0,0,.1)', borderRadius:'18px' }}>
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <label className="lbl" style={{ display:'block', marginBottom:'8px' }}>USERNAME</label>
                <input type="text" placeholder="ชื่อผู้ใช้" value={loginForm.username} autoComplete="username"
                  onChange={e => { setLoginErr(''); setLoginForm(f=>({...f,username:e.target.value})); }} required />
              </div>
              <div>
                <label className="lbl" style={{ display:'block', marginBottom:'8px' }}>PASSWORD</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} placeholder="รหัสผ่าน" value={loginForm.password} autoComplete="current-password"
                    onChange={e => { setLoginErr(''); setLoginForm(f=>({...f,password:e.target.value})); }} required style={{ paddingRight:'48px' }} />
                  <button type="button" onClick={()=>setShowPw(v=>!v)} style={{ position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',padding:'4px',color:'var(--gray-9)',fontSize:'16px',minHeight:'unset' }}>
                    {showPw?'🙈':'👁'}
                  </button>
                </div>
              </div>
              {loginErr && (
                <div style={{ background:'var(--rouge-l)', border:'1px solid rgba(224,48,48,.2)', borderRadius:'10px', padding:'11px 14px', fontSize:'13px', color:'var(--rouge)', display:'flex', gap:'8px', alignItems:'center' }}>
                  <span>⚠</span>{loginErr}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={loginLoad} style={{ marginTop:'4px', fontSize:'16px', padding:'15px 20px' }}>
                {loginLoad ? <><Spinner size={15} color="#333" /> กำลังเข้าสู่ระบบ...</> : 'เข้าสู่ระบบ →'}
              </button>
            </form>
            <div style={{ textAlign:'center', marginTop:'16px', padding:'13px', background:'var(--gray-f)', borderRadius:'10px' }}>
              <p style={{ fontSize:'12px', color:'var(--gray-9)', lineHeight:1.9 }}>
                ยังไม่มีบัญชี? ระบบสร้างให้อัตโนมัติเมื่อ Login ครั้งแรก<br/>
                <span style={{ color:'var(--or-yellow-d)', fontWeight:700 }}>username = admin</span> สำหรับเข้าหน้าจัดการ
              </p>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast {...toast} onClose={()=>setToast(null)} />}
    </>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // ADMIN DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════════
  if (user.role === 'admin') {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight:'100vh', background:'var(--gray-f)', paddingBottom:'74px' }}>

          <header className="admin-header">
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,var(--or-yellow),#FFD700)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0, boxShadow:'0 3px 10px rgba(255,204,0,.4)' }}>🛡️</div>
              <div>
                <div style={{ fontSize:'18px', color:'#fff', fontWeight:800, lineHeight:1.2 }}>ADMIN PANEL</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,.45)', letterSpacing:'.1em', fontWeight:600 }}>YUMMY LOG</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,.6)', fontWeight:600 }} className="hide-mobile">👤 {user.username}</span>
              <button type="button" onClick={handleLogout} style={{ background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.85)', padding:'8px 16px', borderRadius:'10px', fontSize:'13px', border:'1px solid rgba(255,255,255,.2)', fontWeight:700, minHeight:'36px' }}>
                ออกจากระบบ
              </button>
            </div>
          </header>

          <div style={{ background:'#fff', borderBottom:'1px solid var(--gray-e)', padding:'0 16px', display:'flex', gap:'4px', position:'sticky', top:'60px', zIndex:99 }}>
            {[['users','👥 สมาชิก'],['stats','📊 สถิติ']].map(([t,l]) => (
              <button key={t} type="button" onClick={()=>setAdminTab(t)}
                style={{ padding:'14px 20px', fontSize:'13px', fontWeight:700, background:'none', border:'none', minHeight:'unset', borderBottom:`3px solid ${adminTab===t ? 'var(--or-yellow-d)':'transparent'}`, color:adminTab===t ? 'var(--gray-3)':'var(--gray-9)', transition:'all .15s', borderRadius:0 }}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ maxWidth:'900px', margin:'0 auto', padding:'20px 16px 44px', display:'flex', flexDirection:'column', gap:'20px' }}>

            {adminTab === 'stats' && (
              <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div>
                  <h2 style={{ fontSize:'24px', color:'var(--gray-3)', fontWeight:800 }}>สถิติภาพรวม</h2>
                  <p style={{ color:'var(--gray-9)', fontSize:'13px', marginTop:'3px' }}>ข้อมูลสรุประบบ Yummy Log</p>
                </div>
                <div className="stat-card-grid">
                  {[
                    { label:'สมาชิกทั้งหมด', value:stats.totalUsers, unit:'บัญชี', icon:'👥', color:'#E6B800', bg:'linear-gradient(135deg,#fff 60%,#FFF8CC)' },
                    { label:'ร้านอาหารทั้งหมด', value:stats.totalRestaurants, unit:'ร้าน', icon:'🍽️', color:'#27AE60', bg:'linear-gradient(135deg,#fff 60%,#E8F8EE)' },
                    { label:'ผู้ใช้ทั่วไป', value:adminUsers.filter(u=>u.role==='user').length, unit:'บัญชี', icon:'👤', color:'#2980B9', bg:'linear-gradient(135deg,#fff 60%,#EAF4FB)' },
                    { label:'ผู้ดูแลระบบ', value:adminUsers.filter(u=>u.role==='admin').length, unit:'บัญชี', icon:'🛡️', color:'#8E44AD', bg:'linear-gradient(135deg,#fff 60%,#F5EEF8)' },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ padding:'20px 16px', background:s.bg, borderLeft:`4px solid ${s.color}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <p className="lbl" style={{ marginBottom:'8px' }}>{s.label}</p>
                          <div style={{ fontFamily:'Prompt,sans-serif', fontSize:'40px', fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
                          <p style={{ fontSize:'12px', color:'var(--gray-9)', marginTop:'3px' }}>{s.unit}</p>
                        </div>
                        <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>{s.icon}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ padding:'20px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
                    <h3 style={{ fontSize:'17px', color:'var(--gray-3)', fontWeight:700 }}>ข้อมูลเพิ่มเติม</h3>
                    <button type="button" className="btn-soft btn-sm" onClick={fetchAdminData}>↻ รีเฟรช</button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'11px' }}>
                    {[
                      { icon:'📅', label:'สมาชิกล่าสุด', value:adminUsers[0]?.username||'—' },
                      { icon:'📊', label:'เฉลี่ยร้านต่อคน', value:stats.totalUsers ? (stats.totalRestaurants/stats.totalUsers).toFixed(1)+' ร้าน/คน':'—' },
                    ].map(item => (
                      <div key={item.label} style={{ background:'var(--gray-f)', borderRadius:'12px', padding:'14px 16px', display:'flex', gap:'12px', alignItems:'center', border:'1px solid var(--gray-e)' }}>
                        <div style={{ fontSize:'24px', flexShrink:0 }}>{item.icon}</div>
                        <div>
                          <p className="lbl" style={{ marginBottom:'4px' }}>{item.label}</p>
                          <p style={{ fontSize:'15px', fontWeight:700, color:'var(--gray-3)' }}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'users' && (
              <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap' }}>
                  <div>
                    <h2 style={{ fontSize:'24px', color:'var(--gray-3)', fontWeight:800 }}>จัดการสมาชิก</h2>
                    <p style={{ color:'var(--gray-9)', fontSize:'13px', marginTop:'2px' }}>เพิ่ม แก้ไข หรือลบบัญชีผู้ใช้ในระบบ</p>
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button type="button" className="btn-soft" onClick={fetchAdminData} style={{ fontSize:'13px' }}>↻</button>
                    <button type="button" className="btn-primary" onClick={()=>setUserModal({open:true,mode:'add',data:null})} style={{ width:'auto', padding:'10px 18px', fontSize:'13px' }}>+ เพิ่มผู้ใช้</button>
                  </div>
                </div>

                <input type="text" placeholder="🔍 ค้นหาชื่อบัญชี..." value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} />

                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  <span className="tag tag-yellow">👥 ทั้งหมด {filteredAdminUsers.length}</span>
                  <span className="tag tag-admin">🛡️ Admin {filteredAdminUsers.filter(u=>u.role==='admin').length}</span>
                  <span className="tag tag-green">👤 User {filteredAdminUsers.filter(u=>u.role==='user').length}</span>
                </div>

                <div className="card">
                  <div style={{ padding:'12px', display:'flex', flexDirection:'column', gap:'7px', maxHeight:'62vh', overflowY:'auto' }}>
                    {filteredAdminUsers.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'48px', color:'var(--gray-9)' }}>
                        <div style={{ fontSize:'36px', marginBottom:'12px', opacity:.4 }}>👤</div>
                        <p>ไม่พบสมาชิกที่ค้นหา</p>
                      </div>
                    ) : filteredAdminUsers.map((u,i) => (
                      <div key={u._id} style={{ background:i%2===0?'#fff':'var(--gray-f)', borderRadius:'11px', padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px', border:'1px solid var(--gray-e)', animation:`fadeIn .2s ease ${i*.02}s both` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px', minWidth:0, flex:1 }}>
                          <div style={{ width:'42px', height:'42px', borderRadius:'12px', flexShrink:0, background:u.role==='admin' ? 'linear-gradient(135deg,var(--or-yellow),#FFD700)':'var(--gray-e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', boxShadow:u.role==='admin'?'0 3px 10px rgba(255,204,0,.35)':'none' }}>
                            {u.role==='admin' ? '🛡️':'👤'}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:'14px', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.username}</div>
                            <div style={{ display:'flex', alignItems:'center', gap:'5px', marginTop:'3px', flexWrap:'wrap' }}>
                              <span className={`tag ${u.role==='admin'?'tag-admin':'tag-green'}`} style={{ fontSize:'10px', padding:'2px 8px' }}>{u.role?.toUpperCase()}</span>
                              {u.createdAt && <span className="hide-mobile" style={{ fontSize:'11px', color:'var(--gray-9)' }}>{new Date(u.createdAt).toLocaleDateString('th-TH',{day:'2-digit',month:'short',year:'2-digit'})}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                          {userDeleteId === u._id ? (
                            <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
                              <span style={{ fontSize:'12px', color:'var(--gray-9)', whiteSpace:'nowrap' }}>ยืนยันลบ?</span>
                              <button type="button" className="btn-danger btn-sm" disabled={userDelLoad} onClick={()=>handleDeleteUser(u._id)}>
                                {userDelLoad ? <Spinner size={12} color="var(--rouge)" />:'ลบ'}
                              </button>
                              <button type="button" className="btn-outline btn-sm" onClick={()=>setUserDeleteId(null)}>ยกเลิก</button>
                            </div>
                          ) : (
                            <>
                              <button type="button" className="btn-soft btn-sm" onClick={()=>setUserModal({open:true,mode:'edit',data:u})}>✏️</button>
                              <button type="button" className="btn-danger btn-sm" onClick={()=>setUserDeleteId(u._id)} disabled={u.username==='admin'} title={u.username==='admin'?'ไม่สามารถลบ admin หลัก':''}>🗑</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="tab-bar">
          {[['users','👥','สมาชิก'],['stats','📊','สถิติ']].map(([t,ico,lbl]) => (
            <button key={t} type="button" className={`tab-btn ${adminTab===t?'active':''}`} onClick={()=>setAdminTab(t)}>
              <span className="tab-icon">{ico}</span>{lbl}
            </button>
          ))}
          <button type="button" className="tab-btn" onClick={handleLogout}>
            <span className="tab-icon">🚪</span>ออก
          </button>
        </div>

        {userModal.open && <UserModal mode={userModal.mode} data={userModal.data} onClose={()=>setUserModal({open:false,mode:'add',data:null})} onSave={handleSaveUser} loading={userSaveLoad} />}
        {toast && <Toast {...toast} onClose={()=>setToast(null)} />}
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // USER DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:'100vh', background:'var(--gray-f)', paddingBottom:'74px' }}>

        <header className="or-header">
          <div style={{ fontFamily:'Prompt,sans-serif', fontSize:'20px', fontWeight:800, color:'var(--gray-3)', letterSpacing:'-.02em', flexShrink:0 }}>
            YUMMY<span style={{ color:'var(--or-red)' }}>LOG</span>
          </div>
          <input type="text" className="or-search" placeholder="🔍 ค้นหาชื่อร้าน เมนู หรือทำเล..."
            value={searchQ} onChange={e => { setSearchQ(e.target.value); if(activeTab!=='search') setActiveTab('search'); }} />
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
            <span className="tag" style={{ fontSize:'11px', background:'rgba(255,255,255,.75)', border:'1px solid rgba(0,0,0,.1)', fontWeight:700 }}>
              ★ {restaurants.length}
            </span>
          </div>
        </header>

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            <div className="cat-scroll">
              <div className={`cat-chip ${filterZone===''?'active':''}`} onClick={() => setFilterZone('')}>
                <div className="cat-chip-icon">🍽️</div>
                <span className="cat-chip-label">ทั้งหมด</span>
              </div>
              {ZONES.filter(z => restaurants.some(r => r.zone===z)).map(z => (
                <div key={z} className={`cat-chip ${filterZone===z?'active':''}`} onClick={() => setFilterZone(filterZone===z?'':z)}>
                  <div className="cat-chip-icon">{ZONE_EMOJI[z]}</div>
                  <span className="cat-chip-label">{z.split(' / ')[0]}</span>
                </div>
              ))}
            </div>

            {restaurants.length === 0 ? (
              <div style={{ maxWidth:'700px', margin:'20px auto', padding:'0 14px' }}>
                <div className="card fade-in" style={{ padding:'36px 20px', textAlign:'center', borderTop:'4px solid var(--or-yellow)' }}>
                  <div style={{ fontSize:'60px', marginBottom:'16px' }}>👋</div>
                  <h3 style={{ fontSize:'22px', color:'var(--gray-3)', fontWeight:800, marginBottom:'10px' }}>ยินดีต้อนรับ {user.username}!</h3>
                  <p style={{ fontSize:'14px', color:'var(--gray-6)', lineHeight:1.8 }}>เริ่มบันทึกร้านอาหารโปรดของคุณ<br/>กดปุ่ม <strong style={{color:'var(--or-yellow-d)'}}>+</strong> ด้านล่างขวาเพื่อเพิ่มร้านแรก</p>
                </div>
              </div>
            ) : (
              <>
                {/* Quick Stats */}
                <div style={{ maxWidth:'900px', margin:'14px auto 0', padding:'0 14px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
                    {[
                      { icon:'🍽️', label:'ร้านทั้งหมด', value:restaurants.length, unit:'ร้าน' },
                      { icon:'⭐', label:'คะแนนเฉลี่ย', value:avgRating, unit:'ดาว' },
                      { icon:'📍', label:'มี GPS', value:restaurants.filter(r=>r.latitude!=null).length, unit:'ร้าน' },
                    ].map(s => (
                      <div key={s.label} className="card fade-in" style={{ padding:'14px 10px', textAlign:'center' }}>
                        <div style={{ fontSize:'22px', marginBottom:'5px' }}>{s.icon}</div>
                        <div style={{ fontFamily:'Prompt,sans-serif', fontSize:'26px', fontWeight:800, color:'var(--or-yellow-d)', lineHeight:1 }}>{s.value}</div>
                        <div className="lbl" style={{ marginTop:'3px', fontSize:'10px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured sections */}
                {!filterZone && <FeaturedSection restaurants={restaurants} onCardClick={setDetailRes} />}

                {/* All or filtered list */}
                <div style={{ maxWidth:'900px', margin:'14px auto', padding:'0 14px', display:'flex', flexDirection:'column', gap:'14px' }}>
                  {filtered.length > 0 && (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2px' }}>
                      <span className="section-title">
                        {filterZone ? `${ZONE_EMOJI[filterZone]} ${filterZone.split(' / ')[0]}` : '🗂 ร้านทั้งหมด'}
                      </span>
                      <span className="tag tag-yellow">{filtered.length} ร้าน</span>
                    </div>
                  )}
                  {filtered.length === 0 && restaurants.length > 0 ? (
                    <div className="card" style={{ padding:'48px 20px', textAlign:'center' }}>
                      <div style={{ fontSize:'40px', marginBottom:'12px', opacity:.3 }}>🍽️</div>
                      <p style={{ color:'var(--gray-9)', fontSize:'14px' }}>ไม่พบร้านในโซนนี้</p>
                    </div>
                  ) : (
                    <div className="res-grid">
                      {filtered.map(res => (
                        <RestaurantCard key={res._id} res={res} onClick={() => setDetailRes(res)} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div style={{ maxWidth:'900px', margin:'0 auto', padding:'14px 14px', display:'flex', flexDirection:'column', gap:'14px' }}>
            <h2 className="section-title" style={{ fontSize:'18px' }}>ค้นหาร้านอาหาร</h2>

            <div className="card" style={{ padding:'14px', display:'flex', flexDirection:'column', gap:'12px' }}>
              <input type="text" placeholder="🔍 พิมพ์ชื่อร้าน, เมนูแนะนำ, หรือทำเล..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} />
              <div style={{ position:'relative' }}>
                <select value={filterZone} onChange={e=>setFilterZone(e.target.value)}>
                  <option value="">🗺️ ทุกโซน</option>
                  {ZONES.map(z => <option key={z} value={z}>{ZONE_EMOJI[z]} {z}</option>)}
                </select>
                <span style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--gray-9)' }}>▾</span>
              </div>
            </div>

            <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px' }}>
              <button type="button" className={`zone-chip ${filterZone===''?'active':''}`} onClick={()=>setFilterZone('')}>ทั้งหมด</button>
              {ZONES.filter(z=>restaurants.some(r=>r.zone===z)).map(z => (
                <button key={z} type="button" className={`zone-chip ${filterZone===z?'active':''}`} onClick={()=>setFilterZone(filterZone===z?'':z)}>
                  {ZONE_EMOJI[z]} {z.split(' / ')[0]}
                </button>
              ))}
            </div>

            <div style={{ padding:'0 2px' }}>
              <span className="lbl">ผลลัพธ์ <span style={{ color:'var(--or-yellow-d)', fontWeight:800, fontSize:'13px' }}>{filtered.length}</span> ร้าน</span>
            </div>

            {filtered.length === 0 ? (
              <div className="card" style={{ padding:'48px 20px', textAlign:'center' }}>
                <div style={{ fontSize:'38px', marginBottom:'12px', opacity:.3 }}>🔍</div>
                <p style={{ color:'var(--gray-9)', fontSize:'14px' }}>ไม่พบร้านที่ตรงกับการค้นหา</p>
              </div>
            ) : (
              <div className="res-grid">
                {filtered.map(res => (
                  <RestaurantCard key={res._id} res={res} onClick={() => setDetailRes(res)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div style={{ maxWidth:'900px', margin:'0 auto', padding:'16px 14px', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div>
              <h2 className="section-title" style={{ fontSize:'20px' }}>สถิติคลังร้านโปรด</h2>
              <p style={{ fontSize:'13px', color:'var(--gray-9)', marginTop:'5px' }}>ข้อมูลสรุปรายการร้านของคุณ</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px' }}>
              {[
                { icon:'🍽️', label:'ร้านทั้งหมด', value:restaurants.length, unit:'ร้าน', color:'var(--or-yellow-d)', bg:'linear-gradient(135deg,#fff 60%,#FFF8CC)' },
                { icon:'⭐', label:'คะแนนเฉลี่ย', value:avgRating, unit:'ดาว', color:'var(--or-yellow-d)', bg:'linear-gradient(135deg,#fff 60%,#FFF8CC)' },
                { icon:'📍', label:'มีพิกัด GPS', value:restaurants.filter(r=>r.latitude!=null).length, unit:'ร้าน', color:'var(--green)', bg:'linear-gradient(135deg,#fff 60%,#E8F8EE)' },
                { icon:'🗺️', label:'โซนยอดนิยม', value:topZone.split(' / ')[0], unit:'', color:'var(--blue)', bg:'linear-gradient(135deg,#fff 60%,#EAF4FB)' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding:'18px 16px', background:s.bg, borderLeft:`4px solid ${s.color}` }}>
                  <div style={{ fontSize:'26px', marginBottom:'8px' }}>{s.icon}</div>
                  <p className="lbl" style={{ marginBottom:'5px' }}>{s.label}</p>
                  <div style={{ fontFamily:'Prompt,sans-serif', fontSize:'30px', fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
                  {s.unit && <p style={{ fontSize:'11px', color:'var(--gray-9)', marginTop:'3px' }}>{s.unit}</p>}
                </div>
              ))}
            </div>

            {restaurants.length > 0 && (
              <div className="card" style={{ padding:'18px' }}>
                <h3 style={{ fontSize:'17px', color:'var(--gray-3)', fontWeight:700, marginBottom:'14px' }}>การกระจายคะแนน</h3>
                {[5,4,3,2,1].map(star => {
                  const count = restaurants.filter(r=>r.rating===star).length;
                  const pct = restaurants.length ? (count/restaurants.length*100) : 0;
                  return (
                    <div key={star} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'9px' }}>
                      <span style={{ color:'#FFCC00', fontSize:'13px', width:'20px', flexShrink:0 }}>{'★'.repeat(star)}</span>
                      <div style={{ flex:1, height:'9px', background:'var(--gray-e)', borderRadius:'5px', overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,var(--or-yellow),#FFD700)', borderRadius:'5px', transition:'width .6s ease' }} />
                      </div>
                      <span style={{ fontSize:'12px', color:'var(--gray-9)', width:'38px', textAlign:'right', flexShrink:0 }}>{count} ร้าน</span>
                    </div>
                  );
                })}
              </div>
            )}

            {restaurants.length > 0 && (
              <div className="card" style={{ padding:'18px' }}>
                <h3 style={{ fontSize:'17px', color:'var(--gray-3)', fontWeight:700, marginBottom:'14px' }}>ร้านแยกตามโซน</h3>
                {ZONES.filter(z => restaurants.some(r=>r.zone===z)).map(z => {
                  const cnt = restaurants.filter(r=>r.zone===z).length;
                  const pct = (cnt/restaurants.length*100);
                  return (
                    <div key={z} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                      <span style={{ fontSize:'15px', width:'22px', flexShrink:0 }}>{ZONE_EMOJI[z]}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'12px', color:'var(--gray-6)', marginBottom:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{z}</div>
                        <div style={{ height:'7px', background:'var(--gray-e)', borderRadius:'4px', overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,var(--or-yellow),#FFD700)', borderRadius:'4px' }} />
                        </div>
                      </div>
                      <span style={{ fontSize:'12px', color:'var(--gray-9)', width:'32px', textAlign:'right', flexShrink:0 }}>{cnt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {restaurants.length === 0 && (
              <div className="card" style={{ padding:'48px 20px', textAlign:'center' }}>
                <div style={{ fontSize:'44px', marginBottom:'14px', opacity:.25 }}>📊</div>
                <p style={{ color:'var(--gray-9)', fontSize:'14px' }}>ยังไม่มีข้อมูล — เพิ่มร้านอาหารก่อนเพื่อดูสถิติ</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button type="button" className="fab" onClick={()=>{setResForm(EMPTY_FORM);setIsEditing(false);setShowResForm(true);}}>+</button>

      {/* Bottom Tab Bar */}
      <div className="tab-bar">
        {[['home','🏠','หน้าหลัก'],['search','🔍','ค้นหา'],['stats','📊','สถิติ']].map(([t,ico,lbl])=>(
          <button key={t} type="button" className={`tab-btn ${activeTab===t?'active':''}`} onClick={()=>setActiveTab(t)}>
            <span className="tab-icon">{ico}</span>{lbl}
          </button>
        ))}
        <button type="button" className="tab-btn" onClick={handleLogout}>
          <span className="tab-icon">🚪</span>ออก
        </button>
      </div>

      {showResForm && (
        <RestaurantFormModal
          resForm={resForm} setResForm={setResForm}
          isEditing={isEditing} onSave={handleSaveRestaurant}
          onClose={()=>{setShowResForm(false);setIsEditing(false);setResForm(EMPTY_FORM);}}
          saveLoad={saveLoad}
          showToast={showToast} />
      )}

      {detailRes && (
        <RestaurantDetailModal
          res={detailRes}
          onClose={() => { setDetailRes(null); setDeleteId(null); }}
          onEdit={startEdit}
          onDelete={handleDelete}
          deleteId={deleteId}
          setDeleteId={setDeleteId}
        />
      )}

      {toast && <Toast {...toast} onClose={()=>setToast(null)} />}
    </>
  );
}