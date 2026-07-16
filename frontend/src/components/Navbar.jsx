import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldCheck, Database, RefreshCw, Cpu } from 'lucide-react';

const Navbar = ({ onRefresh, refreshing, notifications = [] }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10';
      case 'investigator':
        return 'border-sky-500/40 text-sky-400 bg-sky-500/10';
      default:
        return 'border-gray-800 text-gray-500 bg-gray-900/40';
    }
  };

  return (
    <header className="h-16 border-b border-gray-850 bg-[#090D16]/95 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0 select-none">
      {/* System Brand Header */}
      <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-400">
        <ShieldCheck className="h-4 w-4 text-purple-500" />
        <span className="tracking-widest uppercase">CyberSense Security Platform</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Manual Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
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
            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors relative"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 glass-panel border border-gray-850 rounded-xl shadow-2xl p-4 z-30 text-xs">
              <h4 className="font-bold text-white border-b border-gray-800 pb-2 mb-2 uppercase tracking-wider">
                System Indicators Feed
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 py-4 text-center">No active threat feeds logged</p>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className="p-2 bg-gray-900/80 rounded border border-gray-800/80 flex items-start space-x-2">
                      <span className="h-1.5 w-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0 animate-pulse"></span>
                      <div>
                        <p className="font-semibold text-gray-200">{n.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{n.desc}</p>
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
