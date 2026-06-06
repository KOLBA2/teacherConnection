import React from 'react';
import Dropdown from './Dropdown';

const CITIES = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "გორი", "ზუგდიდი", "ფოთი", "თელავი", "ახალციხე", "დისტანციური"];

export default function Header({ currentView, searchQuery, setSearchQuery, filterLocation, setFilterLocation, toggleSidebar, sidebarOpen }) {
  const getPageTitle = () => {
    switch (currentView) {
      case 'mine':
        return 'ჩემი პოსტები';
      case 'saved':
        return 'შენახული პოსტები';
      case 'stats':
        return 'სტატისტიკა';
      case 'subscribed':
        return 'ჩემი კურსები';
      case 'all':
      default:
        return 'მთავარი';
    }
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div id="mobile-topbar" className="glass-panel">
        <div className="mobile-logo font-['Noto_Sans_Georgian'] flex items-center gap-2">
          {/* აქ ვწერთ პირდაპირ მისამართს, რადგან ფაილი public საქაღალდეშია */}
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-8 h-8 object-contain shrink-0"
          />
          <span>Teacher Connect</span>
        </div>
        <button
          className={`burger ${sidebarOpen ? 'active' : ''}`}
          id="burger-btn"
          aria-label="მენიუ"
          onClick={toggleSidebar}
        >
          <div className="burger-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Sticky Main Header */}
      <header id="dashboard-header">
        <h2 id="page-title" className="font-bold text-white m-0 truncate text-[18px] md:text-[22px] font-['Noto_Sans_Georgian']">
          {getPageTitle()}
        </h2>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          <div className="search-wrap">
            <i className="fas fa-search"></i>
            <input
              type="text"
              id="global-search"
              placeholder="ძებნა..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dropdown
            options={CITIES}
            selected={filterLocation}
            onChange={setFilterLocation}
            placeholder="ყველა ქალაქი"
            icon="🌍"
          />
        </div>
      </header>
    </>
  );
}