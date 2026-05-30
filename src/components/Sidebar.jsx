import React, { useState, useEffect } from 'react';

const ADMIN_EMAIL = 'gkolbaia2008@gmail.com';

export default function Sidebar({
  currentUser,
  currentView,
  setFeedMode,
  openPostModal,
  onOpenProfile,
  onOpenAdmin,
  onLogout,
  closeSidebar,
  sidebarOpen,
}) {
  const [reportCount, setReportCount] = useState(0);
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  // Poll localStorage for new reports badge count
  useEffect(() => {
    if (!isAdmin) return;
    const refresh = () => {
      const stored = JSON.parse(localStorage.getItem('tc_reports') || '[]');
      setReportCount(stored.length);
    };
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div id="sidebar-overlay" className="show" onClick={closeSidebar}></div>
      )}

      <aside id="sidebar" className={`glass-panel border-right border-r border-[#ffffff10] ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo — clickable → goes home */}
        <button
          className="sidebar-logo w-full text-left bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity p-0"
          onClick={() => { setFeedMode('all'); closeSidebar(); }}
          title="მთავარ გვერდზე დაბრუნება"
        >
          <div className="sidebar-logo-icon">TC</div>
          <span className="font-bold text-[17px] text-white tracking-tight font-['Noto_Sans_Georgian']">Connect</span>
        </button>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          <button
            onClick={() => { setFeedMode('all'); closeSidebar(); }}
            className={`nav-btn ${currentView === 'all' ? 'nav-active' : ''}`}
          >
            <i className="fas fa-home"></i> მთავარი
          </button>

          {currentUser?.role === 'teacher' && (
            <>
              <button
                onClick={() => { openPostModal(); closeSidebar(); }}
                className="nav-btn"
              >
                <i className="fas fa-plus-circle text-[#4ade80]"></i> პოსტის დამატება
              </button>

              <button
                onClick={() => { setFeedMode('mine'); closeSidebar(); }}
                className={`nav-btn ${currentView === 'mine' ? 'nav-active' : ''}`}
              >
                <i className="fas fa-file-alt"></i> ჩემი პოსტები
              </button>

              <button
                onClick={() => { setFeedMode('stats'); closeSidebar(); }}
                className={`nav-btn ${currentView === 'stats' ? 'nav-active' : ''}`}
              >
                <i className="fas fa-chart-pie text-indigo-400"></i> სტატისტიკა
              </button>
            </>
          )}

          {currentUser?.role === 'student' && (
            <button
              onClick={() => { setFeedMode('subscribed'); closeSidebar(); }}
              className={`nav-btn ${currentView === 'subscribed' ? 'nav-active' : ''}`}
            >
              <i className="fas fa-graduation-cap text-[#4ade80]"></i> ჩემი კურსები
            </button>
          )}

          <button
            onClick={() => { setFeedMode('saved'); closeSidebar(); }}
            className={`nav-btn ${currentView === 'saved' ? 'nav-active' : ''}`}
          >
            <i className="fas fa-bookmark text-[#eab308]"></i> შენახული
          </button>

          <button
            onClick={() => { onOpenProfile(); closeSidebar(); }}
            className="nav-btn"
          >
            <i className="fas fa-user"></i> პროფილი
          </button>

          {/* Admin Reports Button — only visible for admin */}
          {isAdmin && (
            <button
              onClick={() => { onOpenAdmin(); closeSidebar(); }}
              className="nav-btn relative"
              style={{ color: reportCount > 0 ? '#f87171' : undefined }}
            >
              <i className="fas fa-shield-alt" style={{ color: reportCount > 0 ? '#f87171' : '#818cf8' }}></i>
              ადმინ პანელი
              {reportCount > 0 && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-md shadow-red-900/40 animate-pulse"
                >
                  {reportCount}
                </span>
              )}
            </button>
          )}

          <div className="flex-grow"></div>

          <button
            onClick={onLogout}
            className="nav-btn mt-2 text-[#71717a] hover:text-[#f87171] hover:bg-[rgba(239,68,68,0.08)] transition-all"
          >
            <i className="fas fa-sign-out-alt"></i> გასვლა
          </button>
        </nav>

        {/* Sidebar Footer — Clickable User Card → opens profile */}
        {currentUser && (
          <button
            className="sidebar-user w-full bg-transparent border-none cursor-pointer group"
            onClick={() => { onOpenProfile(); closeSidebar(); }}
            title="პროფილის გახსნა"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=6366f1&color=fff`}
                alt="User avatar"
                className="group-hover:ring-2 group-hover:ring-[#6366f1]/50 transition-all duration-200"
              />
              {isAdmin && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[8px] shadow-sm">
                  👑
                </span>
              )}
            </div>
            <div className="overflow-hidden flex-1 text-left">
              <p className="font-semibold text-[13px] truncate m-0 font-['Noto_Sans_Georgian'] transition-colors duration-200 group-hover:text-[#818cf8]"
                style={{ color: '#fff' }}>
                {currentUser.fullName}
              </p>
              <p className="text-[11px] uppercase tracking-wide mt-0.5 m-0 font-['Noto_Sans_Georgian']"
                style={{ color: isAdmin ? '#fbbf24' : '#52525b' }}>
                {isAdmin ? '👑 ადმინისტრატორი' : currentUser.role === 'teacher' ? 'მასწავლებელი' : 'მოსწავლე'}
              </p>
            </div>
            <i className="fas fa-chevron-right text-[10px] text-[#3f3f46] group-hover:text-[#818cf8] transition-colors duration-200 shrink-0 mr-1"></i>
          </button>
        )}
      </aside>
    </>
  );
}
