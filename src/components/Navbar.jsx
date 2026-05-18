import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const USER = { name: 'Ayush Kumar', email: 'ayush@agentic-next.ai', role: 'Senior Analyst', initials: 'AK' };

export function ProfileDropdown() {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const items = [
    { icon: '👤', label: 'My Profile' }, { icon: '⚙️', label: 'Settings' },
    { icon: '🔔', label: 'Notifications' }, { icon: '❓', label: 'Help & Support' },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg,${theme.accent},${theme.purple})`, border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 13 }}>
        {USER.initials}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 42, right: 0, width: 220, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200 }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>{USER.name}</div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>{USER.email}</div>
            <div style={{ fontSize: 10, color: theme.accent, marginTop: 2 }}>{USER.role}</div>
          </div>
          {items.map(({ icon, label }) => (
            <button key={label} onClick={() => setOpen(false)}
              style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: theme.text, display: 'flex', gap: 10, alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = theme.bgPanel}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span>{icon}</span>{label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${theme.border}` }}>
            <button onClick={() => setOpen(false)}
              style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: theme.rose, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span>🔒</span>Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ onBack, subtitle }) {
  const { theme, isDark, toggleTheme } = useTheme();
  return (
    <div style={{ background: theme.bgCard, borderBottom: `1px solid ${theme.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, position: 'sticky', top: 0, zIndex: 100 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', marginRight: 12, fontSize: 20 }}>←</button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${theme.accent},${theme.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>A</div>
        <span style={{ fontWeight: 800, fontSize: 16, color: theme.accent, letterSpacing: '-0.3px' }}>Agentic-Next</span>
        {subtitle && <><span style={{ color: theme.border, margin: '0 6px' }}>|</span><span style={{ fontSize: 13, color: theme.textMuted }}>{subtitle}</span></>}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.green, boxShadow: `0 0 6px ${theme.green}` }} />
        <span style={{ fontSize: 11, color: theme.green, fontWeight: 600 }}>Live</span>
        <button onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}
          style={{ width: 34, height: 34, borderRadius: 8, background: theme.bgPanel, border: `1px solid ${theme.border}`, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isDark ? '☀️' : '🌙'}
        </button>
        <ProfileDropdown />
      </div>
    </div>
  );
}
