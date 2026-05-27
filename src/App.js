import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ZONES = [
  "ไม่ระบุโซน / อื่นๆ",
  "สยาม / ปทุมวัน / ราชเทวี",
  "สุขุมวิท / ทองหล่อ / เอกมัย",
  "สีลม / สาทร / บางรัก",
  "อารีย์ / พหลโยธิน / ลาดพร้าว",
  "เยาวราช / พระนคร / เกาะรัตนโกสินทร์",
  "ฝั่งธนบุรี / วงเวียนใหญ่",
  "ชานเมือง / ปริมณฑล",
  "ต่างจังหวัด"
];

const EMPTY_FORM = {
  id: null,
  name: '',
  recommendedMenu: '',
  zone: ZONES[0],
  locationName: '',
  latitude: '',
  longitude: '',
  rating: 5
};

const EMPTY_USER_FORM = { username: '', password: '', role: 'user' };

// ─── Global CSS ────────────────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:       #FAF8F5;
    --cream2:      #F2EFE9;
    --cream3:      #E8E3DA;
    --parchment:   #EDE8DF;
    --gold:        #B8963E;
    --gold-light:  #D4AF61;
    --gold-pale:   #F5EDD4;
    --gold-glow:   rgba(184,150,62,0.15);
    --brown:       #3D2B1F;
    --brown-mid:   #6B4C35;
    --brown-light: #9E7E66;
    --brown-pale:  #C4A882;
    --rouge:       #C0392B;
    --rouge-pale:  #F9E8E6;
    --green:       #2D6A4F;
    --green-pale:  #E8F4EE;
    --text:        #2A1F17;
    --text-mid:    #5C4033;
    --text-soft:   #8C6E5A;
    --text-muted:  #B8A090;
    --border:      #DDD5C8;
    --border-mid:  #C8BDB0;
    --shadow:      rgba(42,31,23,0.08);
    --shadow-lg:   rgba(42,31,23,0.14);
  }

  html { font-size: 16px; }
  body {
    background: var(--cream);
    color: var(--text);
    font-family: 'DM Sans', 'Noto Sans Thai', sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -webkit-text-size-adjust: 100%;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--cream2); }
  ::-webkit-scrollbar-thumb { background: var(--cream3); border-radius: 4px; }

  h1, h2, h3, h4 { font-family: 'Cormorant Garamond', serif; }

  input, select, textarea {
    font-family: 'DM Sans', 'Noto Sans Thai', sans-serif;
    font-size: 16px;
    color: var(--text);
    background: #fff;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
    appearance: none;
    touch-action: manipulation;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px var(--gold-glow);
  }
  input::placeholder, textarea::placeholder { color: var(--text-muted); }
  select option { background: #fff; color: var(--text); }
  textarea { resize: vertical; min-height: 80px; }

  button {
    font-family: 'DM Sans', 'Noto Sans Thai', sans-serif;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.18s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-weight: 500;
    letter-spacing: 0.02em;
    touch-action: manipulation;
    min-height: 44px;
    -webkit-tap-highlight-color: transparent;
  }
  button:active { transform: scale(0.96); }
  button:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

  .btn-gold {
    background: linear-gradient(135deg, #B8963E, #D4AF61);
    color: #fff;
    padding: 13px 20px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    width: 100%;
    box-shadow: 0 4px 16px rgba(184,150,62,0.3);
    letter-spacing: 0.04em;
  }
  .btn-gold:hover:not(:disabled) {
    background: linear-gradient(135deg, #C8A84E, #E4BF71);
    box-shadow: 0 6px 22px rgba(184,150,62,0.4);
    transform: translateY(-1px);
  }

  .btn-outline {
    background: transparent;
    color: var(--text-mid);
    padding: 11px 16px;
    border-radius: 10px;
    font-size: 14px;
    border: 1.5px solid var(--border-mid);
  }
  .btn-outline:hover { border-color: var(--brown-pale); color: var(--text); background: var(--cream2); }

  .btn-soft {
    background: var(--gold-pale);
    color: var(--gold);
    padding: 9px 15px;
    border-radius: 9px;
    font-size: 13px;
    border: 1px solid rgba(184,150,62,0.25);
    min-height: 40px;
  }
  .btn-soft:hover { background: #ecddb6; }

  .btn-danger-soft {
    background: var(--rouge-pale);
    color: var(--rouge);
    padding: 9px 15px;
    border-radius: 9px;
    font-size: 13px;
    border: 1px solid rgba(192,57,43,0.15);
    min-height: 40px;
  }
  .btn-danger-soft:hover { background: #f3d0cc; }

  .btn-icon {
    background: var(--cream2);
    color: var(--text-soft);
    padding: 8px;
    border-radius: 8px;
    font-size: 16px;
    border: 1px solid var(--border);
    min-height: 36px;
    min-width: 36px;
    width: 36px;
    height: 36px;
  }
  .btn-icon:hover { background: var(--cream3); }

  .card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: 0 2px 12px var(--shadow);
    overflow: hidden;
  }
  .card-hover { transition: box-shadow 0.2s, transform 0.2s; }
  .card-hover:hover { box-shadow: 0 6px 24px var(--shadow-lg); transform: translateY(-1px); }

  .tag {
    display: inline-flex; align-items: center; gap: 3px;
    background: var(--cream2); border: 1px solid var(--border);
    color: var(--text-soft); font-size: 11px; padding: 3px 9px;
    border-radius: 20px; white-space: nowrap; line-height: 1.4;
  }
  .tag-gold { background: var(--gold-pale); border-color: rgba(184,150,62,0.3); color: var(--gold); }
  .tag-admin { background: linear-gradient(135deg,#B8963E22,#D4AF6122); border-color: var(--gold); color: var(--gold); }
  .tag-green { background: var(--green-pale); border-color: rgba(45,106,79,0.2); color: var(--green); }
  .tag-rouge { background: var(--rouge-pale); border-color: rgba(192,57,43,0.2); color: var(--rouge); }

  .divider { height: 1px; background: var(--cream2); }

  .section-label {
    font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted);
  }

  .fade-in { animation: fadeIn 0.3s ease forwards; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  .slide-down { animation: slideDown 0.25s ease forwards; }
  @keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }

  .map-container { border-radius: 12px; overflow: hidden; border: 1.5px solid var(--border); }
  .leaflet-container { font-family: 'DM Sans','Noto Sans Thai',sans-serif !important; }
  .leaflet-popup-content-wrapper { border-radius: 10px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important; }

  .ornament-line { display:flex; align-items:center; gap:12px; color:var(--gold); font-size:11px; letter-spacing:0.1em; }
  .ornament-line::before, .ornament-line::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,transparent,var(--gold-light),transparent); }

  .stat-card:hover { box-shadow: 0 8px 32px rgba(184,150,62,0.15); transform: translateY(-2px); transition: all 0.2s ease; }

  /* Modal overlay */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(42,31,23,0.55);
    backdrop-filter: blur(4px); z-index: 999;
    display: flex; align-items: flex-end; justify-content: center;
    animation: fadeOverlay 0.2s ease;
  }
  @keyframes fadeOverlay { from { opacity:0; } to { opacity:1; } }

  .modal-sheet {
    background: #fff; border-radius: 24px 24px 0 0;
    width: 100%; max-width: 520px; max-height: 92vh;
    overflow-y: auto; padding: 0;
    animation: slideSheet 0.28s cubic-bezier(.25,.8,.25,1);
    box-shadow: 0 -8px 48px rgba(42,31,23,0.18);
  }
  @keyframes slideSheet { from { transform: translateY(100%); opacity:0; } to { transform: translateY(0); opacity:1; } }

  @media (min-width: 520px) {
    .modal-overlay { align-items: center; }
    .modal-sheet { border-radius: 20px; max-height: 88vh; }
  }

  /* FAB */
  .fab {
    position: fixed; bottom: 24px; right: 20px; z-index: 90;
    width: 56px; height: 56px; border-radius: 18px;
    background: linear-gradient(135deg, #B8963E, #D4AF61);
    color: #fff; font-size: 24px; font-weight: 700;
    box-shadow: 0 6px 24px rgba(184,150,62,0.45);
    display: flex; align-items: center; justify-content: center;
    border: none; cursor: pointer;
    transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;
  }
  .fab:hover { transform: scale(1.07); box-shadow: 0 8px 30px rgba(184,150,62,0.55); }
  .fab:active { transform: scale(0.94); }

  /* Responsive helpers */
  @media (max-width: 480px) {
    .hide-mobile { display: none !important; }
    .stack-mobile { flex-direction: column !important; }
    .full-mobile { width: 100% !important; }
    input, select, textarea { font-size: 16px; }
  }
`;

// ─── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = '#fff' }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `2px solid ${color}40`, borderTopColor: color,
      borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0
    }} />
  );
}

// ─── Leaflet Map Picker ────────────────────────────────────────────────────────
function MapPicker({ lat, lng, onPick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const containerId = useRef('map-' + Math.random().toString(36).slice(2));

  useEffect(() => {
    if (mapRef.current || mapInstanceRef.current) return;
    const loadLeaflet = async () => {
      if (!window.L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css'; link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const L = window.L;
      const defaultLat = lat || 13.7563;
      const defaultLng = lng || 100.5018;
      const map = L.map(containerId.current, { zoomControl: true, scrollWheelZoom: true });
      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
      map.setView([defaultLat, defaultLng], 13);
      const makeIcon = () => L.divIcon({
        html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#B8963E,#D4AF61);transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 3px 12px rgba(184,150,62,0.5);"></div>`,
        className: '', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
      });
      if (lat && lng) {
        markerRef.current = L.marker([lat, lng], { icon: makeIcon(), draggable: true }).addTo(map);
        markerRef.current.on('dragend', e => { const p = e.target.getLatLng(); onPick(p.lat.toFixed(6), p.lng.toFixed(6)); });
      }
      map.on('click', e => {
        const { lat: nl, lng: nlng } = e.latlng;
        if (markerRef.current) { markerRef.current.setLatLng([nl, nlng]); }
        else {
          markerRef.current = L.marker([nl, nlng], { icon: makeIcon(), draggable: true }).addTo(map);
          markerRef.current.on('dragend', ev => { const p = ev.target.getLatLng(); onPick(p.lat.toFixed(6), p.lng.toFixed(6)); });
        }
        onPick(nl.toFixed(6), nlng.toFixed(6));
      });
    };
    loadLeaflet();
    mapRef.current = true;
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; markerRef.current = null; mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !lat || !lng) return;
    const L = window.L;
    const icon = L.divIcon({ html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#B8963E,#D4AF61);transform:rotate(-45deg);border:2px solid #fff;"></div>`, className: '', iconSize: [32,32], iconAnchor:[16,32] });
    if (markerRef.current) { markerRef.current.setLatLng([parseFloat(lat), parseFloat(lng)]); }
    else {
      markerRef.current = L.marker([parseFloat(lat), parseFloat(lng)], { icon, draggable: true }).addTo(mapInstanceRef.current);
      markerRef.current.on('dragend', e => { const p = e.target.getLatLng(); onPick(p.lat.toFixed(6), p.lng.toFixed(6)); });
    }
    mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lng)], 15);
  }, [lat, lng]);

  return <div id={containerId.current} className="map-container" style={{ height: '220px', width: '100%' }} />;
}

