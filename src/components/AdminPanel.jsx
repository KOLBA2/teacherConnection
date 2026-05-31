import React, { useState, useEffect } from 'react';

const ADMIN_EMAIL = 'gkolbaia2008@gmail.com';

// Helper: parse the flat body text into a key-value map
function parseBody(body = '') {
  const result = {};
  body.split('\n').filter(Boolean).forEach((line) => {
    const idx = line.indexOf(': ');
    if (idx !== -1) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 2).trim();
      result[key] = val;
    }
  });
  return result;
}

const FIELD_LABELS = {
  'შეტყობინების ტიპი': { label: 'ტიპი', color: '#a1a1aa' },
  'კონტენტი': { label: 'კონტენტი', color: '#a1a1aa' },
  'მიზეზი': { label: 'მიზეზი', color: '#fca5a5', bold: true },
  'დამატებითი ინფო': { label: 'დეტალები', color: '#a1a1aa' },
  'მომხმარებელი': { label: 'მომხმარებელი', color: '#818cf8' },
  'თარიღი': { label: 'თარიღი', color: '#71717a' },
};

export default function AdminPanel({ currentUser, onClose, onDeleteItem }) {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const loadReports = () => {
    const stored = JSON.parse(localStorage.getItem('tc_reports') || '[]');
    setReports(stored.sort((a, b) => b.timestamp - a.timestamp));
  };

  useEffect(() => {
    loadReports();
    // Refresh every 3s while panel is open
    const interval = setInterval(loadReports, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem('tc_reports', JSON.stringify(updated));
    if (selected?.id === id) setSelected(null);
  };

  const handleClearAll = () => {
    if (!window.confirm('ყველა შეტყობინების წაშლა?')) return;
    setReports([]);
    localStorage.setItem('tc_reports', JSON.stringify([]));
    setSelected(null);
  };

  // ახალი ფუნქცია კონტენტის წასაშლელად
  const handleDeleteContent = (report) => {
    if (!window.confirm('დარწმუნებული ხართ, რომ გსურთ ამ კონტენტის (პოსტის/კომენტარის) სამუდამოდ წაშლა?')) return;
    
    // აქ უნდა გამოიძახოთ მთავარი კომპონენტიდან გადმოცემული წაშლის ლოგიკა
    if (onDeleteItem) {
      const parsed = parseBody(report.body);
      const type = parsed['შეტყობინების ტიპი']; // 'პოსტი' ან 'კომენტარი'
      onDeleteItem(type, report);
    } else {
      alert('გთხოვთ დაამატოთ onDeleteItem ლოგიკა მთავარ კომპონენტში.');
    }

    // კონტენტის წაშლის შემდეგ რეპორტიც უნდა წაიშალოს სიიდან
    handleDismiss(report.id);
  };

  if (!isAdmin) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl glass-panel rounded-2xl border border-[#ffffff10] shadow-2xl flex flex-col animate-scale-in"
        style={{ maxHeight: '88vh', fontFamily: "'Noto Sans Georgian', sans-serif" }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-[#ffffff08] shrink-0 rounded-t-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.14), rgba(99,102,241,0.06))' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
              <i className="fas fa-shield-alt text-red-400"></i>
            </div>
            <div>
              <h3 className="text-white font-bold text-[16px] m-0 leading-tight">ადმინ პანელი</h3>
              <p className="text-[11px] text-[#71717a] m-0 mt-0.5">
                შეტყობინებები
                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  reports.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {reports.length > 0 ? `${reports.length} ახალი` : 'ყველა განხილულია'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {reports.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] text-[#f87171] hover:text-red-300 bg-transparent border border-red-500/25 hover:border-red-500/50 px-3 py-1.5 rounded-lg cursor-pointer transition-all font-medium"
              >
                <i className="fas fa-trash-alt mr-1 text-[10px]"></i>ყველას წაშლა
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 border-none bg-transparent text-[#71717a] hover:text-white cursor-pointer transition-colors"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>

        {/* ── Body (split pane) ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left — Report List */}
          <div className="w-[44%] border-r border-[#ffffff08] overflow-y-auto shrink-0 flex flex-col">
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-12 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <i className="fas fa-check-double text-emerald-400 text-xl"></i>
                </div>
                <p className="text-[13px] text-[#71717a] m-0">შეტყობინება არ არის</p>
                <p className="text-[11px] text-[#3f3f46] m-0 mt-1">ყველაფერი წესრიგშია ✓</p>
              </div>
            ) : (
              reports.map((r) => {
                const isActive = selected?.id === r.id;
                const parsed = parseBody(r.body);
                const isPost = parsed['შეტყობინების ტიპი'] === 'პოსტი';
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="w-full text-left px-4 py-3.5 transition-all cursor-pointer bg-transparent border-none"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      borderLeft: `3px solid ${isActive ? '#f87171' : 'transparent'}`,
                      background: isActive ? 'rgba(239,68,68,0.07)' : 'transparent',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px]"
                        style={{
                          background: isPost ? 'rgba(249,115,22,0.12)' : 'rgba(168,85,247,0.12)',
                          color: isPost ? '#fb923c' : '#c084fc',
                        }}
                      >
                        <i className={`fas fa-${isPost ? 'file-alt' : 'comment-alt'}`}></i>
                      </span>
                      <div className="overflow-hidden flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-white m-0 truncate">
                          {isPost ? '📄 პოსტის შეტყობინება' : '💬 კომენტარის შეტყობინება'}
                        </p>
                        <p className="text-[11px] text-[#f87171] m-0 mt-0.5 truncate font-medium">
                          {parsed['მიზეზი'] || '—'}
                        </p>
                        <p className="text-[10px] text-[#3f3f46] m-0 mt-1">
                          {new Date(r.timestamp).toLocaleString('ka-GE')}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right — Detail Pane */}
          <div className="flex-1 overflow-y-auto min-w-0">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-[#27272a] flex items-center justify-center mb-3">
                  <i className="fas fa-hand-pointer text-[#3f3f46] text-lg"></i>
                </div>
                <p className="text-[13px] text-[#52525b] m-0">სიიდან შეტყობინება აირჩიეთ</p>
              </div>
            ) : (() => {
              const parsed = parseBody(selected.body);
              const isPost = parsed['შეტყობინების ტიპი'] === 'პოსტი';
              return (
                <div className="p-5 flex flex-col gap-4">
                  {/* Type + Time badge row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                      style={{
                        background: isPost ? 'rgba(249,115,22,0.12)' : 'rgba(168,85,247,0.12)',
                        color: isPost ? '#fb923c' : '#c084fc',
                      }}
                    >
                      {isPost ? '📄 პოსტი' : '💬 კომენტარი'}
                    </span>
                    <span className="text-[10px] text-[#52525b]">
                      {new Date(selected.timestamp).toLocaleString('ka-GE')}
                    </span>
                  </div>

                  {/* Report reason — highlighted */}
                  {parsed['მიზეზი'] && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <p className="text-[10px] uppercase tracking-widest text-red-400/70 font-semibold m-0 mb-1">მიზეზი</p>
                      <p className="text-[14px] text-red-300 font-bold m-0">{parsed['მიზეზი']}</p>
                    </div>
                  )}

                  {/* Content preview */}
                  {parsed['კონტენტი'] && (
                    <div className="bg-black/25 border border-[#ffffff08] rounded-xl px-4 py-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-semibold m-0 mb-1">კონტენტი</p>
                      <p className="text-[13px] text-[#a1a1aa] m-0 leading-relaxed">{parsed['კონტენტი']}</p>
                    </div>
                  )}

                  {/* Other fields */}
                  <div className="flex flex-col gap-2.5">
                    {parsed['დამატებითი ინფო'] && parsed['დამატებითი ინფო'] !== '—' && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-semibold m-0 mb-0.5">დამატებითი ინფო</p>
                        <p className="text-[13px] text-[#a1a1aa] m-0">{parsed['დამატებითი ინფო']}</p>
                      </div>
                    )}
                    {parsed['მომხმარებელი'] && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#52525b] font-semibold m-0 mb-0.5">შემატყობინებელი</p>
                        <p className="text-[13px] text-[#818cf8] font-semibold m-0">{parsed['მომხმარებელი']}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-1 flex gap-2 w-full">
                    <button
                      onClick={() => handleDismiss(selected.id)}
                      className="flex-1 py-2.5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/8 hover:bg-emerald-500/15 text-emerald-400 text-[13px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-check text-[11px]"></i> დატოვება
                    </button>
                    
                    <button
                      onClick={() => handleDeleteContent(selected)}
                      className="flex-1 py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/8 hover:bg-red-500/15 text-red-400 text-[13px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-trash text-[11px]"></i> წაშლა
                    </button>
                  </div>

                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}