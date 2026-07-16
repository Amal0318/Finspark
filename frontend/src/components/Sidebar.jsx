import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-night-black z-40 flex flex-col border-r border-outline-variant overflow-y-auto sidebar-scroll">
      <div className="p-xl">
        <h1 className="font-headline-md text-headline-md font-bold text-white tracking-tight">CyberSense.AI</h1>
        <p className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase tracking-widest mt-xs">Tier 3 SOC</p>
      </div>
      
      <nav className="flex-1 px-md space-y-1">
        <NavLink to="/" end className={({ isActive }) => `relative flex items-center gap-3 px-4 py-3 font-medium transition-colors group ${isActive ? 'text-white bg-white/5' : 'text-on-secondary-fixed-variant hover:text-white hover:bg-white/5'}`}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-full bg-madrid-gold"></div>}
              <span className={`material-symbols-outlined ${isActive ? 'text-madrid-gold' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
              <span className="font-body-md text-body-md">Dashboard</span>
            </>
          )}
        </NavLink>

        <NavLink to="/threat-intel" className={({ isActive }) => `relative flex items-center gap-3 px-4 py-3 font-medium transition-colors group ${isActive ? 'text-white bg-white/5' : 'text-on-secondary-fixed-variant hover:text-white hover:bg-white/5'}`}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-full bg-madrid-gold"></div>}
              <span className={`material-symbols-outlined ${isActive ? 'text-madrid-gold' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>security</span>
              <span className="font-body-md text-body-md">Threat Intelligence</span>
            </>
          )}
        </NavLink>

        <NavLink to="/incidents" className={({ isActive }) => `relative flex items-center gap-3 px-4 py-3 font-medium transition-colors group ${isActive ? 'text-white bg-white/5' : 'text-on-secondary-fixed-variant hover:text-white hover:bg-white/5'}`}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-full bg-madrid-gold"></div>}
              <span className={`material-symbols-outlined ${isActive ? 'text-madrid-gold' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>hub</span>
              <span className="font-body-md text-body-md">Incident Correlation</span>
            </>
          )}
        </NavLink>

        <NavLink to="/fraud" className={({ isActive }) => `relative flex items-center gap-3 px-4 py-3 font-medium transition-colors group ${isActive ? 'text-white bg-white/5' : 'text-on-secondary-fixed-variant hover:text-white hover:bg-white/5'}`}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-full bg-madrid-gold"></div>}
              <span className={`material-symbols-outlined ${isActive ? 'text-madrid-gold' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>payments</span>
              <span className="font-body-md text-body-md">Fraud Analytics</span>
            </>
          )}
        </NavLink>

        <NavLink to="/behaviour" className={({ isActive }) => `relative flex items-center gap-3 px-4 py-3 font-medium transition-colors group ${isActive ? 'text-white bg-white/5' : 'text-on-secondary-fixed-variant hover:text-white hover:bg-white/5'}`}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-full bg-madrid-gold"></div>}
              <span className={`material-symbols-outlined ${isActive ? 'text-madrid-gold' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>psychology</span>
              <span className="font-body-md text-body-md">User Behaviour</span>
            </>
          )}
        </NavLink>

        <NavLink to="/quantum" className={({ isActive }) => `relative flex items-center gap-3 px-4 py-3 font-medium transition-colors group ${isActive ? 'text-white bg-white/5' : 'text-on-secondary-fixed-variant hover:text-white hover:bg-white/5'}`}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-full bg-madrid-gold"></div>}
              <span className={`material-symbols-outlined ${isActive ? 'text-madrid-gold' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>visibility</span>
              <span className="font-body-md text-body-md">Quantum Readiness</span>
            </>
          )}
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `relative flex items-center gap-3 px-4 py-3 font-medium transition-colors group ${isActive ? 'text-white bg-white/5' : 'text-on-secondary-fixed-variant hover:text-white hover:bg-white/5'}`}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-full bg-madrid-gold"></div>}
              <span className={`material-symbols-outlined ${isActive ? 'text-madrid-gold' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>analytics</span>
              <span className="font-body-md text-body-md">Reports</span>
            </>
          )}
        </NavLink>
      </nav>

      <div className="p-xl border-t border-white/10 mt-auto">
        <div className="flex items-center gap-3 mb-xl">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-primary flex items-center justify-center text-white">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-label-md text-label-md text-white">{user?.full_name || 'Unknown User'}</p>
            <p className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase">{user?.role || 'Viewer'}</p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3 text-on-secondary-fixed-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Settings</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