// ─── Read-only Map View ────────────────────────────────────────────────────────
function MapView({ lat, lng, name }) {
  const containerId = useRef('mapview-' + Math.random().toString(36).slice(2));
  const mapInstanceRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || mapInstanceRef.current) return;
    initRef.current = true;
    const init = async () => {
      if (!window.L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
        }
        await new Promise(resolve => { const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = resolve; document.head.appendChild(s); });
      }
      const L = window.L;
      const map = L.map(containerId.current, { zoomControl: false, dragging: false, scrollWheelZoom: false });
      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      map.setView([parseFloat(lat), parseFloat(lng)], 15);
      const icon = L.divIcon({ html: `<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#B8963E,#D4AF61);border:2px solid #fff;box-shadow:0 2px 8px rgba(184,150,62,0.5);"></div>`, className: '', iconSize:[24,24], iconAnchor:[12,12] });
      L.marker([parseFloat(lat), parseFloat(lng)], { icon }).addTo(map).bindPopup(name || 'ร้านอาหาร');
    };
    init();
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  return <div id={containerId.current} className="map-container" style={{ height: '160px', width: '100%' }} />;
}

// ─── Stars Display ─────────────────────────────────────────────────────────────
function Stars({ value, size = 14 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= value ? '#B8963E' : '#DDD5C8', fontSize: size+'px', letterSpacing: '1px' }}>★</span>
      ))}
    </span>
  );
}

