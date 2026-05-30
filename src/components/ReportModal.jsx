import React, { useState } from 'react';

const REPORT_REASONS = [
  'სპამი ან შეცდომაში შემყვანი კონტენტი',
  'შეუფერებელი ან ვულგარული კონტენტი',
  'ძალადობა ან საშინელი შინაარსი',
  'თაღლითობა ან პოზა',
  'ავტორის საკუთრების დარღვევა',
  'სხვა მიზეზი',
];

export default function ReportModal({ type, targetId, targetText, reporterName, onClose, addToast }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReason) return;

    // Simulate sending email to admin gkolbaia2008@gmail.com
    // In production: replace with EmailJS / backend call
    const reportPayload = {
      to: 'gkolbaia2008@gmail.com',
      subject: `[TeacherConnect] ახალი შეტყობინება — ${type === 'post' ? 'პოსტი' : 'კომენტარი'}`,
      body: `
შეტყობინების ტიპი: ${type === 'post' ? 'პოსტი' : 'კომენტარი'}
ID: ${targetId}
კონტენტი: "${targetText?.slice(0, 200) || 'N/A'}"
მიზეზი: ${selectedReason}
დამატებითი ინფო: ${details || '—'}
მომხმარებელი: ${reporterName || 'Anonymous'}
თარიღი: ${new Date().toLocaleString('ka-GE')}
      `.trim(),
    };

    // Store report in localStorage for admin panel visibility
    const existingReports = JSON.parse(localStorage.getItem('tc_reports') || '[]');
    existingReports.push({
      id: Date.now().toString(),
      ...reportPayload,
      timestamp: Date.now(),
    });
    localStorage.setItem('tc_reports', JSON.stringify(existingReports));

    console.log('[Admin Notification Payload]', reportPayload);
    setSubmitted(true);
    addToast('შეტყობინება გაიგზავნა ადმინისტრატორთან ✓');
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md glass-panel rounded-2xl border border-[#ffffff10] shadow-2xl overflow-hidden animate-scale-in"
        style={{ fontFamily: "'Noto Sans Georgian', sans-serif" }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffffff08]"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.05))' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <i className="fas fa-flag text-red-400 text-sm"></i>
            </div>
            <div>
              <h3 className="text-white font-bold text-[15px] m-0 leading-tight">შეტყობინება</h3>
              <p className="text-[11px] text-[#71717a] m-0 mt-0.5">
                {type === 'post' ? 'პოსტის' : 'კომენტარის'} შეტყობინება
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 border-none bg-transparent text-[#71717a] hover:text-white cursor-pointer transition-colors"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <i className="fas fa-check-circle text-emerald-400 text-2xl"></i>
            </div>
            <h4 className="text-white font-bold text-[16px] mb-2">შეტყობინება გაიგზავნა!</h4>
            <p className="text-[#a1a1aa] text-[13px] mb-5 leading-relaxed">
              ადმინისტრაცია მიიღებს შეტყობინებას და განიხილავს{' '}
              <span className="text-[#818cf8]">gkolbaia2008@gmail.com</span>-ზე.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[13px] font-semibold border border-emerald-500/25 cursor-pointer transition-all"
            >
              დახურვა
            </button>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            {/* Preview of reported content */}
            {targetText && (
              <div className="bg-black/30 border border-[#ffffff08] rounded-xl px-4 py-3">
                <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-1">
                  {type === 'post' ? 'პოსტი' : 'კომენტარი'}
                </p>
                <p className="text-[13px] text-[#a1a1aa] m-0 leading-snug line-clamp-2">
                  {targetText.slice(0, 120)}{targetText.length > 120 ? '...' : ''}
                </p>
              </div>
            )}

            {/* Reason Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] text-[#71717a] font-semibold uppercase tracking-wider">
                მიზეზი *
              </label>
              <div className="flex flex-col gap-1.5">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all text-[13px] ${
                      selectedReason === reason
                        ? 'border-red-500/40 bg-red-500/10 text-red-300'
                        : 'border-[#ffffff08] bg-white/[0.02] text-[#a1a1aa] hover:bg-white/5 hover:border-[#ffffff15]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="hidden"
                    />
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        selectedReason === reason ? 'border-red-400 bg-red-500' : 'border-[#52525b]'
                      }`}
                    >
                      {selectedReason === reason && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
                      )}
                    </span>
                    {reason}
                  </label>
                ))}
              </div>
            </div>

            {/* Extra Details */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#71717a] font-semibold uppercase tracking-wider">
                დამატებითი ინფო <span className="normal-case text-[#52525b] font-normal">(სურვილისამებრ)</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="დამატებითი დეტალები..."
                rows={3}
                className="w-full bg-black/30 border border-[#27272a] rounded-xl px-3 py-2.5 text-[13px] text-[#e4e4e7] outline-none focus:border-red-500/40 transition-colors resize-none placeholder-[#52525b]"
                style={{ fontFamily: "'Noto Sans Georgian', sans-serif" }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#27272a] bg-transparent text-[#a1a1aa] hover:bg-white/5 hover:text-white text-[13px] font-semibold cursor-pointer transition-all"
              >
                გაუქმება
              </button>
              <button
                type="submit"
                disabled={!selectedReason}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer border-none transition-all flex items-center justify-center gap-2 ${
                  selectedReason
                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-md shadow-red-900/30'
                    : 'bg-[#27272a] text-[#52525b] cursor-not-allowed'
                }`}
              >
                <i className="fas fa-flag text-[11px]"></i>
                შეტყობინება
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
