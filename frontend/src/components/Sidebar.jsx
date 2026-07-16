import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  AlertOctagon, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  Settings, 
  Cpu
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'SOC Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Threat Intelligence', path: '/threat-intel', icon: Globe },
    { name: 'Incident Correlations', path: '/incidents', icon: AlertOctagon },
    { name: 'Fraud Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'User Behaviour Audit', path: '/user-behaviour', icon: Users },
    { name: 'Quantum Readiness', path: '/quantum', icon: Cpu },
    { name: 'SOC Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#070A14] border-r border-gray-800 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800 space-x-3">
        <ShieldCheck className="h-7 w-7 text-cyan-400" />
        <span className="font-extrabold text-lg tracking-wider text-white font-sans">
          SENTINEL<span className="text-purple-500">X</span> <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono">SOC</span>
        </span>
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 border-l-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/10 text-purple-400 border-purple-500 shadow-sm shadow-purple-950/20'
                    : 'text-gray-400 border-transparent hover:bg-gray-900/50 hover:text-gray-200'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Version badge */}
      <div className="p-4 border-t border-gray-800 text-[10px] text-gray-600 font-mono text-center">
        CYBERSENSE // SEC-OPS // 2026
      </div>
    </aside>
  );
};

export default Sidebar;