// ─── Star Picker ───────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} onClick={() => onChange(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          style={{ fontSize: '28px', cursor: 'pointer', color: i <= (hover||value) ? '#B8963E' : '#DDD5C8', transition: 'color 0.12s, transform 0.1s', transform: i <= (hover||value) ? 'scale(1.2)' : 'scale(1)', lineHeight: 1 }}>★</span>
      ))}
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>{value}/5</span>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success: { bg: '#E8F4EE', border: '#2D6A4F', text: '#1B4332', icon: '✓' },
    error:   { bg: '#F9E8E6', border: '#C0392B', text: '#7B241C', icon: '✕' },
    info:    { bg: '#F5EDD4', border: '#B8963E', text: '#6B4C19', icon: 'ℹ' },
  };
  const c = cfg[type] || cfg.info;
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      background: c.bg, border: `1.5px solid ${c.border}`, color: c.text,
      padding: '12px 20px 12px 16px', borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 9999,
      fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px',
      animation: 'fadeIn 0.2s ease', borderLeft: `4px solid ${c.border}`,
      fontWeight: 500, maxWidth: 'calc(100vw - 40px)', whiteSpace: 'nowrap'
    }}>
      <span style={{ fontWeight: 700, fontSize: '16px' }}>{c.icon}</span>
      {msg}
      <span onClick={onClose} style={{ marginLeft: '8px', cursor: 'pointer', opacity: 0.5, fontSize: '12px' }}>✕</span>
    </div>
  );
}

