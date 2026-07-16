import React from 'react';

const Navbar = ({ onRefresh, refreshing, notifications }) => {
  return (
    <header className="sticky top-0 z-30 flex justify-between items-center px-6 py-4 bg-surface-container-low border-b border-outline-variant backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-xl w-1/2">
        <div className="relative w-full max-w-md group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-madrid-gold transition-colors">search</span>
          <input className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-sm text-body-sm focus:ring-1 focus:ring-madrid-gold focus:border-madrid-gold outline-none transition-all" placeholder="Search incidents, entities or assets..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-lg">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="font-label-sm text-label-sm font-bold">System: Operational</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative material-symbols-outlined text-on-surface-variant hover:text-madrid-gold transition-colors">
            notifications
            {notifications && notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full animate-ping"></span>
            )}
          </button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-madrid-gold transition-colors" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? 'sync' : 'dns'}
          </button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-madrid-gold transition-colors">psychology</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
