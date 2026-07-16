import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldCheck, Database, RefreshCw, Cpu, Sun, Moon } from 'lucide-react';

const Navbar = ({ onRefresh, refreshing, notifications = [] }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'border-[#2563EB]/40 text-[#2563EB] bg-[#2563EB]/10 dark:border-[#6366F1]/40 dark:text-[#6366F1] dark:bg-[#6366F1]/10';
      case 'investigator':
        return 'border-[#06B6D4]/40 text-[#06B6D4] bg-[#06B6D4]/10 dark:border-[#38BDF8]/40 dark:text-[#38BDF8] dark:bg-[#38BDF8]/10';
      default:
        return 'border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/40';
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] flex items-center justify-between px-6 z-20 shrink-0 select-none">
      {/* System Brand Header */}
      <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-800 dark:text-[#CBD5E1]">
        <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
        <span className="tracking-widest uppercase font-bold">CyberSense Security Platform</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* Manual Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* User Role Badge */}
        <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-widest ${getRoleColor(user?.role)}`}>
          {user?.role || 'viewer'}
        </span>

        {/* Notifications Icon and dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 glass-panel border border-slate-200 dark:border-gray-850 rounded-xl shadow-large p-4 z-30 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-gray-800 pb-2 mb-2 uppercase tracking-wider">
                System Indicators Feed
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-slate-500 dark:text-gray-500 py-4 text-center">No active threat feeds logged</p>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 dark:bg-gray-900/80 rounded border border-slate-200 dark:border-gray-800/80 flex items-start space-x-2">
                      <span className="h-1.5 w-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0 animate-pulse"></span>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-gray-200">{n.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-0.5">{n.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
