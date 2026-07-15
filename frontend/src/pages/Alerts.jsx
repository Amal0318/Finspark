import React, { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';
import AlertCenter from '../components/AlertCenter';
import { BellRing, ShieldCheck, AlertOctagon, HelpCircle } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await alertAPI.list(0, 100);
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolveAlert = async (id, status, notes) => {
    try {
      await alertAPI.update(id, { status, notes });
      fetchAlerts();
    } catch (err) {
      console.error('Error updating alert:', err);
    }
  };

  const getAlertCounts = () => {
    const total = alerts.length;
    const open = alerts.filter(a => a.status === 'OPEN').length;
    const investigating = alerts.filter(a => a.status === 'INVESTIGATING').length;
    const resolved = alerts.filter(a => a.status === 'RESOLVED').length;
    return { total, open, investigating, resolved };
  };

  const counts = getAlertCounts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Threat Correlation Alarms</h2>
        <p className="text-xs text-gray-400 mt-0.5">Real-time alerts correlating financial transfers with concurrent cyber activity</p>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick counts grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
            <div className="glass-panel border border-gray-800 rounded-xl p-4 shadow">
              <p className="text-gray-500 font-mono">Total Correlated Alerts</p>
              <p className="text-lg font-bold text-white mt-1">{counts.total}</p>
            </div>
            
            <div className="glass-panel border border-gray-800 rounded-xl p-4 shadow border-l-2 border-l-rose-500">
              <p className="text-gray-500 font-mono text-rose-400">Open Incidents</p>
              <p className="text-lg font-bold text-rose-400 mt-1">{counts.open}</p>
            </div>

            <div className="glass-panel border border-gray-800 rounded-xl p-4 shadow border-l-2 border-l-amber-500">
              <p className="text-gray-500 font-mono text-amber-400">Under Investigation</p>
              <p className="text-lg font-bold text-amber-400 mt-1">{counts.investigating}</p>
            </div>

            <div className="glass-panel border border-gray-800 rounded-xl p-4 shadow border-l-2 border-l-emerald-500">
              <p className="text-gray-500 font-mono text-emerald-400">Remediated & Closed</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">{counts.resolved}</p>
            </div>
          </div>

          <AlertCenter
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
          />
        </div>
      )}
    </div>
  );
};

export default Alerts;
