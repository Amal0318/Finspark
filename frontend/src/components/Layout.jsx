import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { alertAPI } from '../services/api';
import { ShieldAlert, X } from 'lucide-react';

const Layout = () => {
  const [tickerAlerts, setTickerAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRealTimeAlerts = async () => {
    setRefreshing(true);
    try {
      const alertsList = await alertAPI.list(0, 5);
      const openAlerts = alertsList
        .filter(a => a.status === 'OPEN')
        .map(a => ({
          title: `Threat Correlated (Risk: ${a.risk_score}%)`,
          desc: a.correlation_reason
        }));
      setTickerAlerts(openAlerts);
    } catch (err) {
      console.error('Error fetching alerts ticker:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealTimeAlerts();
    const tickerInt = setInterval(fetchRealTimeAlerts, 20000);
    return () => clearInterval(tickerInt);
  }, []);

  return (
    <div className="flex h-screen bg-white dark:bg-[#0B1220] text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      {/* Dynamic Sidebar */}
      <Sidebar />

      {/* Main Operations Block */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dynamic Navbar */}
        <Navbar 
          onRefresh={fetchRealTimeAlerts} 
          refreshing={refreshing} 
          notifications={tickerAlerts} 
        />

        {/* Real-time Incident Warning Ticker Banner */}
        {tickerAlerts.length > 0 && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2 flex items-center justify-between text-rose-750 dark:text-rose-400 text-xs animate-pulse-slow">
            <div className="flex items-center space-x-2 truncate">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-500" />
              <span className="font-bold font-mono text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded mr-2">WARN</span>
              <span className="truncate text-rose-700 dark:text-rose-350">{tickerAlerts[0].desc}</span>
            </div>
            <button 
              onClick={() => setTickerAlerts(tickerAlerts.slice(1))}
              className="text-rose-700 hover:text-rose-950 dark:text-gray-400 dark:hover:text-white ml-4 font-bold"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Page Content viewport */}
        <main className="flex-1 overflow-y-auto bg-[#F3F4F6] dark:bg-[#0B1220] p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
