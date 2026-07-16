import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { mlAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const ThreatIntel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feeds');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('telemetry');
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Query incidents/threats
  const { data: threatData, isLoading, refetch } = useQuery({
    queryKey: ['threatIntel'],
    queryFn: () => mlAPI.getIncidents(),
    refetchInterval: 15000
  });

  const logs = threatData?.incidents || [];

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await mlAPI.uploadDataset(uploadFile);
      setUploadResult({
        success: true,
        message: result.message || 'File uploaded and parsed successfully.'
      });
      refetch();
    } catch (err) {
      setUploadResult({
        success: false,
        message: err.response?.data?.detail || 'Failed to process file. Ensure valid CSV headers.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getSeverityColor = (sev) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-error/10 text-error border-error/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'MEDIUM':
        return 'bg-primary-container text-on-primary-container border-primary/20';
      default:
        return 'bg-surface-container-high text-on-surface border-outline-variant';
    }
  };

  const threatVelocityData = Array.from({ length: 12 }).map((_, i) => ({
    time: `${(14 + Math.floor(i / 1.5))}:00`,
    count: Math.floor(Math.random() * 50) + 10
  }));

  return (
    <div className="space-y-xl max-w-[1600px]">
      {/* Page Header */}
      <header className="flex justify-between items-end">
        <div>
          <nav className="flex gap-2 text-label-sm text-on-surface-variant mb-2">
            <span className="hover:text-primary cursor-pointer transition-colors">CyberSense.AI</span>
            <span>/</span>
            <span className="text-on-surface">Threat Intelligence</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Active Threat Vector Matrix</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Real-time identification and mitigation of high-impact institutional attack surfaces.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab(activeTab === 'upload' ? 'feeds' : 'upload')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-label-md transition-all ${activeTab === 'upload' ? 'bg-primary text-white border-primary' : 'bg-white border-outline-variant text-on-surface hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{activeTab === 'upload' ? 'close' : 'upload_file'}</span>
            {activeTab === 'upload' ? 'Cancel Import' : 'CSV Import'}
          </button>
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-fixed-variant rounded-lg font-label-md hover:brightness-105 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">sync</span>
            Refresh
          </button>
        </div>
      </header>

      {/* Upload CSV Section (Conditional) */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div className="bg-white border border-outline-variant rounded-2xl p-lg custom-shadow">
            <h3 className="font-headline-sm text-headline-sm text-night-black mb-4">Ingest CSV Logs</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 leading-relaxed">
              Upload formatted CSV files containing historical records. Ingested transaction datasets will stream automatically through the ML prediction correlation networks.
            </p>
            {user?.role === 'viewer' ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <span className="material-symbols-outlined text-[32px] mb-2 text-red-500">lock</span>
                <h4 className="font-headline-sm text-headline-sm mb-1">Permission Denied</h4>
                <p className="font-body-sm text-body-sm">You do not have the required role (Admin/Investigator) to upload datasets.</p>
              </div>
            ) : (
            <form onSubmit={handleUpload} className="space-y-5">
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant">Dataset Target Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadType('telemetry')}
                    className={`p-3 rounded-lg border text-center font-label-md transition-all ${uploadType === 'telemetry' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    Cybersecurity Telemetry
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('transactions')}
                    className={`p-3 rounded-lg border text-center font-label-md transition-all ${uploadType === 'transactions' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    Banking Transactions
                  </button>
                </div>
              </div>

              {/* Upload Drop Zone Box */}
              <div className="border border-dashed border-outline-variant rounded-xl p-6 bg-surface-container-lowest flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  id="csv-file-upload"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
                <label htmlFor="csv-file-upload" className="cursor-pointer flex flex-col items-center">
                  <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-2">cloud_upload</span>
                  <span className="text-on-surface font-label-md">{uploadFile ? uploadFile.name : 'Select CSV file'}</span>
                  <span className="font-label-sm text-on-surface-variant mt-1">Accepts CSV tables (Max 10MB)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isUploading || !uploadFile}
                className="w-full bg-primary hover:bg-primary/90 text-white p-3 rounded-lg font-label-md shadow-sm disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  <span>Commit File Ingest</span>
                )}
              </button>
            </form>
            )}
          </div>

          <div className="flex flex-col justify-center">
            {uploadResult ? (
              <div className={`p-6 rounded-2xl border flex flex-col items-center text-center max-w-sm mx-auto shadow-sm ${uploadResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <span className={`material-symbols-outlined text-[48px] mb-3 ${uploadResult.success ? 'text-green-500' : 'text-red-500'}`}>
                  {uploadResult.success ? 'check_circle' : 'error'}
                </span>
                <h4 className="font-headline-sm text-headline-sm mb-2">{uploadResult.success ? 'Upload Success' : 'Parsing Failed'}</h4>
                <p className="font-body-sm text-body-sm leading-relaxed">{uploadResult.message}</p>
              </div>
            ) : (
              <div className="text-center font-body-sm text-on-surface-variant">
                Upload results will display here after processing compiles
              </div>
            )}
          </div>
        </div>
      )}

      {/* Threat Dashboard Bento */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Filter Actions */}
        <div className="col-span-12 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          <button className="px-5 py-2.5 bg-primary text-white rounded-full font-label-md flex items-center gap-2 whitespace-nowrap">
            All Feeds ({logs.length})
          </button>
          <button className="px-5 py-2.5 bg-white border border-outline-variant text-on-surface-variant rounded-full font-label-md flex items-center gap-2 whitespace-nowrap hover:border-primary transition-colors">
            <div className="w-2 h-2 rounded-full bg-error"></div>
            Critical Only
          </button>
          <button className="px-5 py-2.5 bg-white border border-outline-variant text-on-surface-variant rounded-full font-label-md flex items-center gap-2 whitespace-nowrap hover:border-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            AI Flagged
          </button>
          <div className="flex-1"></div>
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-lg border border-outline-variant">
              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></span>
              <span className="font-mono text-label-sm text-primary font-bold">SYNCING</span>
            </div>
          )}
        </div>

        {/* Main Table Container */}
        <div className="col-span-12 bg-white rounded-2xl border border-outline-variant custom-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
                  <th className="px-lg py-md font-label-sm text-on-surface-variant uppercase tracking-wider">Timestamp</th>
                  <th className="px-lg py-md font-label-sm text-on-surface-variant uppercase tracking-wider">Device ID</th>
                  <th className="px-lg py-md font-label-sm text-on-surface-variant uppercase tracking-wider">Source IP</th>
                  <th className="px-lg py-md font-label-sm text-on-surface-variant uppercase tracking-wider">Threat Type</th>
                  <th className="px-lg py-md font-label-sm text-on-surface-variant uppercase tracking-wider">Severity</th>
                  <th className="px-lg py-md font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Risk Score</th>
                  <th className="px-lg py-md font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Fraud Prob</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-lg py-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <span className="material-symbols-outlined text-[48px] text-surface-variant">security</span>
                        <h3 className="font-headline-sm">No Threats Detected</h3>
                        <p className="text-body-md">The AI surveillance network is currently reporting zero active threats.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-primary-container/5 transition-colors group cursor-pointer">
                      <td className="px-lg py-md font-body-sm text-on-surface whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-lg py-md font-mono text-body-sm text-on-surface font-semibold">
                        {log.transaction_id || log.incident_id || log.id}
                      </td>
                      <td className="px-lg py-md font-mono text-body-sm text-on-surface">
                        {log.source_ip || 'N/A'}
                      </td>
                      <td className="px-lg py-md font-body-sm text-on-surface">
                        {log.recommendation || log.alert_type || 'Suspicious Activity'}
                      </td>
                      <td className="px-lg py-md">
                        <span className={`px-2 py-1 rounded font-label-sm border ${getSeverityColor(log.severity)}`}>
                          {log.severity?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-lg py-md font-mono text-body-sm text-on-surface text-right">
                        {log.risk_score}%
                      </td>
                      <td className="px-lg py-md font-mono text-body-sm text-on-surface text-right">
                        {log.fraud_probability}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Table Footer */}
          <div className="px-lg py-md bg-surface-container-low flex justify-between items-center border-t border-outline-variant">
            <p className="text-label-sm text-on-surface-variant">Showing {logs.length > 0 ? 1 : 0} to {logs.length} of {logs.length} threats</p>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-label-md">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Supplementary Insights Cards */}
        <div className="col-span-12 lg:col-span-4 bg-white p-lg rounded-2xl border border-outline-variant custom-shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm">Origin Distribution</h3>
            <span className="material-symbols-outlined text-on-surface-variant">info</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-label-sm">
                <span className="text-on-surface">External Threat IPs</span>
                <span className="text-on-surface-variant">65%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-label-sm">
                <span className="text-on-surface">Internal Network Anomalies</span>
                <span className="text-on-surface-variant">25%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full opacity-80" style={{ width: "25%" }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-label-sm">
                <span className="text-on-surface">Unresolved Endpoints</span>
                <span className="text-on-surface-variant">10%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full opacity-60" style={{ width: "10%" }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-8 bg-white p-lg rounded-2xl border border-outline-variant custom-shadow relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm">Threat Velocity Index</h3>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">LIVE METRICS</span>
                <span className="text-label-sm text-on-surface-variant">Last 24h</span>
              </div>
            </div>
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={threatVelocityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECECEC" />
                  <XAxis dataKey="time" stroke="#A3A3A3" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#A3A3A3" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#FEBE10" radius={[4, 4, 0, 0]}>
                    {threatVelocityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={0.4 + (entry.count / 60) * 0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntel;
