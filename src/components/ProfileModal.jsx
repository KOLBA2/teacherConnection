import React from 'react';

export default function ProfileModal({ currentUser, onUploadAvatar, onClose, addToast, onLogout }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadAvatar(event.target.result);
        addToast('პროფილის ფოტო განახლდა ✓');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="glass-panel modal-box w-full max-w-[420px] rounded-[20px] p-8 relative text-center border border-[#27272a]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent border-none text-[#71717a] hover:text-white cursor-pointer text-lg p-1 transition-colors rounded-md"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Profile Avatar with upload trigger */}
        <div className="relative inline-block mb-4 cursor-pointer group">
          <img
            src={currentUser.avatar}
            alt={currentUser.fullName}
            className="w-28 h-28 rounded-full object-cover border-3 border-[#6366f1] shadow-[0_0_24px_rgba(99,102,241,0.25)] transition-all duration-300"
          />
          <label
            htmlFor="profile-upload"
            className="absolute inset-0 bg-black/55 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-white text-[22px]"
          >
            <i className="fas fa-camera"></i>
          </label>
          <input
            type="file"
            id="profile-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <h2 className="text-[22px] font-bold text-white m-0 mb-2 font-['Noto_Sans_Georgian']">
          {currentUser.fullName}
        </h2>
        
        <span className="badge-brand font-semibold tracking-wider uppercase font-['Noto_Sans_Georgian'] text-[11px] px-3 py-1">
          {currentUser.role === 'teacher' ? 'მასწავლებელი' : 'მოსწავლე'}
        </span>

        {/* Profile Information List */}
        <div className="mt-6 flex flex-col gap-2.5 text-left font-['Noto_Sans_Georgian']">
          <div className="profile-field">
            <i className="fas fa-phone"></i>
            <span>{currentUser.phone}</span>
          </div>
          <div className="profile-field">
            <i className="fas fa-envelope"></i>
            <span>{currentUser.email}</span>
          </div>
          
          {/* Display Verified 11-digit Personal ID */}
          {currentUser.personalId && (
            <div className="profile-field border border-emerald-500/10 bg-emerald-500/5">
              <i className="fas fa-id-card text-emerald-400"></i>
              <span className="text-[#a1a1aa] flex-grow">პირადი ნომერი:</span>
              <span className="font-semibold text-emerald-400 font-mono tracking-wider">{currentUser.personalId}</span>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="mt-6 w-full py-2.5 rounded-xl border border-red-500/25 hover:border-red-500/50 bg-red-500/10 hover:bg-red-500/15 text-red-400 font-semibold cursor-pointer transition-all duration-200 text-sm font-['Noto_Sans_Georgian']"
        >
          <i className="fas fa-sign-out-alt mr-2"></i> სისტემიდან გასვლა
        </button>
      </div>
    </div>
  );
}
