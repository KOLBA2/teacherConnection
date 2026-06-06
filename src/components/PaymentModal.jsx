import React, { useState } from 'react';

export default function PaymentModal({ post, teacher, onConfirm, onClose, addToast }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [checkoutState, setCheckoutState] = useState('form'); // 'form' | 'processing' | 'success'

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length && i < 16; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const handleCardNumberChange = (e) => setCardNumber(formatCardNumber(e.target.value));

  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/[^0-9]/g, '');
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
    setExpiryDate(v.slice(0, 5));
  };

  const handleCvvChange = (e) => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 3));

  const getCardBrand = () => {
    const d = cardNumber.trim()[0];
    if (d === '4') return 'VISA';
    if (d === '5') return 'MASTERCARD';
    return 'GENERIC';
  };

  const brand = getCardBrand();

  const CARD_STYLES = {
    VISA: {
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      accent: '#60a5fa',
      accentSoft: 'rgba(96,165,250,0.18)',
      brandEl: (
        <span style={{ fontFamily: 'serif', fontStyle: 'italic', fontWeight: 900, fontSize: 24, color: '#60a5fa', letterSpacing: 1 }}>
          VISA
        </span>
      ),
    },
    MASTERCARD: {
      bg: 'linear-gradient(135deg, #1a0808 0%, #3b0f0f 50%, #1a0808 100%)',
      accent: '#f87171',
      accentSoft: 'rgba(248,113,113,0.18)',
      brandEl: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#ef4444', opacity: 0.95 }} />
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#f97316', opacity: 0.95, marginLeft: -11 }} />
        </div>
      ),
    },
    GENERIC: {
      bg: 'linear-gradient(135deg, #0f0a1e 0%, #1a1040 50%, #0f0a1e 100%)',
      accent: '#818cf8',
      accentSoft: 'rgba(129,140,248,0.18)',
      brandEl: (
        <span style={{ fontSize: 11, color: '#818cf8', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
          Secure Pay
        </span>
      ),
    },
  };

  const cs = CARD_STYLES[brand];

  // Split card number into 4 display groups
  const displayGroups = () => {
    const raw = cardNumber.replace(/\s/g, '');
    return [0, 1, 2, 3].map(i => raw.substring(i * 4, i * 4 + 4) || '••••');
  };

  const focusStyle = {
    borderColor: cs.accent,
    boxShadow: `0 0 0 3px ${cs.accentSoft}`,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      addToast('გთხოვთ შეიყვანოთ 16-ნიშნა ბარათის ნომერი', 'error'); return;
    }
    if (!cardHolder.trim()) {
      addToast('გთხოვთ შეიყვანოთ ბარათის მფლობელის სახელი', 'error'); return;
    }
    if (expiryDate.length !== 5) {
      addToast('გთხოვთ შეიყვანოთ სწორი მოქმედების ვადა (MM/YY)', 'error'); return;
    }
    if (cvv.length !== 3) {
      addToast('გთხოვთ შეიყვანოთ 3-ნიშნა CVV კოდი', 'error'); return;
    }
    setCheckoutState('processing');
    setTimeout(() => { setCheckoutState('success'); onConfirm(); }, 1800);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop') && checkoutState !== 'processing') onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="glass-panel modal-box w-full max-w-[500px] rounded-[24px] relative border border-[#ffffff10] shadow-2xl flex flex-col text-center"
        style={{ padding: '2rem', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Ambient glows */}
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${cs.accentSoft} 0%, transparent 70%)` }} />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        {checkoutState !== 'processing' && (
          <button onClick={onClose}
            className="absolute top-4 right-4 bg-transparent border-none text-[#71717a] hover:text-white cursor-pointer text-lg p-1 transition-colors rounded-md z-10">
            <i className="fas fa-times" />
          </button>
        )}

        {/* ── FORM STATE ── */}
        {checkoutState === 'form' && (
          <>
            <h2 className="text-[18px] font-bold text-white mb-1 font-['Noto_Sans_Georgian']">
              სწავლის საფასურის გადახდა
            </h2>
            <p className="text-[#a1a1aa] text-[11px] mb-5 font-['Noto_Sans_Georgian']">
              კურსი: <span className="font-semibold" style={{ color: cs.accent }}>{post.title}</span> · {teacher.fullName}
            </p>

            {/* ── CREDIT CARD (single face, all info visible) ── */}
            <div
              className="w-full mb-6 rounded-2xl relative select-none overflow-hidden"
              style={{
                background: cs.bg,
                aspectRatio: '1.586',
                border: `1px solid ${cs.accent}28`,
                boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px ${cs.accent}14, inset 0 1px 0 rgba(255,255,255,0.07)`,
                fontFamily: "'Courier New', 'Lucida Console', monospace",
              }}
            >
              {/* Radial shimmer */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(ellipse at 15% 15%, ${cs.accentSoft} 0%, transparent 55%), radial-gradient(ellipse at 85% 85%, rgba(139,92,246,0.1) 0%, transparent 55%)`,
              }} />
              {/* Subtle scan lines */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px)',
              }} />

              {/* CARD CONTENT — full flex layout fills the aspect-ratio box */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.1rem 1.35rem 1.1rem 1.35rem',
              }}>

                {/* Row 1: Chip + Brand */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* EMV Chip */}
                  <div style={{
                    width: 46, height: 34, borderRadius: 7,
                    background: 'linear-gradient(145deg, #c9932c 0%, #f5d87a 40%, #b07a20 100%)',
                    border: '1px solid rgba(0,0,0,0.3)',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.45), 0 2px 5px rgba(0,0,0,0.35)',
                    position: 'relative', overflow: 'hidden', flexShrink: 0,
                  }}>
                    <div style={{ position: 'absolute', top: '28%', left: 0, right: 0, height: 1, background: 'rgba(80,40,0,0.35)' }} />
                    <div style={{ position: 'absolute', top: '56%', left: 0, right: 0, height: 1, background: 'rgba(80,40,0,0.35)' }} />
                    <div style={{ position: 'absolute', left: '28%', top: 0, bottom: 0, width: 1, background: 'rgba(80,40,0,0.35)' }} />
                    <div style={{ position: 'absolute', left: '58%', top: 0, bottom: 0, width: 1, background: 'rgba(80,40,0,0.35)' }} />
                    <div style={{ position: 'absolute', inset: '22% 18%', borderRadius: 3, border: '1px solid rgba(80,40,0,0.2)' }} />
                  </div>
                  {/* Brand */}
                  <div>{cs.brandEl}</div>
                </div>

                {/* Row 2: Card Number */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center' }}>
                  {displayGroups().map((group, i) => (
                    <span key={i} style={{
                      fontSize: 19,
                      fontWeight: 700,
                      letterSpacing: 2.5,
                      color: focusedField === 'number' ? cs.accent : '#fff',
                      opacity: cardNumber ? 1 : 0.35,
                      transition: 'color 0.25s, opacity 0.25s',
                      textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                    }}>
                      {group}
                    </span>
                  ))}
                </div>

                {/* Row 3: Holder / Expiry / CVV */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '0.5rem' }}>

                  {/* Cardholder */}
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontFamily: 'inherit' }}>
                      Card Holder
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                      color: focusedField === 'holder' ? cs.accent : '#fff',
                      opacity: cardHolder ? 1 : 0.35,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      transition: 'color 0.25s',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                    }}>
                      {cardHolder || 'FULL NAME'}
                    </div>
                  </div>

                  {/* Expiry */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontFamily: 'inherit' }}>
                      Expires
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 700, letterSpacing: 2.5,
                      color: focusedField === 'expiry' ? cs.accent : '#fff',
                      opacity: expiryDate ? 1 : 0.35,
                      transition: 'color 0.25s',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                    }}>
                      {expiryDate || 'MM/YY'}
                    </div>
                  </div>

                  {/* CVV */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontFamily: 'inherit' }}>
                      CVV
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 700, letterSpacing: 3,
                      color: focusedField === 'cvv' ? cs.accent : '#fff',
                      opacity: cvv ? 1 : 0.35,
                      background: focusedField === 'cvv' ? cs.accentSoft : 'transparent',
                      padding: '2px 8px', borderRadius: 5,
                      transition: 'color 0.25s, background 0.25s',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                    }}>
                      {cvv ? '•'.repeat(cvv.length) : '•••'}
                    </div>
                  </div>

                </div>
              </div>

              {/* Contactless icon */}
              <div style={{
                position: 'absolute', bottom: '1.1rem', right: '1.35rem',
                color: 'rgba(255,255,255,0.12)', fontSize: 20, pointerEvents: 'none',
                transform: 'rotate(90deg)',
              }}>
                <i className="fas fa-wifi" />
              </div>
            </div>
            {/* ── END CARD ── */}

            {/* ── INPUT FORM ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 font-['Noto_Sans_Georgian'] text-left">

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717a' }}>
                  ბარათის მფლობელი
                </label>
                <input
                  type="text" placeholder="JOHN DOE" value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  onFocus={() => setFocusedField('holder')} onBlur={() => setFocusedField(null)}
                  className="tc-input" style={focusedField === 'holder' ? focusStyle : {}} required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717a' }}>
                  ბარათის ნომერი
                </label>
                <input
                  type="text" placeholder="0000  0000  0000  0000" value={cardNumber}
                  onChange={handleCardNumberChange} maxLength={19}
                  onFocus={() => setFocusedField('number')} onBlur={() => setFocusedField(null)}
                  className="tc-input" style={{ ...(focusedField === 'number' ? focusStyle : {}), fontFamily: "'Courier New', monospace", letterSpacing: 3 }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717a' }}>
                    ვადა
                  </label>
                  <input
                    type="text" placeholder="MM/YY" value={expiryDate}
                    onChange={handleExpiryChange} maxLength={5}
                    onFocus={() => setFocusedField('expiry')} onBlur={() => setFocusedField(null)}
                    className="tc-input text-center" style={{ ...(focusedField === 'expiry' ? focusStyle : {}), fontFamily: "'Courier New', monospace", letterSpacing: 3 }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#71717a' }}>
                    CVV
                  </label>
                  <input
                    type="password" placeholder="•••" value={cvv}
                    onChange={handleCvvChange} maxLength={3}
                    onFocus={() => setFocusedField('cvv')} onBlur={() => setFocusedField(null)}
                    className="tc-input text-center" style={{ ...(focusedField === 'cvv' ? focusStyle : {}), fontFamily: "'Courier New', monospace", letterSpacing: 4 }}
                    required
                  />
                </div>
              </div>

              {/* Price */}
              <div className="rounded-xl border border-[#ffffff08] px-4 py-3 flex justify-between items-center"
                style={{ background: 'rgba(0,0,0,0.28)' }}>
                <span className="text-[12px] text-[#71717a]">საფასური:</span>
                <span className="text-base font-extrabold text-white">
                  150 ₾ <span className="text-xs text-[#71717a] font-normal">/ თვეში</span>
                </span>
              </div>

              <button
                type="submit"
                className="btn-brand py-3.5 text-sm font-bold mt-1 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${cs.accent}bb, ${cs.accent})`, border: 'none', boxShadow: `0 4px 20px ${cs.accentSoft}` }}
              >
                <i className="fas fa-lock mr-2 text-xs" />
                გადახდა · 150 ₾
              </button>
            </form>
          </>
        )}

        {/* ── PROCESSING ── */}
        {checkoutState === 'processing' && (
          <div className="py-16 flex flex-col items-center justify-center font-['Noto_Sans_Georgian']">
            <div className="w-12 h-12 rounded-full border-[3px] border-indigo-500/20 border-t-indigo-500 animate-spin mb-6" />
            <h3 className="text-base font-bold text-white mb-2">მიმდინარეობს ტრანზაქცია...</h3>
            <p className="text-xs text-[#71717a]">გთხოვთ არ დახუროთ გვერდი</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {checkoutState === 'success' && (
          <div className="py-8 flex flex-col items-center justify-center font-['Noto_Sans_Georgian']">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-3xl mb-6"
              style={{ boxShadow: '0 0 28px rgba(16,185,129,0.18)' }}>
              <i className="fas fa-check-circle" />
            </div>
            <h3 className="text-[18px] font-extrabold text-white mb-2">გადახდა წარმატებულია!</h3>
            <p className="text-xs text-[#a1a1aa] px-4 leading-relaxed mb-6">
              თქვენ წარმატებით დარეგისტრირდით კურსზე:<br />
              <span className="font-semibold text-emerald-400">{post.title}</span>.<br />
              სწავლის საფასური (150 ₾) გადახდილია. მასწავლებელი მალე დაგიკავშირდებათ!
            </p>
            <button onClick={onClose}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none rounded-xl py-3 cursor-pointer transition-colors text-sm font-['Noto_Sans_Georgian'] shadow-lg">
              დახურვა
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
