import { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useDrillDown } from '../context/DrillDownContext.jsx';

// CSV Export Helper
function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const csvContent = [
    keys.join(','),
    ...rows.map(row => keys.map(k => {
      let cell = row[k] === null || row[k] === undefined ? '' : row[k];
      cell = cell.toString().replace(/"/g, '""');
      if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
      return cell;
    }).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export function DrillDownModal() {
  const { theme } = useTheme();
  const { isOpen, title, data, closeDrillDown } = useDrillDown();

  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Reset state when data changes
  useMemo(() => {
    setSearch('');
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
  }, [data]);

  if (!isOpen) return null;

  // Auto-detect columns from the first object
  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

  // Filter, Sort, Paginate
  let filtered = data;
  if (search) {
    const s = search.toLowerCase();
    filtered = data.filter(row => 
      columns.some(c => String(row[c]).toLowerCase().includes(s))
    );
  }

  if (sortConfig.key) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  if (currentPage > totalPages) setCurrentPage(totalPages);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + rowsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const P = {
    bg: theme.bgCard, border: theme.border, text: theme.text,
    muted: theme.textMuted, accent: theme.accent, panel: theme.bgPanel,
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: P.bg, borderRadius: 16, width: '90%', maxWidth: 1200, height: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        border: `1px solid ${P.border}`
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: P.text, display:'flex', alignItems:'center', gap:10 }}>
              📊 {title} Drill-Down
            </div>
            <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>
              {data.length} total records • Real-time CSV data
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => exportToCsv(title.replace(/\s+/g, '_').toLowerCase(), data)}
              style={{ padding: '8px 16px', background: P.panel, border: `1px solid ${P.border}`, borderRadius: 8, color: P.text, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              📥 Export CSV
            </button>
            <button onClick={closeDrillDown}
              style={{ width: 34, height: 34, background: theme.rose+'15', border: 'none', borderRadius: 8, color: theme.rose, cursor: 'pointer', fontSize: 16, display:'flex', alignItems:'center', justifyContent:'center' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '16px 24px', background: P.panel, borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input 
            placeholder="Search records..." 
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: 300, padding: '8px 12px', borderRadius: 8, border: `1px solid ${P.border}`, background: P.bg, color: P.text, fontSize: 13, outline: 'none' }}
          />
          <div style={{ fontSize: 12, color: P.muted }}>
            Showing {startIdx + 1} - {Math.min(startIdx + rowsPerPage, filtered.length)} of {filtered.length} filtered records
          </div>
        </div>

        {/* Table Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 24px' }}>
          {columns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: P.muted }}>No data available.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, background: P.bg, zIndex: 10 }}>
                <tr>
                  {columns.map(col => (
                    <th key={col} onClick={() => handleSort(col)}
                      style={{ padding: '14px 16px', textAlign: 'left', borderBottom: `2px solid ${P.border}`, color: P.muted, fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {col} {sortConfig.key === col ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${P.border}`, ':hover': { background: P.panel } }}>
                    {columns.map(col => (
                      <td key={col} style={{ padding: '12px 16px', color: P.text, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} style={{ textAlign: 'center', padding: 40, color: P.muted }}>
                      No matches found for "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${P.border}`, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              style={{ padding: '6px 12px', background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, color: currentPage === 1 ? P.muted : P.text, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
              Previous
            </button>
            <span style={{ fontSize: 13, color: P.muted }}>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              style={{ padding: '6px 12px', background: P.panel, border: `1px solid ${P.border}`, borderRadius: 6, color: currentPage === totalPages ? P.muted : P.text, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
