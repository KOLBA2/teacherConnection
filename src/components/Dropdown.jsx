import React, { useState, useEffect, useRef } from 'react';

export default function Dropdown({ options, selected, onChange, placeholder = 'აირჩიეთ', icon = '🌍' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative inline-block w-full sm:w-[200px] text-left font-['Noto_Sans_Georgian']">
      {/* Active Selection Input button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-dark-panel hover:bg-dark-panel/80 text-[#e4e4e7] border border-[#ffffff10] hover:border-brand/40 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 shadow-md"
      >
        <div className="flex items-center gap-2 truncate">
          <span>{icon}</span>
          <span className="truncate">{selected || placeholder}</span>
        </div>
        <i className={`fas fa-chevron-down text-[#71717a] text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand' : ''}`}></i>
      </button>

      {/* Popover Selection List */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 glass-panel border border-[#ffffff12] rounded-xl shadow-2xl overflow-hidden animate-scale-in max-h-60 flex flex-col">
          {/* Search Field */}
          <div className="p-2 border-b border-[#ffffff06] bg-black/20 relative shrink-0">
            <input
              type="text"
              placeholder="ძებნა..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-[#27272a] rounded-lg px-2.5 py-1 text-[11px] text-[#e4e4e7] outline-none focus:border-brand transition-colors font-['Noto_Sans_Georgian']"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#71717a] hover:text-white cursor-pointer text-[10px]"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Options Wrapper */}
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selected === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium cursor-pointer transition-all flex justify-between items-center ${
                      isSelected 
                        ? 'bg-brand/15 text-brand-glow' 
                        : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <i className="fas fa-check text-[10px]"></i>}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#52525b]">შედეგები არ არის</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
