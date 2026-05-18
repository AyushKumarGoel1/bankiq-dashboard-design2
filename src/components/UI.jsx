import { useTheme } from '../context/ThemeContext.jsx';
import { Sparkline } from '../charts/index.jsx';

export function KpiCard({ label, value, sub, color, trend, sparkData }) {
  const { theme } = useTheme();
  color = color || theme.accent;
  return (
    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.5px' }}>{value}</div>
      {sub && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
          {trend && <span style={{ color: trend === 'up' ? theme.green : theme.rose }}>{trend === 'up' ? '↑' : '↓'}</span>}
          <span style={{ color: theme.textMuted }}>{sub}</span>
        </div>
      )}
      {sparkData && <div style={{ marginTop: 4 }}><Sparkline data={sparkData} color={color} /></div>}
    </div>
  );
}

export function SectionHeader({ title, subtitle }) {
  const { theme } = useTheme();
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.text }}>{title}</h2>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: 12, color: theme.textMuted }}>{subtitle}</p>}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0F2F7', gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#0052CC,#6B44C8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 800 }}>A</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1A2340' }}>Agentic-Next</div>
      <div style={{ fontSize: 13, color: '#5A6A85' }}>Loading 8 banking datasets…</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#0052CC', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
    </div>
  );
}
