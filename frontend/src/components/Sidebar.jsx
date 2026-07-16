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
    <aside className="w-64 bg-[#0F172A] border-r border-[#374151] flex flex-col h-full shrink-0 select-none">
      <div className="h-20 flex flex-col justify-center px-5 border-b border-[#374151]">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-[#2563EB] shrink-0" />
          <span className="font-extrabold text-[15px] tracking-wide text-white font-sans flex items-center gap-1 whitespace-nowrap">
            CYBER<span className="text-[#06B6D4]">SENSE</span>
          </span>
        </div>
        <span className="text-[8.5px] text-[#94A3B8] tracking-wider uppercase mt-1 font-mono pl-7">
          Detect • Correlate • Protect
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
                `flex items-center space-x-3 px-4 py-3 rounded-[12px] text-xs font-semibold tracking-wide transition-all duration-150 ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-bold shadow-md shadow-black/20'
                    : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0 text-current" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Version badge */}
      <div className="p-4 border-t border-[#374151] text-[10px] text-[#64748B] font-mono text-center">
        CYBERSENSE // SEC-OPS // 2026
      </div>
    </aside>
  );
};

export default Sidebar;
