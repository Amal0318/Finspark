import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { alertAPI } from '../services/api';

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
    <div className="bg-background text-on-surface font-sans min-h-screen flex">
      {/* Dynamic Sidebar */}
      <Sidebar />

      {/* Main Operations Block */}
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen w-[calc(100%-280px)]">
        {/* Dynamic Navbar */}
        <Navbar 
          onRefresh={fetchRealTimeAlerts} 
          refreshing={refreshing} 
          notifications={tickerAlerts} 
        />

        {/* Real-time Incident Warning Ticker Banner */}
        {tickerAlerts.length > 0 && (
          <div className="bg-error-container border-b border-error/20 px-6 py-2 flex items-center justify-between text-on-error-container text-xs animate-pulse-slow">
            <div className="flex items-center space-x-2 truncate">
              <span className="material-symbols-outlined text-error text-sm">warning</span>
              <span className="font-bold font-mono text-[10px] bg-error/20 px-1.5 py-0.5 rounded mr-2">WARN</span>
              <span className="truncate font-body-sm text-body-sm">{tickerAlerts[0].desc}</span>
            </div>
            <button 
              onClick={() => setTickerAlerts(tickerAlerts.slice(1))}
              className="text-on-error-container/70 hover:text-on-error-container ml-4 font-bold"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Page Content viewport */}
        <main className="flex-1 p-xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