// ─── User Modal (Admin) ────────────────────────────────────────────────────────
function UserModal({ mode, data, onClose, onSave, loading }) {
  const [form, setForm] = useState(
    mode === 'edit' ? { username: data?.username || '', password: '', role: data?.role || 'user' }
                    : EMPTY_USER_FORM
  );
  const [showPw, setShowPw] = useState(false);

  const isEdit = mode === 'edit';

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet">
        {/* Handle bar */}
        <div style={{ width: '40px', height: '4px', background: 'var(--cream3)', borderRadius: '4px', margin: '14px auto 0' }} />

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '22px', color: 'var(--brown)', fontWeight: 600 }}>
              {isEdit ? `✏ แก้ไขผู้ใช้` : '👤 เพิ่มผู้ใช้ใหม่'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isEdit ? `กำลังแก้ไข: ${data?.username}` : 'สร้างบัญชีผู้ใช้ใหม่ในระบบ'}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ fontSize: '18px', flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Username */}
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '8px' }}>USERNAME</label>
            <input
              type="text" placeholder="ชื่อผู้ใช้"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              disabled={isEdit}
              style={isEdit ? { background: 'var(--cream2)', color: 'var(--text-muted)' } : {}}
            />
            {isEdit && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>ไม่สามารถเปลี่ยน username ได้</p>}
          </div>

          {/* Password */}
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '8px' }}>
              {isEdit ? 'PASSWORD ใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'PASSWORD *'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder={isEdit ? 'กรอกรหัสผ่านใหม่...' : 'ตั้งรหัสผ่าน'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingRight: '48px' }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', minHeight: 'unset', padding: '4px', color: 'var(--text-muted)', fontSize: '16px' }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '8px' }}>ROLE</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['user', 'admin'].map(r => (
                <button key={r} type="button"
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                    border: `2px solid ${form.role === r ? 'var(--gold)' : 'var(--border)'}`,
                    background: form.role === r ? 'var(--gold-pale)' : '#fff',
                    color: form.role === r ? 'var(--gold)' : 'var(--text-muted)',
                    minHeight: '48px'
                  }}>
                  {r === 'admin' ? '🛡️ Admin' : '👤 User'}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button className="btn-outline" onClick={onClose} style={{ flex: 1 }}>ยกเลิก</button>
            <button className="btn-gold" disabled={loading} onClick={() => onSave(form)} style={{ flex: 2, fontSize: '15px' }}>
              {loading ? <><Spinner /> กำลังบันทึก...</> : isEdit ? '💾 บันทึกการแก้ไข' : '✦ สร้างผู้ใช้'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Restaurant Form Modal ─────────────────────────────────────────────────────
function RestaurantFormModal({ resForm, setResForm, isEditing, onSave, onClose, saveLoad }) {
  const [showMap, setShowMap] = useState(!!(resForm.latitude && resForm.longitude));
  const [gpsLoad, setGpsLoad] = useState(false);

  const handleGPS = () => {
    if (!navigator.geolocation) return alert('เบราว์เซอร์ไม่รองรับ GPS');
    setGpsLoad(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setResForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
        setShowMap(true); setGpsLoad(false);
      },
      () => { setGpsLoad(false); alert('ไม่สามารถดึงพิกัดได้'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet">
        <div style={{ width: '40px', height: '4px', background: 'var(--cream3)', borderRadius: '4px', margin: '14px auto 0' }} />
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '22px', color: 'var(--brown)', fontWeight: 600 }}>
              {isEditing ? '✏ แก้ไขข้อมูลร้าน' : '🍜 เพิ่มร้านอาหาร'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isEditing ? 'ปรับปรุงรายละเอียดร้านอาหาร' : 'บันทึกร้านโปรดลงคลังของคุณ'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditing && <span className="tag tag-gold">EDITING</span>}
            <button onClick={onClose} className="btn-icon" style={{ fontSize: '18px', flexShrink: 0 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '16px 20px 36px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name */}
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '7px' }}>ชื่อร้านอาหาร *</label>
            <input type="text" placeholder="เช่น ร้านก๋วยเตี๋ยวเรือป้าแดง"
              value={resForm.name} onChange={e => setResForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          {/* Menu */}
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '7px' }}>เมนูแนะนำ / Signature Dish *</label>
            <input type="text" placeholder="เช่น ก๋วยเตี๋ยวเรือหมู น้ำตก"
              value={resForm.recommendedMenu} onChange={e => setResForm(f => ({ ...f, recommendedMenu: e.target.value }))} />
          </div>

          {/* Zone + Location */}
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: '7px' }}>โซน / ย่านที่ตั้ง</label>
              <div style={{ position: 'relative' }}>
                <select value={resForm.zone} onChange={e => setResForm(f => ({ ...f, zone: e.target.value }))}>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>▾</span>
              </div>
            </div>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: '7px' }}>ทำเลละเอียด *</label>
              <input type="text" placeholder="เช่น ทองหล่อ ซ.5 ใกล้ BTS"
                value={resForm.locationName} onChange={e => setResForm(f => ({ ...f, locationName: e.target.value }))} />
            </div>
          </div>

          {/* Rating */}
          <div style={{ background: 'var(--cream)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <label className="section-label">คะแนนความชอบ</label>
            <StarPicker value={resForm.rating} onChange={v => setResForm(f => ({ ...f, rating: v }))} />
          </div>

          {/* GPS */}
          <div style={{ border: '1.5px dashed var(--border-mid)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <label className="section-label">📍 พิกัด GPS (ไม่บังคับ)</label>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>กดปักหมุดบนแผนที่ หรือดึงพิกัดอัตโนมัติ</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-soft" onClick={() => setShowMap(v => !v)} style={{ fontSize: '12px', padding: '7px 12px', minHeight: '36px' }}>
                  🗺️ {showMap ? 'ซ่อน' : 'แผนที่'}
                </button>
                <button type="button" className="btn-soft" onClick={handleGPS} disabled={gpsLoad} style={{ fontSize: '12px', padding: '7px 12px', minHeight: '36px' }}>
                  {gpsLoad ? <Spinner size={12} color="var(--gold)" /> : '📡 GPS'}
                </button>
              </div>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label className="section-label" style={{ display: 'block', marginBottom: '5px' }}>LATITUDE</label>
                <input type="text" placeholder="13.7563" value={resForm.latitude} onChange={e => setResForm(f => ({ ...f, latitude: e.target.value }))} style={{ fontSize: '14px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="section-label" style={{ display: 'block', marginBottom: '5px' }}>LONGITUDE</label>
                <input type="text" placeholder="100.5018" value={resForm.longitude} onChange={e => setResForm(f => ({ ...f, longitude: e.target.value }))} style={{ fontSize: '14px' }} />
              </div>
            </div>
            {showMap && (
              <div style={{ padding: '0 14px 14px' }}>
                <MapPicker
                  lat={resForm.latitude ? parseFloat(resForm.latitude) : null}
                  lng={resForm.longitude ? parseFloat(resForm.longitude) : null}
                  onPick={(lat, lng) => setResForm(f => ({ ...f, latitude: lat, longitude: lng }))}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>กดบนแผนที่เพื่อปักหมุด หรือลากหมุดเพื่อเปลี่ยนตำแหน่ง</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline" onClick={onClose} style={{ flex: 1 }}>ยกเลิก</button>
            <button className="btn-gold" disabled={saveLoad} onClick={onSave} style={{ flex: 2, fontSize: '15px' }}>
              {saveLoad ? <><Spinner /> กำลังบันทึก...</> : isEditing ? '💾 บันทึกการแก้ไข' : '✦ บันทึกร้านอาหาร'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user,      setUser]      = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginErr,  setLoginErr]  = useState('');
  const [loginLoad, setLoginLoad] = useState(false);
  const [showPw,    setShowPw]    = useState(false);

  // ── User states ──────────────────────────────────────────────────────────────
  const [restaurants, setRestaurants] = useState([]);
  const [searchQ,     setSearchQ]     = useState('');
  const [filterZone,  setFilterZone]  = useState('');
  const [resForm,     setResForm]     = useState(EMPTY_FORM);
  const [isEditing,   setIsEditing]   = useState(false);
  const [showResForm, setShowResForm] = useState(false);
  const [saveLoad,    setSaveLoad]    = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [expandedId,  setExpandedId]  = useState(null);

  // ── Admin states ─────────────────────────────────────────────────────────────
  const [adminUsers,   setAdminUsers]   = useState([]);
  const [adminSearch,  setAdminSearch]  = useState('');
  const [stats,        setStats]        = useState({ totalUsers: 0, totalRestaurants: 0 });
  const [userModal,    setUserModal]    = useState({ open: false, mode: 'add', data: null });
  const [userSaveLoad, setUserSaveLoad] = useState(false);
  const [userDeleteId, setUserDeleteId] = useState(null);
  const [userDelLoad,  setUserDelLoad]  = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchRestaurants = useCallback(async (uid) => {
    try {
      const r = await axios.get(`${API_URL}/restaurants/${uid}`);
      setRestaurants(r.data);
    } catch { showToast('โหลดข้อมูลไม่สำเร็จ', 'error'); }
  }, [showToast]);

  const fetchAdminData = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([
        axios.get(`${API_URL}/admin/users`),
        axios.get(`${API_URL}/admin/stats`)
      ]);
      setAdminUsers(u.data);
      setStats(s.data);
    } catch { showToast('โหลดข้อมูล Admin ไม่สำเร็จ', 'error'); }
  }, [showToast]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'user')  fetchRestaurants(user._id || user.id);
    if (user.role === 'admin') fetchAdminData();
  }, [user, fetchRestaurants, fetchAdminData]);

  // ── Login / Logout ───────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password.trim()) { setLoginErr('กรุณากรอกข้อมูลให้ครบถ้วน'); return; }
    setLoginErr(''); setLoginLoad(true);
    try {
      const res = await axios.post(`${API_URL}/login`, loginForm);
      if (res.data.success) { setUser(res.data.user); setLoginForm({ username: '', password: '' }); }
      else setLoginErr(res.data.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } catch (err) {
      setLoginErr(err.response?.data?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally { setLoginLoad(false); }
  };

  const handleLogout = () => {
    setUser(null); setRestaurants([]); setAdminUsers([]);
    setShowResForm(false); setResForm(EMPTY_FORM);
    setIsEditing(false); setDeleteId(null); setExpandedId(null);
    setUserModal({ open: false, mode: 'add', data: null }); setUserDeleteId(null);
  };

  // ── Restaurant CRUD ──────────────────────────────────────────────────────────
  const handleSaveRestaurant = async () => {
    if (!resForm.name.trim() || !resForm.locationName.trim() || !resForm.recommendedMenu.trim()) {
      showToast('กรุณากรอกชื่อร้าน เมนูแนะนำ และทำเล', 'error'); return;
    }
    setSaveLoad(true);
    try {
      const lat = resForm.latitude === '' ? null : parseFloat(resForm.latitude);
      const lng = resForm.longitude === '' ? null : parseFloat(resForm.longitude);
      const payload = {
        userId:          user._id || user.id,
        name:            resForm.name.trim(),
        recommendedMenu: resForm.recommendedMenu.trim(),
        zone:            resForm.zone,
        locationName:    `[${resForm.zone}] ${resForm.locationName.trim()}`,
        latitude:        (lat !== null && !isNaN(lat)) ? lat : null,
        longitude:       (lng !== null && !isNaN(lng)) ? lng : null,
        rating:          resForm.rating
      };
      if (isEditing && resForm.id) {
        await axios.put(`${API_URL}/restaurants/${resForm.id}`, payload);
        showToast('แก้ไขข้อมูลสำเร็จแล้ว ✓');
      } else {
        await axios.post(`${API_URL}/restaurants`, payload);
        showToast('บันทึกร้านใหม่สำเร็จแล้ว ✓');
      }
      setResForm(EMPTY_FORM); setShowResForm(false); setIsEditing(false);
      await fetchRestaurants(user._id || user.id);
    } catch (err) {
      showToast(err.response?.data?.details || err.response?.data?.error || 'บันทึกไม่สำเร็จ กรุณาลองใหม่', 'error');
    } finally { setSaveLoad(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/restaurants/${id}`);
      setDeleteId(null); setExpandedId(null);
      await fetchRestaurants(user._id || user.id);
      showToast('ลบร้านอาหารออกจากคลังแล้ว');
    } catch { showToast('ลบข้อมูลไม่สำเร็จ', 'error'); }
  };

  const startEdit = (res) => {
    let zone = ZONES[0];
    let locName = res.locationName || '';
    const m = locName.match(/^\[(.*?)\]\s*/);
    if (m) { const z = ZONES.find(z => z === m[1]); if (z) zone = z; locName = locName.replace(/^\[.*?\]\s*/, ''); }
    setResForm({ id: res._id || res.id, name: res.name || '', recommendedMenu: res.recommendedMenu || '', zone, locationName: locName, latitude: res.latitude != null ? String(res.latitude) : '', longitude: res.longitude != null ? String(res.longitude) : '', rating: res.rating || 5 });
    setIsEditing(true); setShowResForm(true); setExpandedId(null);
  };

  // ── Admin User CRUD ──────────────────────────────────────────────────────────
  const handleSaveUser = async (form) => {
    setUserSaveLoad(true);
    try {
      if (userModal.mode === 'add') {
        if (!form.username.trim() || !form.password.trim()) { showToast('กรุณากรอก username และ password', 'error'); return; }
        await axios.post(`${API_URL}/admin/users`, form);
        showToast('สร้างผู้ใช้ใหม่สำเร็จ ✓');
      } else {
        if (!form.password.trim() && form.role === userModal.data?.role) { showToast('ไม่มีการเปลี่ยนแปลง', 'info'); return; }
        await axios.put(`${API_URL}/admin/users/${userModal.data._id}`, { password: form.password, role: form.role });
        showToast('แก้ไขข้อมูลผู้ใช้สำเร็จ ✓');
      }
      setUserModal({ open: false, mode: 'add', data: null });
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || 'เกิดข้อผิดพลาด', 'error');
    } finally { setUserSaveLoad(false); }
  };

  const handleDeleteUser = async (id) => {
    if (id === (user._id || user.id)) { showToast('ไม่สามารถลบบัญชีตัวเองได้', 'error'); setUserDeleteId(null); return; }
    setUserDelLoad(true);
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`);
      setUserDeleteId(null);
      showToast('ลบผู้ใช้สำเร็จ');
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || 'ลบไม่สำเร็จ', 'error');
    } finally { setUserDelLoad(false); }
  };

  // ── Filter ────────────────────────────────────────────────────────────────────
  const filtered = restaurants.filter(r => {
    const q = searchQ.toLowerCase().trim();
    const matchSearch = !q || r.name?.toLowerCase().includes(q) || r.locationName?.toLowerCase().includes(q) || r.recommendedMenu?.toLowerCase().includes(q);
    const matchZone = !filterZone || r.zone === filterZone || r.locationName?.includes(`[${filterZone}]`);
    return matchSearch && matchZone;
  });
  const filteredAdminUsers = adminUsers.filter(u => !adminSearch || u.username?.toLowerCase().includes(adminSearch.toLowerCase()));

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER: LOGIN
  // ══════════════════════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <>
        <style>{globalCSS}</style>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #FAF8F5 0%, #F2EDE5 40%, #EDE5D8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          backgroundImage: `radial-gradient(ellipse at 15% 40%, rgba(184,150,62,0.08) 0%, transparent 55%),radial-gradient(ellipse at 85% 15%, rgba(184,150,62,0.05) 0%, transparent 45%)`
        }}>
          <div className="fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'linear-gradient(135deg, #B8963E, #D4AF61)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px', boxShadow: '0 10px 40px rgba(184,150,62,0.3)' }}>🍜</div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--brown)', marginBottom: '6px' }}>YUMMY LOG</h1>
              <div className="ornament-line" style={{ maxWidth: '240px', margin: '10px auto' }}><span>PERSONAL FOOD JOURNAL</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>บันทึกร้านอาหารโปรดของคุณไว้ที่นี่</p>
            </div>

            <div className="card" style={{ padding: '28px 24px 24px' }}>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="section-label" style={{ display: 'block', marginBottom: '8px' }}>USERNAME</label>
                  <input type="text" placeholder="ชื่อผู้ใช้" value={loginForm.username} autoComplete="username"
                    onChange={e => { setLoginErr(''); setLoginForm(f => ({ ...f, username: e.target.value })); }} required />
                </div>
                <div>
                  <label className="section-label" style={{ display: 'block', marginBottom: '8px' }}>PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} placeholder="รหัสผ่าน" value={loginForm.password} autoComplete="current-password"
                      onChange={e => { setLoginErr(''); setLoginForm(f => ({ ...f, password: e.target.value })); }} required style={{ paddingRight: '48px' }} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', padding: '4px', color: 'var(--text-muted)', fontSize: '16px', minHeight: 'unset' }}>
                      {showPw ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                {loginErr && (
                  <div style={{ background: 'var(--rouge-pale)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--rouge)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>⚠</span> {loginErr}
                  </div>
                )}

                <button type="submit" className="btn-gold" disabled={loginLoad} style={{ marginTop: '4px', fontSize: '15px', padding: '14px 20px' }}>
                  {loginLoad ? <><Spinner /> กำลังเข้าสู่ระบบ...</> : 'เข้าสู่ระบบ →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px', padding: '14px', background: 'var(--cream)', borderRadius: '10px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  ยังไม่มีบัญชี? ระบบจะสร้างให้อัตโนมัติเมื่อ Login ครั้งแรก<br />
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>username = admin</span> สำหรับเข้าหน้าจัดการ
                </p>
              </div>
            </div>
          </div>
        </div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER: ADMIN DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════════
  if (user.role === 'admin') {
    return (
      <>
        <style>{globalCSS}</style>
        <div style={{ minHeight: '100vh', background: 'var(--cream)', backgroundImage: 'radial-gradient(ellipse at 80% 10%, rgba(184,150,62,0.06) 0%, transparent 50%)' }}>

          {/* Header */}
          <header style={{ background: 'linear-gradient(135deg, #3D2B1F 0%, #6B4C35 100%)', padding: '0 16px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(61,43,31,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #B8963E, #D4AF61)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🛡️</div>
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#FAF8F5', fontWeight: 600, letterSpacing: '0.05em' }}>ADMIN PANEL</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>YUMMY LOG</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="hide-mobile" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{user.username}</span>
              <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.18)', fontWeight: 500, minHeight: '38px' }}>ออกจากระบบ</button>
            </div>
          </header>

          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Title */}
            <div className="fade-in">
              <h2 style={{ fontSize: '26px', color: 'var(--brown)', fontWeight: 600 }}>ภาพรวมระบบ</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '3px' }}>ข้อมูลสรุปและจัดการสมาชิกในระบบ</p>
            </div>

            {/* Stats */}
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
              {[
                { label: 'สมาชิกทั้งหมด',    value: stats.totalUsers,       unit: 'บัญชี', icon: '👤', color: '#B8963E', bg: 'linear-gradient(135deg, #fff 60%, #F5EDD4)' },
                { label: 'ร้านอาหารทั้งหมด', value: stats.totalRestaurants, unit: 'ร้าน',  icon: '🍽️', color: '#2D6A4F', bg: 'linear-gradient(135deg, #fff 60%, #E8F4EE)' },
              ].map((s, i) => (
                <div key={s.label} className="card stat-card" style={{ padding: '20px', background: s.bg, borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p className="section-label" style={{ marginBottom: '8px' }}>{s.label}</p>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <p style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '4px' }}>{s.unit}</p>
                    </div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{s.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* User Management */}
            <div className="card fade-in">
              {/* Card Header */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--cream2)', background: 'linear-gradient(135deg, #fff, var(--cream))' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', color: 'var(--brown)', fontWeight: 600 }}>
                      จัดการสมาชิก
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontWeight: 400, marginLeft: '8px' }}>({filteredAdminUsers.length})</span>
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>เพิ่ม แก้ไข หรือลบบัญชีผู้ใช้ในระบบ</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button className="btn-soft" onClick={fetchAdminData} style={{ fontSize: '13px', padding: '9px 14px' }}>↻ รีเฟรช</button>
                    <button className="btn-gold" onClick={() => setUserModal({ open: true, mode: 'add', data: null })}
                      style={{ width: 'auto', padding: '10px 18px', fontSize: '13px', fontWeight: 600 }}>+ เพิ่มผู้ใช้</button>
                  </div>
                </div>
                <div style={{ marginTop: '14px' }}>
                  <input type="text" placeholder="🔍 ค้นหาชื่อบัญชี..." value={adminSearch}
                    onChange={e => setAdminSearch(e.target.value)} style={{ fontSize: '14px' }} />
                </div>
              </div>

              {/* User List */}
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '60vh', overflowY: 'auto' }}>
                {filteredAdminUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>👤</div>
                    <p>ไม่พบสมาชิกที่ค้นหา</p>
                  </div>
                ) : filteredAdminUsers.map((u, i) => (
                  <div key={u._id} style={{
                    background: i % 2 === 0 ? '#fff' : 'var(--cream)',
                    borderRadius: '12px', padding: '12px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                    border: '1px solid var(--border)', animation: `fadeIn 0.2s ease ${i * 0.02}s both`
                  }}>
                    {/* Left: Avatar + Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0, background: u.role === 'admin' ? 'linear-gradient(135deg, #B8963E, #D4AF61)' : 'linear-gradient(135deg, #E8E3DA, #DDD5C8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        {u.role === 'admin' ? '🛡️' : '👤'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span className={`tag ${u.role === 'admin' ? 'tag-admin' : ''}`} style={{ fontSize: '10px', padding: '2px 7px' }}>{u.role?.toUpperCase()}</span>
                          <span className="hide-mobile" style={{ marginLeft: '8px' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' }) : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {userDeleteId === u._id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>ยืนยันลบ?</span>
                          <button className="btn-danger-soft" disabled={userDelLoad}
                            onClick={() => handleDeleteUser(u._id)}
                            style={{ fontSize: '12px', padding: '7px 12px', minHeight: '36px' }}>
                            {userDelLoad ? <Spinner size={12} color="var(--rouge)" /> : 'ลบ'}
                          </button>
                          <button className="btn-outline" onClick={() => setUserDeleteId(null)} style={{ fontSize: '12px', padding: '7px 12px', minHeight: '36px' }}>ยกเลิก</button>
                        </div>
                      ) : (
                        <>
                          <button className="btn-soft" onClick={() => setUserModal({ open: true, mode: 'edit', data: u })}
                            style={{ fontSize: '12px', padding: '7px 12px', minHeight: '36px' }}>✏ แก้ไข</button>
                          <button className="btn-danger-soft"
                            onClick={() => setUserDeleteId(u._id)}
                            disabled={u.username === 'admin'}
                            title={u.username === 'admin' ? 'ไม่สามารถลบ admin หลักได้' : 'ลบผู้ใช้'}
                            style={{ fontSize: '12px', padding: '7px 12px', minHeight: '36px' }}>🗑 ลบ</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Modal */}
        {userModal.open && (
          <UserModal
            mode={userModal.mode}
            data={userModal.data}
            onClose={() => setUserModal({ open: false, mode: 'add', data: null })}
            onSave={handleSaveUser}
            loading={userSaveLoad}
          />
        )}
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER: USER DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: '100vh', background: 'var(--cream)', backgroundImage: 'radial-gradient(ellipse at 90% 5%, rgba(184,150,62,0.07) 0%, transparent 50%)' }}>

        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 16px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 12px var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #B8963E, #D4AF61)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🍜</div>
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', fontWeight: 600, color: 'var(--brown)', lineHeight: 1.2, letterSpacing: '0.03em' }}>{user.username.toUpperCase()}'S LOG</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>FOOD JOURNAL</div>
            </div>
          </div>
          <button className="btn-outline" style={{ padding: '8px 14px', fontSize: '13px', minHeight: '38px' }} onClick={handleLogout}>ออกจากระบบ</button>
        </header>

        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px 14px 100px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Search & Filter */}
          <div className="card" style={{ padding: '14px' }}>
            <input type="text" placeholder="🔍 ค้นหาชื่อร้าน, เมนู, หรือทำเล..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ marginBottom: '10px' }} />
            <div style={{ position: 'relative' }}>
              <select value={filterZone} onChange={e => setFilterZone(e.target.value)}>
                <option value="">🗺️ แสดงทุกโซน</option>
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>▾</span>
            </div>
          </div>

          {/* List Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span className="section-label">
              รายการร้านอาหาร &nbsp;
              <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '13px' }}>{filtered.length}</span>
              {filtered.length !== restaurants.length && <span style={{ color: 'var(--text-muted)' }}> / {restaurants.length}</span>}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2D6A4F', display: 'inline-block', boxShadow: '0 0 0 3px rgba(45,106,79,0.2)', animation: 'pulse 2s infinite' }} />
              <span className="section-label">LIVE</span>
            </div>
          </div>

          {/* Restaurant Cards */}
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: '56px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.25 }}>🍽️</div>
              <h3 style={{ fontSize: '20px', color: 'var(--brown-mid)', marginBottom: '8px' }}>
                {restaurants.length === 0 ? 'ยังไม่มีร้านอาหารในคลัง' : 'ไม่พบร้านที่ค้นหา'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {restaurants.length === 0 ? 'กดปุ่ม + เพื่อเริ่มบันทึกร้านโปรดของคุณ' : 'ลองเปลี่ยนคำค้นหาหรือโซน'}
              </p>
            </div>
          ) : filtered.map((res, i) => {
            const hasGPS = res.latitude != null && res.longitude != null;
            const isExpanded = expandedId === res._id;
            return (
              <div key={res._id} className="card card-hover fade-in" style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}>
                <div style={{ padding: '16px', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : res._id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--brown)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{res.name}</h4>
                        {hasGPS && <span className="tag tag-green" style={{ fontSize: '10px' }}>📍 GPS</span>}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-soft)', marginBottom: '10px' }}>
                        <span style={{ color: 'var(--gold)' }}>✦</span> {res.recommendedMenu}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        <span className="tag">{res.zone || 'ไม่ระบุโซน'}</span>
                        {res.locationName && (
                          <span className="tag" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {res.locationName.replace(/^\[.*?\]\s*/, '')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                      <Stars value={res.rating} />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▾</span>
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="slide-down">
                    <div className="divider" />
                    {hasGPS && (
                      <div style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🌐</span><span>{res.latitude?.toFixed(6)}, {res.longitude?.toFixed(6)}</span>
                        </div>
                        <MapView lat={res.latitude} lng={res.longitude} name={res.name} />
                      </div>
                    )}
                    <div className="divider" />
                    <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-muted)' }}>
                        {res.createdAt ? new Date(res.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' }) : ''}
                      </div>
                      <button className="btn-soft" onClick={() => startEdit(res)} style={{ fontSize: '13px' }}>✏ แก้ไข</button>
                      {deleteId === res._id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ยืนยันลบ?</span>
                          <button className="btn-danger-soft" onClick={() => handleDelete(res._id)} style={{ fontSize: '12px' }}>ลบ</button>
                          <button className="btn-outline" onClick={() => setDeleteId(null)} style={{ fontSize: '12px', padding: '7px 12px' }}>ยกเลิก</button>
                        </div>
                      ) : (
                        <button className="btn-danger-soft" onClick={() => setDeleteId(res._id)} style={{ fontSize: '13px' }}>🗑 ลบ</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ height: '20px' }} />
        </div>
      </div>

      {/* FAB — Add Restaurant */}
      <button className="fab" onClick={() => { setResForm(EMPTY_FORM); setIsEditing(false); setShowResForm(true); }} title="เพิ่มร้านอาหาร">+</button>

      {/* Restaurant Form Modal */}
      {showResForm && (
        <RestaurantFormModal
          resForm={resForm}
          setResForm={setResForm}
          isEditing={isEditing}
          onSave={handleSaveRestaurant}
          onClose={() => { setShowResForm(false); setIsEditing(false); setResForm(EMPTY_FORM); }}
          saveLoad={saveLoad}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
}