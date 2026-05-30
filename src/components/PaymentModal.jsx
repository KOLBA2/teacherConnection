import React, { useState, useEffect } from 'react';

export default function PaymentModal({ post, teacher, onConfirm, onClose, addToast }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Checkout States: 'form' | 'processing' | 'success'
  const [checkoutState, setCheckoutState] = useState('form');

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e) => {
    let cleanVal = e.target.value.replace(/[^0-9]/g, '');
    if (cleanVal.length > 2) {
      cleanVal = cleanVal.slice(0, 2) + '/' + cleanVal.slice(2, 4);
    }
    setExpiryDate(cleanVal.slice(0, 5));
  };

  const handleCvvChange = (e) => {
    const cleanVal = e.target.value.replace(/[^0-9]/g, '');
    setCvv(cleanVal.slice(0, 3));
  };

  const getCardBrand = () => {
    const firstDigit = cardNumber.trim()[0];
    if (firstDigit === '4') return 'VISA';
    if (firstDigit === '5') return 'MASTERCARD';
    return 'GENERIC';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      addToast('გთხოვთ შეიყვანოთ 16-ნიშნა ბარათის ნომერი', 'error');
      return;
    }
    if (!cardHolder.trim()) {
      addToast('გთხოვთ შეიყვანოთ ბარათის მფლობელის სახელი', 'error');
      return;
    }
    if (expiryDate.length !== 5) {
      addToast('გთხოვთ შეიყვანოთ სწორი მოქმედების ვადა (MM/YY)', 'error');
      return;
    }
    if (cvv.length !== 3) {
      addToast('გთხოვთ შეიყვანოთ 3-ნიშნა CVV კოდი', 'error');
      return;
    }

    // Begin Simulated transaction
    setCheckoutState('processing');
    
    setTimeout(() => {
      setCheckoutState('success');
      onConfirm();
    }, 1800);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      if (checkoutState !== 'processing') {
        onClose();
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="glass-panel modal-box w-full max-w-[480px] rounded-[24px] p-8 relative border border-[#ffffff10] text-center shadow-2xl overflow-hidden flex flex-col">
        
        {/* Dynamic Glowing Mesh overlay */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        {checkoutState !== 'processing' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-transparent border-none text-[#71717a] hover:text-white cursor-pointer text-lg p-1 transition-colors rounded-md"
          >
            <i className="fas fa-times"></i>
          </button>
        )}

        {checkoutState === 'form' && (
          <>
            {/* Header */}
            <h2 className="text-[19px] font-bold text-white mb-1 font-['Noto_Sans_Georgian']">
              სწავლის საფასურის გადახდა
            </h2>
            <p className="text-[#a1a1aa] text-xs mb-5 font-['Noto_Sans_Georgian']">
              კურსი: <span className="font-semibold text-brand-glow">{post.title}</span> (მასწ. {teacher.fullName})
            </p>

            {/* Premium Visual Credit Card Widget */}
            <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-[#ffffff12] p-5 text-left relative flex flex-col justify-between mb-6 shadow-xl overflow-hidden font-mono tracking-widest text-[#e4e4e7]">
              {/* Overlay Hologram Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="flex justify-between items-center z-10">
                {/* Micro Chip Icon */}
                <div className="w-10 h-7 bg-gradient-to-r from-amber-400 to-amber-200 rounded-md shadow-inner relative flex flex-col justify-between p-1 opacity-80">
                  <div className="h-px bg-slate-800/40 w-full"></div>
                  <div className="h-px bg-slate-800/40 w-full"></div>
                  <div className="h-px bg-slate-800/40 w-full"></div>
                </div>

                {/* Card Brand */}
                <div className="text-[12px] font-bold tracking-wider text-right">
                  {getCardBrand() === 'VISA' && <span className="text-[#60a5fa] italic font-black text-sm">VISA</span>}
                  {getCardBrand() === 'MASTERCARD' && <span className="text-[#f43f5e] font-black text-sm">mastercard</span>}
                  {getCardBrand() === 'GENERIC' && <span className="text-[#a1a1aa] text-[9px] uppercase">Secure Pay</span>}
                </div>
              </div>

              {/* Card Number display */}
              <div className="text-[16px] sm:text-[18px] text-center font-bold tracking-widest z-10 my-3 min-h-[24px]">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>

              <div className="flex justify-between items-end z-10 text-[10px] tracking-wide text-[#a1a1aa]">
                <div>
                  <span className="block text-[8px] uppercase tracking-normal mb-0.5">Card Holder</span>
                  <span className="text-white font-bold uppercase block min-h-[14px]">
                    {cardHolder || 'FULL NAME'}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-normal mb-0.5">Expires</span>
                  <span className="text-white font-bold block min-h-[14px]">
                    {expiryDate || 'MM/YY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-['Noto_Sans_Georgian'] text-left">
              {/* Cardholder name */}
              <div>
                <label className="block text-[11px] text-[#71717a] mb-1 font-medium">ბარათის მფლობელი</label>
                <input
                  type="text"
                  placeholder="JOHN DOE"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="tc-input"
                  required
                />
              </div>

              {/* Card number */}
              <div>
                <label className="block text-[11px] text-[#71717a] mb-1 font-medium">ბარათის ნომერი</label>
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="tc-input"
                  required
                />
              </div>

              {/* Expiry and CVV Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#71717a] mb-1 font-medium">მოქმედების ვადა</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    className="tc-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#71717a] mb-1 font-medium">CVV კოდი</label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={handleCvvChange}
                    className="tc-input text-center"
                    required
                  />
                </div>
              </div>

              {/* Cost CTA */}
              <div className="bg-black/35 rounded-xl border border-[#ffffff06] p-3 flex justify-between items-center mt-2">
                <span className="text-[11px] text-[#71717a]">საფასური:</span>
                <span className="text-base font-bold text-white">150 ₾ <span className="text-xs text-[#a1a1aa] font-normal">/ თვეში</span></span>
              </div>

              <button type="submit" className="btn-brand mt-2 py-3 text-sm">
                <i className="fas fa-lock mr-2 text-xs opacity-85"></i>
                გადახდა (150 ₾)
              </button>
            </form>
          </>
        )}

        {/* PROCESSING SUBMISSION SPINNER */}
        {checkoutState === 'processing' && (
          <div className="py-16 flex flex-col items-center justify-center font-['Noto_Sans_Georgian']">
            {/* Spinning Circle */}
            <div className="w-12 h-12 rounded-full border-[3px] border-indigo-500/20 border-t-brand animate-spin mb-6"></div>
            <h3 className="text-base font-bold text-white mb-2">მიმდინარეობს ტრანზაქცია...</h3>
            <p className="text-xs text-[#71717a]">გთხოვთ არ დახუროთ გვერდი</p>
          </div>
        )}

        {/* TRANSACTION SUCCESS */}
        {checkoutState === 'success' && (
          <div className="py-8 flex flex-col items-center justify-center font-['Noto_Sans_Georgian']">
            {/* Animated Checkmark SVG */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-3xl mb-6 shadow-[0_0_24px_rgba(16,185,129,0.15)] animate-scale-in">
              <i className="fas fa-check-circle animate-pulse-slow"></i>
            </div>
            
            <h3 className="text-[18px] font-extrabold text-white mb-2">გადახდა წარმატებულია!</h3>
            <p className="text-xs text-[#a1a1aa] px-4 leading-relaxed mb-6">
              თქვენ წარმატებით დარეგისტრირდით კურსზე: <br />
              <span className="font-semibold text-emerald-400">{post.title}</span>. <br />
              სწავლის საფასური (150 ₾) გადახდილია. მასწავლებელი მალე დაგიკავშირდებათ!
            </p>

            <button
              onClick={onClose}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none rounded-xl py-2.5 px-8 cursor-pointer transition-colors text-xs font-['Noto_Sans_Georgian'] w-full shadow-lg"
            >
              დახურვა
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
