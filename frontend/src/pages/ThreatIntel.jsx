import React, { useState, useEffect } from 'react';
import { telemetryAPI, mlAPI } from '../services/api';
import { Globe, ShieldAlert, UploadCloud, RefreshCw, Layers, CheckCircle } from 'lucide-react';

const ThreatIntel = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feeds');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('telemetry');
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchThreatData = async () => {
    setLoading(true);
    try {
      const data = await telemetryAPI.list(0, 50);
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatData();
  }, []);

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
      fetchThreatData();
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
        return 'text-rose-450 bg-rose-500/10 border-rose-500/30';
      case 'HIGH':
        return 'text-rose-400 bg-rose-500/5 border-rose-550/20';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Data Ingestion</h2>
          <p className="text-xs text-gray-400 mt-0.5">Review active connection logs and system telemetry</p>
        </div>
        <button
          onClick={fetchThreatData}
          className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('feeds')}
          className={`pb-3 transition-colors ${activeTab === 'feeds' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-200'}`}
        >
          System Logs
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 transition-colors ${activeTab === 'upload' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Upload Data
        </button>
      </div>

      {/* Content Viewports */}
      {activeTab === 'feeds' ? (
        <div className="glass-panel rounded-xl p-5 shadow-lg">
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1F2937] text-gray-400 font-mono border-b border-[#374151]">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Device Signature</th>
                    <th className="p-3">Threat Source IP</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-300">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">No active cyber threat logs</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-800/10 transition-colors">
                        <td className="p-3 font-mono text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-semibold">{log.device_id}</td>
                        <td className="p-3 font-mono text-cyan-400">{log.source_ip}</td>
                        <td className="p-3 font-mono text-[10px] text-gray-400 uppercase tracking-wider">{log.event_type}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded border font-bold text-[9px] uppercase ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400 truncate max-w-xs">{log.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* CSV Dataset Upload form Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel border border-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4">Ingest CSV Logs</h3>
            <p className="text-xs text-gray-450 mb-6 leading-relaxed">
              Upload formatted CSV files containing historical records. Uploaded transactions will be automatically analyzed by the ML threat prediction engine.
            </p>

            <form onSubmit={handleUpload} className="space-y-5 text-xs">
              <div className="space-y-1">
                <label className="block text-gray-400">Dataset Target Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadType('telemetry')}
                    className={`p-3 rounded-lg border text-center font-semibold transition-all ${uploadType === 'telemetry' ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB] dark:text-[#38BDF8]' : 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400'}`}
                  >
                    Cybersecurity Telemetry
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('transactions')}
                    className={`p-3 rounded-lg border text-center font-semibold transition-all ${uploadType === 'transactions' ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB] dark:text-[#38BDF8]' : 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400'}`}
                  >
                    Banking Transactions
                  </button>
                </div>
              </div>

              {/* Upload Drop Zone Box */}
              <div className="border border-dashed border-gray-300 dark:border-gray-800 rounded-xl p-6 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#2563EB] transition-colors">
                <input
                  type="file"
                  id="csv-file-upload"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
                <label htmlFor="csv-file-upload" className="cursor-pointer flex flex-col items-center">
                  <UploadCloud className="h-8 w-8 text-gray-500 mb-2" />
                  <span className="text-gray-300 font-semibold">{uploadFile ? uploadFile.name : 'Select CSV file'}</span>
                  <span className="text-[10px] text-gray-600 mt-1">Accepts CSV tables (Max 10MB)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isUploading || !uploadFile}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white p-3 rounded-lg font-bold shadow-lg shadow-blue-950/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  <span>Upload and Process File</span>
                )}
              </button>
            </form>
          </div>

          {/* Results feedback panels */}
          <div className="flex flex-col justify-center">
            {uploadResult ? (
              <div className={`p-6 rounded-xl border flex flex-col items-center text-center max-w-sm mx-auto shadow-lg ${uploadResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-550/20 text-rose-400'}`}>
                {uploadResult.success ? <CheckCircle className="h-10 w-10 text-emerald-500 mb-3" /> : <ShieldAlert className="h-10 w-10 text-rose-500 mb-3" />}
                <h4 className="font-bold text-white mb-2">{uploadResult.success ? 'Upload Success' : 'Parsing Failed'}</h4>
                <p className="text-xs leading-relaxed text-gray-300">{uploadResult.message}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 text-xs">
                Upload results will display here after processing is complete.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatIntel;
