import { useTheme } from '../context/ThemeContext.jsx';
import { useDraggable } from '../hooks/useDragToAI.jsx';
import { useDrillDown } from '../context/DrillDownContext.jsx';
import { useState } from 'react';

export function DraggableCard({ title, summary, data, drillData, questions, children, style }) {
  const { theme } = useTheme();
  const { dragProps, dragging } = useDraggable({ title, summary, data, questions });
  const { openDrillDown } = useDrillDown();
  const [hovered, setHovered] = useState(false);

  const handleClick = (e) => {
    // Only drill down if it's not a drag start/end
    const payload = drillData || (Array.isArray(data) ? data : null);
    if (payload && payload.length > 0) {
      openDrillDown(title, payload);
    }
  };

  return (
    <div
      {...dragProps}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', cursor: (drillData || Array.isArray(data)) ? 'pointer' : 'grab', transition: 'box-shadow 0.2s, opacity 0.2s',
        opacity: dragging ? 0.55 : 1,
        boxShadow: dragging ? `0 0 0 2px ${theme.accent}` : 'none',
        borderRadius: 12,
        ...style,
      }}
    >
      {hovered && (
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 10,
          background: theme.accent, color: '#fff', borderRadius: 6,
          padding: '3px 8px', fontSize: 11, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 4,
          pointerEvents: 'none', whiteSpace: 'nowrap',
          boxShadow: `0 2px 8px ${theme.accentGlow}`,
        }}>
          {(drillData || Array.isArray(data)) ? '🖱️ Drill | 🤖 AI' : '🤖 Drag to AI'}
        </div>
      )}
      {children}
    </div>
  );
}
