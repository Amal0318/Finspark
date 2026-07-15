import React, { useState, useEffect } from 'react';
import { telemetryAPI } from '../services/api';
import { ShieldAlert, Plus, X, RefreshCw } from 'lucide-react';

const Telemetry = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    device_id: 'db-server-01',
    source_ip: '192.168.1.99',
    destination_ip: '10.0.0.4',
    event_type: 'login_failed',
    severity: 'HIGH',
    description: 'Failed root authentication check via ssh'
  });

  const fetchLogs = async () => {
    try {
      const data = await telemetryAPI.list(0, 100);
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await telemetryAPI.create(formData);
      setIsOpen(false);
      fetchLogs();
    } catch (err) {
      console.error('Error creating telemetry log:', err);
    }
  };

  const getSeverityClass = (sev) => {
    const s = sev.toUpperCase();
    if (s === 'CRITICAL') return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
    if (s === 'HIGH') return 'bg-rose-400/10 text-rose-300 border border-rose-400/20';
    if (s === 'MEDIUM') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Cybersecurity Telemetry Console</h2>
          <p className="text-xs text-gray-400 mt-0.5">Real-time audit log of system alerts, firewalls, and network events</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-md shadow-cyan-950"
          >
            <Plus className="h-4 w-4" />
            <span>Simulate Security Event</span>
          </button>
        </div>
      </div>

      <div className="bg-[#0F1424] border border-gray-800 rounded-xl p-5 shadow-lg">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070A13] text-gray-400 font-mono border-b border-gray-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Device ID</th>
                  <th className="p-3">Source IP</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No security telemetry logs available
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/10 transition-colors">
                      <td className="p-3 font-mono text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-gray-200">{log.device_id}</td>
                      <td className="p-3 font-mono text-cyan-400">{log.source_ip}</td>
                      <td className="p-3 font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                        {log.event_type}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${getSeverityClass(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400 max-w-xs truncate" title={log.description}>
                        {log.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simulation Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1424] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Simulate Threat Incident</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Device/Server ID</label>
                <input
                  type="text"
                  required
                  value={formData.device_id}
                  onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                  className="w-full bg-[#070A13] border border-gray-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Source IP</label>
                  <input
                    type="text"
                    required
                    value={formData.source_ip}
                    onChange={(e) => setFormData({...formData, source_ip: e.target.value})}
                    className="w-full bg-[#070A13] border border-gray-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Destination IP</label>
                  <input
                    type="text"
                    value={formData.destination_ip}
                    onChange={(e) => setFormData({...formData, destination_ip: e.target.value})}
                    className="w-full bg-[#070A13] border border-gray-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Event Category</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                    className="w-full bg-[#070A13] border border-gray-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="login_failed">Login Failed</option>
                    <option value="port_scan">Port Scan</option>
                    <option value="ddos_attack">DDoS Pattern</option>
                    <option value="ssh_bruteforce">SSH Bruteforce</option>
                    <option value="sql_injection">SQL Injection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Event Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    className="w-full bg-[#070A13] border border-gray-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Incident Detail</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[#070A13] border border-gray-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 rounded-lg font-bold hover:from-cyan-400 hover:to-blue-400 transition-colors shadow-lg shadow-cyan-950"
              >
                Inject Cybersecurity Incident Log
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Telemetry;
