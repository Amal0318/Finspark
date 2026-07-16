import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mlAPI } from '../services/api';

const Incidents = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch incidents list
  const { data, isLoading } = useQuery({
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
    setSelectedIncident(incident);
    setAiLoading(true);
    setAiReport(null);

    reportMutation.mutate({
      risk_score: incident.risk_score || 0.0,
      fraud_probability: incident.fraud_probability || 0.0,
      behaviour_score: incident.behaviour_score || 0.0,
      cyber_threat_score: incident.threat_score || 0.0,
      transaction_details: {
        amount: 0.0,
        transaction_id: incident.transaction_id || "UNKNOWN"
      },
      login_details: {
        source_ip: incident.source_ip || "UNKNOWN"
      }
    });
  };

  const getSeverityBadgeColor = (severity) => {
    switch (String(severity).toUpperCase()) {
      case 'CRITICAL':
        return 'text-error bg-error/10 border-error/20';
      case 'HIGH':
        return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM':
        return 'text-primary-container bg-primary-container/10 border-primary-container/20';
      default:
        return 'text-green-600 bg-green-500/10 border-green-500/20';
    }
  };

  if (selectedIncident) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto relative pb-32">
        <button 
          onClick={() => { setSelectedIncident(null); setAiReport(null); }}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-4 font-label-md transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Queue
        </button>

        {aiLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <span className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></span>
            <span className="font-mono text-label-sm text-primary tracking-widest animate-pulse">GENERATING AI FORENSICS REPORT...</span>
          </div>
        ) : aiReport ? (
          <>
            {/* Chat-style Header / AI Prompt */}
            <section className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary-container/20">
                  <span className="material-symbols-outlined text-on-primary-container text-[28px]">neurology</span>
                </div>
                <div className="flex-1 pt-2">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Investigation: Incident #{selectedIncident.id}</h2>
                  <p className="text-on-surface-variant font-body-lg max-w-3xl leading-relaxed">
                    {aiReport.executive_summary}
                  </p>
                </div>
              </div>
            </section>

            {/* Metrics & Risk Bento Grid */}
            <div className="grid grid-cols-12 gap-lg">
              {/* Risk Score Card */}
              <div className="col-span-12 md:col-span-4 glass-card p-6 rounded-2xl border border-outline-variant bg-white flex flex-col justify-between overflow-hidden relative custom-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div>
                  <h3 className="font-label-sm text-on-surface-variant uppercase tracking-widest">Risk Severity Score</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-metric-xl text-metric-xl text-on-surface">{selectedIncident.risk_score}</span>
                    <span className="font-headline-sm text-primary">/ 100</span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container" style={{ width: `${selectedIncident.risk_score}%` }}></div>
                  </div>
                </div>
                <div className={`mt-6 p-3 rounded-lg flex items-center gap-3 ${selectedIncident.risk_score > 80 ? 'bg-error-container text-on-error-container' : 'bg-orange-100 text-orange-800'}`}>
                  <span className="material-symbols-outlined">{selectedIncident.risk_score > 80 ? 'priority_high' : 'warning'}</span>
                  <p className="font-label-sm">{selectedIncident.risk_score > 80 ? 'Critical Intervention Required' : 'High Alert'}</p>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="col-span-12 md:col-span-8 glass-card p-8 rounded-2xl border border-outline-variant bg-white custom-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">article</span>
                  <h3 className="font-headline-sm text-on-surface">AI Root Cause Analysis</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-on-surface-variant leading-relaxed">
                      {aiReport.root_cause}
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 font-label-md text-on-surface">
                        <span className="w-1.5 h-1.5 bg-primary-container rounded-full"></span>
                        Fraud Probability: {selectedIncident.fraud_probability}%
                      </li>
                      <li className="flex items-center gap-2 font-label-md text-on-surface">
                        <span className="w-1.5 h-1.5 bg-primary-container rounded-full"></span>
                        Confidence Level: {aiReport.confidence}%
                      </li>
                    </ul>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30">
                    <p className="font-label-sm text-on-surface-variant mb-3 uppercase tracking-tighter">AI Forensics Sentiment</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container w-[88%]"></div>
                      </div>
                      <span className="font-label-sm text-primary">Hostile Intent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container w-[12%]"></div>
                      </div>
                      <span className="font-label-sm text-on-surface-variant">False Positive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MITRE ATT&CK Mapping */}
            <div className="grid grid-cols-12 gap-lg">
              <div className="col-span-12 glass-card p-8 rounded-2xl border border-outline-variant bg-white custom-shadow">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">grid_view</span>
                    <h3 className="font-headline-sm text-on-surface">MITRE ATT&CK® Mapping</h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-surface-container rounded-full text-label-sm text-on-surface-variant">
                      Model: Gemini-1.5-Flash
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border-l-4 border-primary-container inline-block">
                  <p className="font-label-sm text-on-surface-variant mb-1">Identified Tactic</p>
                  <p className="font-body-md font-bold text-on-surface">{aiReport.mitre_attack_mapping}</p>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-label-sm text-primary uppercase tracking-widest mb-2">Business Impact</h4>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">{aiReport.business_impact}</p>
                  </div>
                  <div>
                    <h4 className="font-label-sm text-primary uppercase tracking-widest mb-2">AI Reason</h4>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">{aiReport.reason}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card p-8 rounded-2xl border border-outline-variant bg-surface-container-highest/30">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <h3 className="font-headline-sm text-on-surface">Remediation Recommendations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiReport.recommended_actions?.map((act, index) => (
                  <div key={index} className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container">shield</span>
                    </div>
                    <h4 className="font-body-md font-bold text-on-surface">Action #{index + 1}</h4>
                    <p className="text-body-sm text-on-surface-variant">{act}</p>
                    <button className="font-label-sm text-primary flex items-center gap-1">Execute Action <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky Chat Input Placeholder (ChatGPT Style) */}
            <div className="fixed bottom-8 left-[280px] right-0 max-w-4xl mx-auto z-40 px-6">
              <div className="bg-white/95 backdrop-blur-xl border border-outline-variant shadow-2xl rounded-2xl p-2 flex items-center gap-2 group transition-all focus-within:ring-2 focus-within:ring-primary-container/50">
                <button className="p-3 hover:bg-surface-container rounded-xl text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <input className="flex-1 border-none focus:ring-0 bg-transparent py-4 text-body-md outline-none" placeholder="Ask CyberSense.AI to perform further forensic analysis..." type="text"/>
                <button className="p-3 bg-primary-container text-on-primary-fixed-variant rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all">
                  <span className="material-symbols-outlined">arrow_upward</span>
                </button>
              </div>
              <p className="text-center text-label-sm text-on-surface-variant mt-3 drop-shadow-sm">CyberSense.AI can make mistakes. Verify critical security findings with a human analyst.</p>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold tracking-wide">Incident Correlation Queue</h2>
          <p className="font-label-sm text-on-surface-variant mt-1">Real-time correlated ledger requiring investigation.</p>
        </div>
        <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-label-md font-bold border border-outline-variant">
          {incidents.length} Active Alerts
        </span>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {incidents.length === 0 ? (
            <div className="col-span-full text-center text-on-surface-variant py-16 bg-white border border-outline-variant rounded-2xl custom-shadow">
              <span className="material-symbols-outlined text-[48px] mb-4 text-surface-variant">check_circle</span>
              <p className="font-headline-sm">No active threats logged.</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => handleFetchAiExplanation(incident)}
                className="bg-white border border-outline-variant p-6 rounded-2xl custom-shadow hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-48"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">INCIDENT #{incident.id}</span>
                    <span className={`px-2 py-0.5 rounded font-label-sm text-[10px] uppercase border ${getSeverityBadgeColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="font-headline-sm text-on-surface leading-snug line-clamp-2 mt-3 group-hover:text-primary transition-colors">
                    {incident.recommendation || `Suspicious Activity Detected`}
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-label-sm border-t border-outline-variant pt-3 mt-4">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {new Date(incident.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <button className="flex items-center gap-1 text-primary font-bold">
                    Investigate <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Incidents;
