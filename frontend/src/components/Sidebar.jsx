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
    { name: 'Security Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Data Feed Ingestion', path: '/threat-intel', icon: Globe },
    { name: 'Threat Alerts Queue', path: '/incidents', icon: AlertOctagon },
    { name: 'Predictive Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'User Access Auditing', path: '/user-behaviour', icon: Users },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#070A14] border-r border-gray-800 flex flex-col h-full shrink-0 select-none">
      <div className="h-16 flex items-center px-5 border-b border-gray-800 space-x-2">
        <ShieldCheck className="h-6 w-6 text-cyan-400 shrink-0" />
        <span className="font-extrabold text-[15px] tracking-wide text-white font-sans flex items-center gap-1.5 whitespace-nowrap">
          CYBER<span className="text-purple-500">SENSE</span> <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono font-bold leading-none">SOC</span>
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
                    ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500 shadow-sm shadow-indigo-950/10 font-bold'
                    : 'text-gray-400 border-transparent hover:bg-slate-900/50 hover:text-gray-200'
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
