import { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useDragContext } from '../hooks/useDragToAI.jsx';

const CLAUDE_MODEL = 'claude-3-5-haiku-20241022'; // fast + affordable model
const LS_KEY = 'agenticnext_api_key';

function buildSystemPrompt(context, data) {
  return `You are the Agentic-Next AI Copilot, an expert banking analytics assistant.
You have access to real data from 8 CSV datasets: 200 customers, 1,000 loans, 500 transactions, 473 products, 300 CRM records.

Live metrics:
- Customers: ${data?.kpis?.totalCustomers ?? 200}
- Loan Book: ₹${data?.kpis?.totalLoanBook ?? 'N/A'}Cr
- Avg CIBIL: ${data?.kpis?.avgCreditScore ?? 'N/A'}
- Fraud Rate: ${data?.kpis?.fraudAlertPct ?? 'N/A'}%
- Avg CLV: ₹${data?.kpis?.avgCLV ?? 'N/A'}L
- Digital Adoption: ${data?.kpis?.digitalAdoptionPct ?? 'N/A'}%
- At-Risk Customers: ${data?.atRiskCount ?? 'N/A'}
- Revenue (Est.): ₹${data?.revenue?.totalRevenue ?? 'N/A'}Cr

Current page context: ${context}

Rules:
1. Only use the real metrics above — never invent numbers
2. Be concise, insightful, and actionable
3. When asked about dragged data, focus on that component's metrics`;
}

