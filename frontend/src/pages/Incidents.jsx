import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mlAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, 
  Clock, 
  Sparkles, 
  X, 
  Cpu, 
  CheckCircle, 
  Zap, 
  ShieldAlert, 
  Activity, 
  Terminal 
} from 'lucide-react';

const Incidents = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  // AI report modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch incidents list from postgresql via React Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mlIncidents'],
    queryFn: mlAPI.getIncidents,
    refetchInterval: 12000
  });

  const incidents = data?.incidents || [];

  // Mutation to dynamically trigger threat report explanations (Gemini API)
  const reportMutation = useMutation({
    mutationFn: mlAPI.generateReport,
    onSuccess: (data) => {
      setAiReport(data);
      setAiLoading(false);
    },
    onError: (err) => {
      console.error(err);
      setAiLoading(false);
    }
  });

  const handleFetchAiExplanation = (incident) => {
    setAiLoading(true);
    setAiReport(null);
    setShowAiModal(true);

    const amount = incident.details?.transaction_amount || 0.0;
    const details = incident.details || {};

    reportMutation.mutate({
      risk_score: incident.details?.risk_score || 70.0,
      fraud_probability: incident.details?.fraud_probability || 50.0,
      behaviour_score: incident.details?.anomaly_score || 50.0,
      cyber_threat_score: incident.details?.cyber_threat_score || 50.0,
      transaction_details: {
        amount: amount,
        transaction_deviation: details.transaction_deviation || 0.0
      },
      login_details: {
        device: details.device || "Workstation PC",
        failed_login_count: details.failed_login_count || 0,
        vpn_detected: details.vpn_detected || 0,
        network_attack_detected: details.network_attack_detected || 0,
        is_new_device: details.is_new_device || 0
      }
    });
  };

  const getSeverityBadgeColor = (severity) => {
    switch (String(severity).toUpperCase()) {
      case 'CRITICAL':
        return 'text-rose-500 dark:text-rose-450 bg-rose-500/10 border-rose-500/30';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-xs text-slate-900 dark:text-white p-6">
      
      {/* Left Column: Incidents List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">Security Alerts Queue</h2>
            <p className="text-[10px] text-slate-500 dark:text-gray-550 font-mono mt-0.5">Real-time list of potential threats</p>
          </div>
          <span className="bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 px-2 py-0.5 rounded font-mono font-bold">
            {incidents.length} Alert{incidents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
            {incidents.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-gray-500 py-8 glass-panel rounded-2xl">
                No active threats logged.
              </div>
            ) : (
              incidents.map((incident) => (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedIncident?.id === incident.id
                      ? 'ring-1 ring-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/50'
                      : 'glass-panel hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-[9px] text-slate-500 dark:text-gray-500">ALERT #{incident.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${getSeverityBadgeColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-gray-250 leading-snug line-clamp-2">{incident.title}</p>
                  <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 dark:text-gray-500">
                    <span>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                    <span className="font-bold font-mono text-[#2563EB] dark:text-[#38BDF8]">Risk Score: {incident.details?.risk_score || 50}%</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Column: Incident Details */}
      <div className="lg:col-span-2">
        {selectedIncident ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-2xl p-6 shadow-xl space-y-6 min-h-[calc(100vh-12rem)]"
          >
            {/* Header info */}
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-200 dark:border-gray-800">
              <div>
                <span className="font-mono text-[9px] text-slate-500 dark:text-gray-500 uppercase tracking-widest">Selected Alert Summary</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">{selectedIncident.title}</h3>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 font-mono">Timestamp: {new Date(selectedIncident.timestamp).toLocaleString()}</p>
              </div>

              {/* simulated LLM trigger */}
              <button
                onClick={() => handleFetchAiExplanation(selectedIncident)}
                className="flex items-center space-x-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors shadow shadow-[#2563EB]/20"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-cyan-300 animate-pulse" />
                <span>Explain with AI (Gemini)</span>
              </button>
            </div>

            {/* Inbound parameters details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-[#0c1222] border border-slate-200 dark:border-gray-850/30 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-650 dark:text-gray-400 uppercase tracking-wider text-[9px] border-b border-slate-200 dark:border-gray-800 pb-1 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[#2563EB]" />
                  Transaction Information
                </h4>
                <div className="space-y-2 leading-relaxed text-slate-700 dark:text-gray-300">
                  <p><span className="text-slate-500 dark:text-gray-500">Transaction ID:</span> <span className="font-mono text-slate-800 dark:text-gray-200">TX_{selectedIncident.id}</span></p>
                  <p><span className="text-slate-500 dark:text-gray-500">Transaction Amount:</span> <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">${selectedIncident.details?.transaction_amount?.toFixed(2) || '0.00'} USD</span></p>
                  <p><span className="text-slate-500 dark:text-gray-500">Transaction Deviation:</span> <span className="font-mono text-amber-600 dark:text-amber-400">${selectedIncident.details?.transaction_deviation?.toFixed(2) || '0.00'}</span></p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#0c1222] border border-slate-200 dark:border-gray-850/30 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-650 dark:text-gray-400 uppercase tracking-wider text-[9px] border-b border-slate-200 dark:border-gray-800 pb-1 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-455" />
                  Security Logs
                </h4>
                <div className="space-y-2 leading-relaxed text-slate-700 dark:text-gray-300">
                  <p><span className="text-slate-500 dark:text-gray-500">Endpoint PC/Device:</span> <span className="text-slate-800 dark:text-gray-300">{selectedIncident.details?.device || 'UNKNOWN'}</span></p>
                  <p><span className="text-slate-500 dark:text-gray-500">Login Status:</span> <span className="font-mono text-slate-800 dark:text-gray-300">Success: {selectedIncident.details?.login_success === 1 ? 'YES' : 'NO'}</span></p>
                  <p><span className="text-slate-500 dark:text-gray-500">Failed Login Attempts:</span> <span className="font-mono text-rose-650 dark:text-rose-400 font-semibold">{selectedIncident.details?.failed_logins || 0} attempts</span></p>
                  <p><span className="text-slate-500 dark:text-gray-500">Malicious Activity:</span> <span className="font-semibold text-rose-650 dark:text-rose-400 font-mono">{selectedIncident.details?.network_attack === 1 ? 'SUSPICIOUS DETECTED' : 'NORMAL'}</span></p>
                </div>
              </div>
            </div>

            {/* Description narrative from raw DB alerts */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 dark:text-white uppercase tracking-wider text-[9px]">System Log Message</h4>
              <div className="bg-slate-50 dark:bg-[#0c1222] border border-slate-200 dark:border-gray-850/30 p-4 rounded-xl leading-relaxed text-slate-700 dark:text-gray-400">
                {selectedIncident.description || "No detailed log message available."}
              </div>
            </div>

          </motion.div>
        ) : (
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[calc(100vh-12rem)] text-gray-500">
            <AlertOctagon className="h-12 w-12 text-gray-700 mb-2" />
            <p>Select a correlated threat alert from the list to assess risk factors</p>
          </div>
        )}
      </div>

      {/* Gemini AI Summary Explainer Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0f1424] border border-slate-200 dark:border-gray-880 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setShowAiModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-gray-850 pb-3 mb-6">
                <Cpu className="h-5 w-5 text-[#2563EB] animate-pulse" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Safety Report</h3>
              </div>

              {aiLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 space-y-4">
                  <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></span>
                  <span className="font-mono text-[9px] tracking-widest animate-pulse text-slate-500 dark:text-gray-500">AI IS ANALYZING THE ALERT. PLEASE WAIT...</span>
                </div>
              ) : (
                <div className="space-y-6 text-xs text-slate-700 dark:text-gray-300 leading-relaxed">
                  
                  {/* Threat Title Summary */}
                  <div>
                    <h4 className="font-bold text-[#2563EB] dark:text-[#38BDF8] text-[12px] uppercase tracking-wider mb-1 font-mono">
                      {aiReport?.threat_summary}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-550 dark:text-gray-500 font-mono mt-1.5">
                      <span>Model Version: Gemini-1.5-Flash</span>
                      <span>•</span>
                      <span>Confidence score: <span className="text-emerald-650 dark:text-emerald-450 font-bold">{aiReport?.confidence}%</span></span>
                    </div>
                  </div>

                  {/* Narration and Explanation boxes */}
                  <div className="bg-slate-50 dark:bg-[#0c1222] border border-slate-200 dark:border-gray-850/30 rounded-xl p-4 space-y-4">
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-[9px] mb-1.5 flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-[#2563EB]" />
                        1. Detailed Incident Report
                      </h5>
                      <p className="text-slate-650 dark:text-gray-300 leading-relaxed">{aiReport?.incident_report}</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-[9px] mb-1.5 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-450 animate-pulse" />
                        2. Fraud Vector Explanation
                      </h5>
                      <p className="text-slate-600 dark:text-gray-400 leading-relaxed">{aiReport?.fraud_explanation}</p>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-[9px] mb-1.5 flex items-center gap-1.5">
                        <AlertOctagon className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                        3. Threat Root Cause Analysis
                      </h5>
                      <p className="text-slate-600 dark:text-gray-400 leading-relaxed font-mono text-[10px]">{aiReport?.root_cause}</p>
                    </div>
                  </div>

                  {/* Actions recommended */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-500" />
                      Recommended Mitigation Actions (SOC)
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {aiReport?.recommended_actions?.map((act, index) => (
                        <div 
                          key={index} 
                          className="bg-rose-500/5 border border-rose-500/20 px-3 py-2.5 rounded-lg text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold text-center uppercase tracking-wide flex items-center justify-center"
                        >
                          {act}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Incidents;
