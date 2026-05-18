import { useTheme } from '../context/ThemeContext.jsx';

export function Sparkline({ data = [], color, height = 32, width = 80 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MiniDonut({ size = 56, segments = [] }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38, stroke = size * 0.14;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, sg) => s + sg.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      {segments.map((sg, i) => {
        const dash = (sg.value / total) * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={sg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset} transform={`rotate(-90 ${cx} ${cy})`} />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

export function MiniBar({ data = [], valueKey = 'count', labelKey = 'label', colors, height = 80 }) {
  const { theme } = useTheme();
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 9, color: colors?.[i] || theme.accent, fontWeight: 600 }}>{d[valueKey]}</span>
          <div style={{ width: '100%', height: (d[valueKey] / max) * (height - 16), background: colors?.[i] || theme.accent, borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
          <span style={{ fontSize: 8, color: theme.textDim, textAlign: 'center' }}>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}
