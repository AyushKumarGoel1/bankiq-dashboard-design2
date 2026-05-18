import { createContext, useContext, useState, useCallback } from 'react';

export const ThemeContext = createContext(null);

export const lightTheme = {
  bg: '#F0F2F7', bgCard: '#FFFFFF', bgCardHover: '#F8F9FC', bgPanel: '#F5F7FA',
  accent: '#0052CC', accentGlow: 'rgba(0,82,204,0.10)', teal: '#0097A7',
  amber: '#E67E00', rose: '#D92D3E', purple: '#6B44C8', green: '#1A7D4A',
  border: '#DDE3EE', borderHover: 'rgba(0,82,204,0.35)',
  text: '#1A2340', textMuted: '#5A6A85', textDim: '#8FA3BF',
};
export const darkTheme = {
  bg: '#0A0E1A', bgCard: '#111827', bgCardHover: '#1A2236', bgPanel: '#0D1321',
  accent: '#4D9FFF', accentGlow: 'rgba(77,159,255,0.15)', teal: '#26C6DA',
  amber: '#FFB347', rose: '#FF6B7A', purple: '#A78BFA', green: '#4ADE80',
  border: '#1E293B', borderHover: 'rgba(77,159,255,0.4)',
  text: '#E8EEFF', textMuted: '#8FA3BF', textDim: '#4A6080',
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = useCallback(() => setIsDark(d => !d), []);
  const theme = isDark ? darkTheme : lightTheme;
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
