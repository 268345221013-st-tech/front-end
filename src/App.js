import React, { useState, useEffect, useCallback } from 'react';
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
  id: null, name: '', recommendedMenu: '',
  zone: ZONES[0], locationName: '',
  latitude: '', longitude: '', rating: 5
};

// ─── Theme & Styles ────────────────────────────────────────────────────────────
const theme = {
  bg:          '#0D0D0D',
  bgCard:      '#161616',
  bgInput:     '#1E1E1E',
  border:      '#2A2A2A',
  accent:      '#FF6B35',
  accentSoft:  'rgba(255,107,53,0.12)',
  accentGlow:  'rgba(255,107,53,0.25)',
  gold:        '#F5C842',
  text:        '#F0EDE8',
  textMuted:   '#6B6B6B',
  textSub:     '#9A9A9A',
  danger:      '#FF4444',
  dangerSoft:  'rgba(255,68,68,0.1)',
  success:     '#4CAF50',
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${theme.bg};
    color: ${theme.text};
    font-family: 'Noto Sans Thai', 'DM Mono', monospace;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${theme.bg}; }
  ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 2px; }

  input, select, textarea {
    font-family: 'Noto Sans Thai', 'DM Mono', monospace;
    font-size: 14px;
    color: ${theme.text};
    background: ${theme.bgInput};
    border: 1px solid ${theme.border};
    border-radius: 8px;
    padding: 12px 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  input:focus, select:focus {
    border-color: ${theme.accent};
    box-shadow: 0 0 0 3px ${theme.accentGlow};
  }
  input::placeholder { color: ${theme.textMuted}; }
  select option { background: #1E1E1E; }

  button {
    font-family: 'Noto Sans Thai', 'DM Mono', monospace;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.18s ease;
    letter-spacing: 0.03em;
  }
  button:active { transform: scale(0.97); }
  button:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-primary {
    background: ${theme.accent};
    color: #fff;
    padding: 13px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    width: 100%;
    box-shadow: 0 4px 20px ${theme.accentGlow};
  }
  .btn-primary:hover { background: #ff8255; box-shadow: 0 6px 24px ${theme.accentGlow}; transform: translateY(-1px); }

  .btn-ghost {
    background: ${theme.bgInput};
    color: ${theme.textSub};
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 12px;
    border: 1px solid ${theme.border};
  }
  .btn-ghost:hover { border-color: ${theme.textSub}; color: ${theme.text}; }

  .btn-danger {
    background: ${theme.dangerSoft};
    color: ${theme.danger};
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 12px;
    border: 1px solid rgba(255,68,68,0.2);
  }
  .btn-danger:hover { background: rgba(255,68,68,0.18); }

  .btn-edit {
    background: ${theme.accentSoft};
    color: ${theme.accent};
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 12px;
    border: 1px solid rgba(255,107,53,0.2);
  }
  .btn-edit:hover { background: rgba(255,107,53,0.2); }

  .tag {
    display: inline-block;
    background: ${theme.bgInput};
    border: 1px solid ${theme.border};
    color: ${theme.textSub};
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 20px;
    font-family: 'DM Mono', monospace;
  }
  .tag-accent {
    background: ${theme.accentSoft};
    border-color: rgba(255,107,53,0.25);
    color: ${theme.accent};
  }

  .card {
    background: ${theme.bgCard};
    border: 1px solid ${theme.border};
    border-radius: 14px;
    overflow: hidden;
  }

  .divider {
    height: 1px;
    background: ${theme.border};
    margin: 0;
  }

  .fade-in {
    animation: fadeIn 0.3s ease forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .slide-down {
    animation: slideDown 0.25s ease forwards;
  }
  @keyframes slideDown {
    from { opacity: 0; max-height: 0; }
    to   { opacity: 1; max-height: 800px; }
  }

  .pulse-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${theme.success};
    display: inline-block;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }

  @media (max-width: 640px) {
    .hide-mobile { display: none !important; }
    .stack-mobile { flex-direction: column !important; }
    .full-mobile  { width: 100% !important; }
  }
`;

// ─── Star Rating Display ───────────────────────────────────────────────────────
function Stars({ value }) {
  return (
    <span style={{ letterSpacing: '1px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= value ? theme.gold : theme.border, fontSize: '13px' }}>★</span>
      ))}
    </span>
  );
}

// ─── Star Rating Selector ──────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          style={{
            fontSize: '24px',
            cursor: 'pointer',
            color: i <= (hover || value) ? theme.gold : theme.border,
            transition: 'color 0.15s, transform 0.1s',
            transform: i <= (hover || value) ? 'scale(1.15)' : 'scale(1)',
            lineHeight: 1
          }}
        >★</span>
      ))}
      <span style={{ fontSize: '12px', color: theme.textMuted, marginLeft: '6px', fontFamily: 'DM Mono' }}>
        {value}/5
      </span>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = { success: theme.success, error: theme.danger, info: theme.accent };
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      background: theme.bgCard, border: `1px solid ${colors[type] || theme.border}`,
      color: theme.text, padding: '12px 20px', borderRadius: '12px',
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${colors[type]}22`,
      zIndex: 9999, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
      animation: 'fadeIn 0.2s ease', whiteSpace: 'nowrap',
      borderLeft: `3px solid ${colors[type] || theme.border}`
    }}>
      <span>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      {msg}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user,       setUser]       = useState(null);
  const [loginForm,  setLoginForm]  = useState({ username: '', password: '' });
  const [loginErr,   setLoginErr]   = useState('');
  const [loginLoad,  setLoginLoad]  = useState(false);

  // User states
  const [restaurants, setRestaurants] = useState([]);
  const [searchQ,     setSearchQ]     = useState('');
  const [filterZone,  setFilterZone]  = useState('');
  const [resForm,     setResForm]     = useState(EMPTY_FORM);
  const [isEditing,   setIsEditing]   = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [gpsLoad,     setGpsLoad]     = useState(false);
  const [saveLoad,    setSaveLoad]    = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);

  // Admin states
  const [adminUsers,    setAdminUsers]    = useState([]);
  const [adminSearch,   setAdminSearch]   = useState('');
  const [stats,         setStats]         = useState({ totalUsers: 0, totalRestaurants: 0 });

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRestaurants = useCallback(async (uid) => {
    try {
      const r = await axios.get(`${API_URL}/restaurants/${uid}`);
      setRestaurants(r.data);
    } catch { showToast('โหลดข้อมูลไม่สำเร็จ', 'error'); }
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([
        axios.get(`${API_URL}/admin/users`),
        axios.get(`${API_URL}/admin/stats`)
      ]);
      setAdminUsers(u.data);
      setStats(s.data);
    } catch { showToast('โหลดข้อมูล Admin ไม่สำเร็จ', 'error'); }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'user')  fetchRestaurants(user._id || user.id);
    if (user.role === 'admin') fetchAdminData();
  }, [user, fetchRestaurants, fetchAdminData]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    setLoginLoad(true);
    try {
      const res = await axios.post(`${API_URL}/login`, loginForm);
      if (res.data.success) {
        setUser(res.data.user);
        setLoginForm({ username: '', password: '' });
      }
    } catch (err) {
      setLoginErr(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally { setLoginLoad(false); }
  };

  const handleLogout = () => {
    setUser(null);
    setRestaurants([]);
    setAdminUsers([]);
    setShowForm(false);
    setResForm(EMPTY_FORM);
  };

  // ── GPS ────────────────────────────────────────────────────────────────────
  const handleGPS = () => {
    if (!navigator.geolocation) return showToast('เบราว์เซอร์ไม่รองรับ GPS', 'error');
    setGpsLoad(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setResForm(f => ({
          ...f,
          latitude:  pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
        setGpsLoad(false);
        showToast('ดึงพิกัด GPS สำเร็จ 📍', 'success');
      },
      () => { setGpsLoad(false); showToast('ไม่สามารถดึงพิกัดได้', 'error'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Save Restaurant ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resForm.name.trim() || !resForm.locationName.trim() || !resForm.recommendedMenu.trim()) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error'); return;
    }
    setSaveLoad(true);
    try {
      const lat = resForm.latitude  === '' ? null : parseFloat(resForm.latitude);
      const lng = resForm.longitude === '' ? null : parseFloat(resForm.longitude);

      const payload = {
        userId:          user._id || user.id,
        name:            resForm.name.trim(),
        recommendedMenu: resForm.recommendedMenu.trim(),
        zone:            resForm.zone,
        locationName:    `[${resForm.zone}] ${resForm.locationName.trim()}`,
        latitude:        isNaN(lat) ? null : lat,
        longitude:       isNaN(lng) ? null : lng,
        rating:          resForm.rating
      };

      if (isEditing && resForm.id) {
        await axios.put(`${API_URL}/restaurants/${resForm.id}`, payload);
        showToast('แก้ไขข้อมูลสำเร็จแล้ว ✓');
        setIsEditing(false);
      } else {
        await axios.post(`${API_URL}/restaurants`, payload);
        showToast('บันทึกร้านใหม่สำเร็จแล้ว ✓');
      }
      setResForm(EMPTY_FORM);
      setShowForm(false);
      fetchRestaurants(user._id || user.id);
    } catch (err) {
      showToast(err.response?.data?.details || 'บันทึกไม่สำเร็จ', 'error');
    } finally { setSaveLoad(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/restaurants/${id}`);
      setDeleteId(null);
      fetchRestaurants(user._id || user.id);
      showToast('ลบข้อมูลสำเร็จแล้ว');
    } catch { showToast('ลบข้อมูลไม่สำเร็จ', 'error'); }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const startEdit = (res) => {
    let zone = ZONES[0], locName = res.locationName || '';
    const m = locName.match(/^\[(.*?)\]\s*/);
    if (m) { zone = m[1]; locName = locName.replace(/^\[(.*?)\]\s*/, ''); }
    setResForm({
      id: res._id || res.id, name: res.name || '',
      recommendedMenu: res.recommendedMenu || '',
      zone, locationName: locName,
      latitude:  res.latitude  != null ? String(res.latitude)  : '',
      longitude: res.longitude != null ? String(res.longitude) : '',
      rating: res.rating || 5
    });
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setResForm(EMPTY_FORM);
    setShowForm(false);
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = restaurants.filter(r => {
    const q = searchQ.toLowerCase();
    const matchSearch = r.name?.toLowerCase().includes(q) || r.locationName?.toLowerCase().includes(q) || r.recommendedMenu?.toLowerCase().includes(q);
    const matchZone = !filterZone || r.locationName?.includes(`[${filterZone}]`);
    return matchSearch && matchZone;
  });

  const filteredAdminUsers = adminUsers.filter(u =>
    u.username?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: LOGIN
  // ════════════════════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <>
        <style>{globalCSS}</style>
        <div style={{
          minHeight: '100vh', background: theme.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(255,107,53,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(245,200,66,0.04) 0%, transparent 50%)'
        }}>
          <div className="fade-in" style={{ width: '100%', maxWidth: '380px' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '18px',
                background: `linear-gradient(135deg, ${theme.accent}, #ff9a6c)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', margin: '0 auto 16px',
                boxShadow: `0 8px 32px ${theme.accentGlow}`
              }}>🍜</div>
              <h1 style={{ fontFamily: 'DM Mono', fontSize: '24px', fontWeight: '500', letterSpacing: '4px', color: theme.text }}>YUMMY LOG</h1>
              <p style={{ color: theme.textMuted, fontSize: '11px', marginTop: '6px', letterSpacing: '2px', fontFamily: 'DM Mono' }}>PERSONAL FOOD JOURNAL</p>
            </div>

            {/* Form */}
            <div className="card" style={{ padding: '28px' }}>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, letterSpacing: '1px', display: 'block', marginBottom: '7px', fontFamily: 'DM Mono' }}>USERNAME</label>
                  <input
                    type="text" placeholder="ชื่อผู้ใช้ (พิมพ์ admin เพื่อเข้าจัดการ)"
                    value={loginForm.username}
                    onChange={e => { setLoginErr(''); setLoginForm(f => ({...f, username: e.target.value})); }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, letterSpacing: '1px', display: 'block', marginBottom: '7px', fontFamily: 'DM Mono' }}>PASSWORD</label>
                  <input
                    type="password" placeholder="รหัสผ่าน"
                    value={loginForm.password}
                    onChange={e => { setLoginErr(''); setLoginForm(f => ({...f, password: e.target.value})); }}
                    required
                  />
                </div>
                {loginErr && (
                  <div style={{ background: theme.dangerSoft, border: `1px solid rgba(255,68,68,0.2)`, borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: theme.danger }}>
                    {loginErr}
                  </div>
                )}
                <button type="submit" className="btn-primary" disabled={loginLoad} style={{ marginTop: '4px' }}>
                  {loginLoad ? 'กำลังเข้าสู่ระบบ...' : 'SIGN IN →'}
                </button>
              </form>
              <p style={{ textAlign: 'center', fontSize: '11px', color: theme.textMuted, marginTop: '16px', lineHeight: 1.6, fontFamily: 'DM Mono' }}>
                ยังไม่มีบัญชี? ระบบจะสร้างให้อัตโนมัติ<br/>เมื่อ Login ครั้งแรก
              </p>
            </div>
          </div>
        </div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: ADMIN DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════
  if (user.role === 'admin') {
    return (
      <>
        <style>{globalCSS}</style>
        <div style={{ minHeight: '100vh', background: theme.bg }}>
          {/* Header */}
          <header style={{
            background: theme.bgCard, borderBottom: `1px solid ${theme.border}`,
            padding: '0 20px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 100
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>🛡️</span>
              <span style={{ fontFamily: 'DM Mono', fontSize: '13px', letterSpacing: '2px', color: theme.text }}>ADMIN PANEL</span>
              <span className="tag tag-accent" style={{ fontSize: '10px', padding: '2px 8px' }}>DASHBOARD</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: theme.textMuted, fontFamily: 'DM Mono' }}>{user.username}</span>
              <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '11px' }} onClick={handleLogout}>LOGOUT</button>
            </div>
          </header>

          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Stats */}
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              {[
                { label: 'TOTAL MEMBERS', value: stats.totalUsers, unit: 'บัญชี', icon: '👤', color: theme.accent },
                { label: 'TOTAL RESTAURANTS', value: stats.totalRestaurants, unit: 'ร้าน', icon: '🍽️', color: theme.gold }
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: '20px', borderLeft: `3px solid ${s.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '2px', fontFamily: 'DM Mono', marginBottom: '8px' }}>{s.label}</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: s.color, fontFamily: 'DM Mono', lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: '12px', color: theme.textSub, marginTop: '4px' }}>{s.unit}</div>
                    </div>
                    <span style={{ fontSize: '28px', opacity: 0.3 }}>{s.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* User List */}
            <div className="card fade-in" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '13px', letterSpacing: '2px', fontFamily: 'DM Mono', color: theme.textSub }}>
                  MEMBER LIST <span style={{ color: theme.textMuted }}>({filteredAdminUsers.length})</span>
                </h3>
                <input
                  type="text" placeholder="🔍 ค้นหาชื่อบัญชี..."
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                  style={{ width: 'auto', minWidth: '200px', padding: '8px 12px', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                {filteredAdminUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted, fontSize: '13px' }}>ไม่พบข้อมูล</div>
                ) : filteredAdminUsers.map((u, i) => (
                  <div key={u._id} style={{
                    background: theme.bgInput, borderRadius: '10px', padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                    border: `1px solid ${theme.border}`,
                    animation: `fadeIn 0.2s ease ${i * 0.03}s both`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                        background: u.role === 'admin' ? `linear-gradient(135deg, ${theme.accent}, #ff9a6c)` : theme.bgCard,
                        border: `1px solid ${u.role === 'admin' ? theme.accent : theme.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                      }}>
                        {u.role === 'admin' ? '🛡️' : '👤'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', fontFamily: 'DM Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</div>
                        <div style={{ fontSize: '10px', color: theme.textMuted, fontFamily: 'DM Mono', marginTop: '2px' }}>{String(u._id).slice(-8)}</div>
                      </div>
                    </div>
                    <span className={`tag ${u.role === 'admin' ? 'tag-accent' : ''}`} style={{ flexShrink: 0, fontSize: '10px' }}>
                      {u.role?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: USER DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: '100vh', background: theme.bg }}>

        {/* Header */}
        <header style={{
          background: theme.bgCard, borderBottom: `1px solid ${theme.border}`,
          padding: '0 16px', height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🍜</span>
            <span style={{ fontFamily: 'DM Mono', fontSize: '13px', letterSpacing: '2px', color: theme.text }}>
              {user.username.toUpperCase()}
            </span>
            <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: theme.textMuted }}>'S LOG</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '8px 16px', fontSize: '12px', fontFamily: 'DM Mono' }}
              onClick={() => { setShowForm(s => !s); if (isEditing) cancelEdit(); }}
            >
              {showForm && !isEditing ? '✕ ปิด' : '+ เพิ่มร้าน'}
            </button>
            <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '11px' }} onClick={handleLogout}>LOGOUT</button>
          </div>
        </header>

        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Add / Edit Form */}
          {(showForm || isEditing) && (
            <div className="card slide-down" style={{ padding: '20px' }}>
              <h4 style={{ fontFamily: 'DM Mono', fontSize: '12px', letterSpacing: '2px', color: isEditing ? theme.accent : theme.textSub, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEditing ? '✏ EDIT RESTAURANT' : '✦ NEW ENTRY'}
              </h4>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text" placeholder="ชื่อร้านอาหาร *"
                  value={resForm.name}
                  onChange={e => setResForm(f => ({...f, name: e.target.value}))}
                  required
                />
                <input
                  type="text" placeholder="เมนูแนะนำ Signature *"
                  value={resForm.recommendedMenu}
                  onChange={e => setResForm(f => ({...f, recommendedMenu: e.target.value}))}
                  required
                />

                {/* Zone */}
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, letterSpacing: '1px', display: 'block', marginBottom: '6px', fontFamily: 'DM Mono' }}>📍 โซน / ย่านที่ตั้ง</label>
                  <select value={resForm.zone} onChange={e => setResForm(f => ({...f, zone: e.target.value}))}>
                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>

                <input
                  type="text" placeholder="ทำเลละเอียด เช่น ทองหล่อ ซ.5 *"
                  value={resForm.locationName}
                  onChange={e => setResForm(f => ({...f, locationName: e.target.value}))}
                  required
                />

                {/* GPS */}
                <div style={{ background: theme.bgInput, borderRadius: '10px', padding: '12px', border: `1px dashed ${theme.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: theme.textSub, fontFamily: 'DM Mono', letterSpacing: '1px' }}>🌐 GPS COORDINATES</span>
                    <button type="button" className="btn-edit" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={handleGPS} disabled={gpsLoad}>
                      {gpsLoad ? '...' : '📍 Auto GPS'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Latitude" value={resForm.latitude} onChange={e => setResForm(f => ({...f, latitude: e.target.value}))} style={{ fontSize: '12px' }} />
                    <input type="text" placeholder="Longitude" value={resForm.longitude} onChange={e => setResForm(f => ({...f, longitude: e.target.value}))} style={{ fontSize: '12px' }} />
                  </div>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: theme.textMuted, fontFamily: 'DM Mono', letterSpacing: '1px' }}>RATING</span>
                  <StarPicker value={resForm.rating} onChange={v => setResForm(f => ({...f, rating: v}))} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button type="submit" className="btn-primary" disabled={saveLoad} style={{ flex: 2 }}>
                    {saveLoad ? 'กำลังบันทึก...' : isEditing ? 'SAVE CHANGES' : 'SAVE ENTRY →'}
                  </button>
                  {isEditing && (
                    <button type="button" className="btn-ghost" onClick={cancelEdit} style={{ flex: 1 }}>CANCEL</button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Search & Filter */}
          <div className="card" style={{ padding: '14px' }}>
            <input
              type="text" placeholder="🔍 ค้นหาชื่อร้าน, เมนู, หรือทำเล..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <select value={filterZone} onChange={e => setFilterZone(e.target.value)}>
              <option value="">🗺️ แสดงทุกโซน</option>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          {/* List Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: theme.textMuted, letterSpacing: '2px' }}>
              ENTRIES <span style={{ color: theme.accent }}>{filtered.length}</span>
              {filtered.length !== restaurants.length && <span> / {restaurants.length}</span>}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '11px', color: theme.textMuted, fontFamily: 'DM Mono' }}>LIVE</span>
            </div>
          </div>

          {/* Restaurant Cards */}
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>🍽️</div>
              <div style={{ color: theme.textMuted, fontSize: '13px' }}>
                {restaurants.length === 0 ? 'เริ่มบันทึกร้านโปรดของคุณ!' : 'ไม่พบร้านที่ค้นหา'}
              </div>
            </div>
          ) : filtered.map((res, i) => (
            <div key={res._id} className="card fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.name}</h4>
                    <div style={{ fontSize: '12px', color: theme.textMuted }}>
                      <span style={{ color: theme.accent }}>✦</span> {res.recommendedMenu}
                    </div>
                  </div>
                  <Stars value={res.rating} />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  <span className="tag">{res.locationName}</span>
                  {(res.latitude != null || res.longitude != null) && (
                    <span className="tag" style={{ fontSize: '10px', fontFamily: 'DM Mono', color: '#5B9EFF', borderColor: 'rgba(91,158,255,0.25)', background: 'rgba(91,158,255,0.08)' }}>
                      GPS {res.latitude?.toFixed(4)}, {res.longitude?.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>

              <div className="divider" />

              <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn-edit" onClick={() => startEdit(res)}>EDIT</button>
                {deleteId === (res._id) ? (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: theme.textMuted }}>ยืนยัน?</span>
                    <button className="btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleDelete(res._id)}>ลบ</button>
                    <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => setDeleteId(null)}>ยกเลิก</button>
                  </div>
                ) : (
                  <button className="btn-danger" onClick={() => setDeleteId(res._id)}>DELETE</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
}