export default function AICopilot({ context = 'Dashboard', suggestedQuestions = [], data }) {
  const { theme } = useTheme();
  const { droppedPayload, clearDropped, commitDrop } = useDragContext();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropHighlight, setDropHighlight] = useState(false);
  const [activeSuggestions, setActiveSuggestions] = useState(suggestedQuestions);

  // API key state — persisted in localStorage
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_KEY) || '');
  const [keyInput, setKeyInput] = useState('');
  const [showKeySetup, setShowKeySetup] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update suggestions when prop changes (tab switch)
  useEffect(() => {
    setActiveSuggestions(suggestedQuestions);
  }, [context]);

  // Handle dropped payload
  useEffect(() => {
    if (!droppedPayload) return;
    const { title, summary, questions } = droppedPayload;
    const prompt = `I dragged the "${title}" component into you.\n\nData summary: ${summary}\n\nPlease analyze this and provide key insights.`;
    setOpen(true);
    if (questions?.length) setActiveSuggestions(questions);
    sendMessage(prompt);
    clearDropped();
  }, [droppedPayload]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    const key = localStorage.getItem(LS_KEY) || apiKey;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          context: context,
          kpis: data?.kpis || {},
          apiKey: key,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      
      const assistantMsg = { role: 'assistant', content: json.reply || 'No response.' };
      if (json.isSql && json.sqlData) {
        assistantMsg.sqlData = json.sqlData;
      }
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Backend Error: ${err.message}` }]);
    }
    setLoading(false);
  }, [input, messages, context, data, apiKey]);

  const saveKey = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    localStorage.setItem(LS_KEY, trimmed);
    setApiKey(trimmed);
    setKeyInput('');
    setShowKeySetup(false);
    setMessages(prev => [...prev, { role: 'assistant', content: '✅ API key saved! You can now ask me anything about your banking data.' }]);
  };

  const P = {
    bg: theme.bgCard, border: theme.border, text: theme.text,
    muted: theme.textMuted, accent: theme.accent, panel: theme.bgPanel,
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        onDragOver={(e) => { e.preventDefault(); setDropHighlight(true); }}
        onDragLeave={() => setDropHighlight(false)}
        onDrop={(e) => { e.preventDefault(); setDropHighlight(false); commitDrop(); setOpen(true); }}
        title="AI Copilot — drag any card here"
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 52, height: 52,
          borderRadius: '50%', border: 'none', cursor: 'pointer', zIndex: 150,
          background: dropHighlight ? theme.green : `linear-gradient(135deg,${theme.accent},${theme.purple})`,
          boxShadow: dropHighlight
            ? `0 0 0 4px ${theme.green}40, 0 4px 20px rgba(0,0,0,0.2)`
            : `0 4px 20px rgba(0,0,0,0.18)`,
          transition: 'all 0.2s', fontSize: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDropHighlight(true); }}
          onDragLeave={() => setDropHighlight(false)}
          onDrop={(e) => { e.preventDefault(); setDropHighlight(false); commitDrop(); }}
          style={{
            position: 'fixed', bottom: 88, right: 24, width: 370, height: 540,
            background: P.bg, border: `2px solid ${dropHighlight ? theme.green : P.border}`,
            borderRadius: 18, boxShadow: '0 16px 56px rgba(0,0,0,0.16)', zIndex: 150,
            display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'border-color 0.2s',
          }}>

          {/* Header */}
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${theme.accent},${theme.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: P.text }}>AI Copilot</div>
              <div style={{ fontSize: 10, color: P.muted }}>{context} · Drop any card to analyze</div>
            </div>
            {/* Key setup button */}
            <button
              onClick={() => setShowKeySetup(s => !s)}
              title={apiKey ? 'API key set ✓ (click to change)' : 'Set API key'}
              style={{ background: apiKey ? theme.green + '20' : theme.rose + '20', border: `1px solid ${apiKey ? theme.green : theme.rose}40`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>
              {apiKey ? '🔑✓' : '🔑'}
            </button>
            {dropHighlight && <span style={{ fontSize: 11, color: theme.green, fontWeight: 600 }}>Drop!</span>}
          </div>

          {/* Key Setup Panel */}
          {showKeySetup && (
            <div style={{ padding: 14, background: theme.bgPanel, borderBottom: `1px solid ${P.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: P.text, marginBottom: 8 }}>
                {apiKey ? '🔄 Update Anthropic API Key' : '🔑 Enter Anthropic API Key'}
              </div>
              <div style={{ fontSize: 11, color: P.muted, marginBottom: 10 }}>
                Get your key from <span style={{ color: theme.accent }}>console.anthropic.com</span>. Stored locally in your browser only.
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="password"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveKey()}
                  placeholder="sk-ant-..."
                  style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 12, outline: 'none' }}
                />
                <button onClick={saveKey}
                  style={{ padding: '7px 14px', borderRadius: 8, background: theme.accent, border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  Save
                </button>
              </div>
              {apiKey && (
                <button onClick={() => { localStorage.removeItem(LS_KEY); setApiKey(''); setShowKeySetup(false); }}
                  style={{ marginTop: 8, background: 'none', border: 'none', color: theme.rose, fontSize: 11, cursor: 'pointer', padding: 0 }}>
                  Remove saved key
                </button>
              )}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && !showKeySetup && (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
                <div style={{ fontSize: 12, color: P.muted, lineHeight: 1.6 }}>
                  {apiKey
                    ? 'Ask anything about your banking data, or drag any card here for instant analysis.'
                    : 'Click the 🔑 button above to add your Anthropic API key, then ask anything about your data.'}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '9px 12px',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.role === 'user' ? theme.accent : P.panel,
                  color: m.role === 'user' ? '#fff' : P.text,
                  fontSize: 12, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                  {m.sqlData && Array.isArray(m.sqlData) && (
                    <div style={{ marginTop: 8, background: P.bg, borderRadius: 8, border: `1px solid ${P.border}`, overflowX: 'auto', padding: 8 }}>
                      <div style={{ fontSize: 10, color: P.muted, marginBottom: 4, fontWeight: 600 }}>{m.sqlData.length} rows returned:</div>
                      {m.sqlData.length > 0 ? (
                        <table style={{ fontSize: 10, width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              {Object.keys(m.sqlData[0]).slice(0, 5).map(k => (
                                <th key={k} style={{ textAlign: 'left', padding: '4px 8px', borderBottom: `1px solid ${P.border}`, color: P.muted }}>{k}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {m.sqlData.slice(0, 10).map((row, idx) => (
                              <tr key={idx}>
                                {Object.keys(m.sqlData[0]).slice(0, 5).map(k => (
                                  <td key={k} style={{ padding: '4px 8px', borderBottom: `1px solid ${P.border}`, color: P.text, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {String(row[k])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : <div style={{ fontSize: 10, color: P.muted }}>Empty result</div>}
                      {m.sqlData.length > 10 && <div style={{ fontSize: 10, color: theme.accent, marginTop: 4 }}>+ {m.sqlData.length - 10} more rows</div>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 5, padding: '4px 8px', alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: theme.accent, animation: `bounce 1.2s ${i*0.2}s infinite ease-in-out` }} />
                ))}
                <span style={{ fontSize: 11, color: P.muted, marginLeft: 4 }}>Thinking…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {activeSuggestions.length > 0 && messages.length < 2 && !showKeySetup && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {activeSuggestions.slice(0, 3).map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  style={{ textAlign: 'left', background: P.panel, border: `1px solid ${P.border}`, borderRadius: 8, padding: '6px 10px', fontSize: 11, color: P.muted, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.accentGlow}
                  onMouseLeave={e => e.currentTarget.style.background = P.panel}>
                  💬 {q}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div style={{ padding: 12, borderTop: `1px solid ${P.border}`, display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={apiKey ? 'Ask about your data…' : 'Set API key first →'}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.panel, color: P.text, fontSize: 12, outline: 'none' }}
            />
            <button onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ padding: '8px 14px', borderRadius: 10, background: (!input.trim()||loading) ? P.border : theme.accent, border: 'none', color: '#fff', cursor: input.trim() && !loading ? 'pointer' : 'default', fontSize: 16, transition: 'background 0.2s' }}>
              ↑
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1.1)}}`}</style>
    </>
  );
}
