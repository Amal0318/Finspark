import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mlAPI } from '../services/api';

const QuantumReadiness = () => {
  const { data: qData, isLoading } = useQuery({
    queryKey: ['mlQuantum'],
    queryFn: mlAPI.getQuantum
  });

  const hasData = qData && qData.overall_readiness > 0;

  const migrationList = hasData ? [
    { id: 1, name: 'TLS Encryption Layers', asset: 'Network Layer', legacy: 'RSA-3072 / ECDHE', pqc: 'ML-KEM (Kyber-768)', status: 'COMPLIANT', progress: 100 },
    { id: 2, name: 'Operator Signatures', asset: 'Identity Manager', legacy: 'ECDSA-256', pqc: 'ML-DSA (Dilithium3)', status: 'IN_PROGRESS', progress: 65 },
    { id: 3, name: 'Database Column-Level Crypt', asset: 'Core Database', legacy: 'AES-256-GCM', pqc: 'AES-256-GCM (Quantum Safe Keys)', status: 'COMPLIANT', progress: 100 },
    { id: 4, name: 'Firmware Integrity Hashes', asset: 'Storage', legacy: 'SHA-256', pqc: 'LMS/XMSS State-ful Signatures', status: 'NON_COMPLIANT', progress: 20 }
  ] : [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-label-sm flex items-center w-fit gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span> Ready</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-label-sm flex items-center w-fit gap-1"><span className="material-symbols-outlined text-[14px]">warning</span> Transitioning</span>;
      default:
        return <span className="px-2 py-1 bg-error/10 text-error rounded-full font-label-sm flex items-center w-fit gap-1"><span className="material-symbols-outlined text-[14px]">error</span> Non-Compliant</span>;
    }
  };

  return (
    <div className="space-y-xl max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Quantum Readiness</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">CyberSense.AI Compliance & Post-Quantum Cryptography Migration</p>
        </div>
        <button className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-lg hover:shadow-lg transition-all active:scale-95 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]" data-icon="download">download</span>
          EXPORT COMPLIANCE REPORT
        </button>
      </div>

      {/* Bento Grid - Performance Metrics */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Compliance Progress Card */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-lg rounded-2xl shadow-sm flex flex-col justify-between group hover:border-primary transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest">Compliance Progress</span>
            <span className="material-symbols-outlined text-primary" data-icon="verified_user">verified_user</span>
          </div>
          <div className="mt-8 flex items-end gap-2">
            <span className="font-metric-xl text-metric-xl text-on-surface">{hasData ? `${qData.compliance_score}%` : 'N/A'}</span>
            <span className="font-label-md text-primary pb-3">+4.2% this quarter</span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full transition-all duration-1000 ease-out" style={{ width: `${hasData ? qData.compliance_score : 0}%` }}></div>
          </div>
          <p className="font-body-sm text-on-surface-variant mt-4 opacity-70">NIST PQC Standards Alignment</p>
        </div>

        {/* Legacy Crypto Assets Card */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-lg rounded-2xl shadow-sm flex flex-col justify-between hover:border-primary transition-all">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest">Legacy Crypto Assets</span>
            <span className="material-symbols-outlined text-error" data-icon="lock_open">lock_open</span>
          </div>
          <div className="mt-8">
            <span className="font-metric-xl text-metric-xl text-on-surface">{hasData ? qData.legacy_algorithms : 'N/A'}</span>
            <div className="flex gap-4 mt-2">
              <span className="px-2 py-1 bg-error/10 text-error rounded font-label-sm">24 Critical</span>
              <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded font-label-sm">118 Medium</span>
            </div>
          </div>
          <p className="font-body-sm text-on-surface-variant mt-4 opacity-70">RSA-2048 & ECC vulnerable instances</p>
        </div>

        {/* Migration Timeline Overview */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-lg rounded-2xl shadow-sm flex flex-col justify-between hover:border-primary transition-all">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest">Phase: 03/04</span>
            <span className="material-symbols-outlined text-primary" data-icon="schedule">schedule</span>
          </div>
          <div className="mt-8">
            <span className="font-headline-sm text-headline-sm text-on-surface">Algorithm Agility Implementation</span>
            <p className="font-body-md text-on-surface-variant mt-2">Target Date: Q3 2025</p>
          </div>
          <div className="mt-4 flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-container flex items-center justify-center text-[10px] font-bold">+12</div>
          </div>
        </div>
      </div>

      {/* Architecture & Matrix Grid */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Architecture Diagram */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Quantum Safe Architecture Diagram</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 font-label-sm text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-primary"></span> Quantum-Safe</span>
              <span className="flex items-center gap-1 font-label-sm text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-outline"></span> Legacy</span>
            </div>
          </div>
          <div className="flex-1 p-lg bg-surface relative min-h-[400px] flex items-center justify-center overflow-hidden">
            {/* Interactive Diagram Representation */}
            <div className="relative w-full h-full max-w-2xl mx-auto flex flex-col items-center justify-center">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400">
                <path d="M 400 100 L 200 200" stroke="#827560" strokeDasharray="4" strokeWidth="1.5"></path>
                <path d="M 400 100 L 600 200" stroke="#FEBE10" strokeWidth="2"></path>
                <path d="M 200 200 L 100 320" stroke="#827560" strokeWidth="1.5"></path>
                <path d="M 200 200 L 300 320" stroke="#FEBE10" strokeWidth="2"></path>
                <path d="M 600 200 L 500 320" stroke="#FEBE10" strokeWidth="2"></path>
                <path d="M 600 200 L 700 320" stroke="#FEBE10" strokeWidth="2"></path>
              </svg>
              {/* Nodes */}
              <div className="absolute top-[80px] px-4 py-2 bg-white border border-outline rounded shadow-sm z-10 flex flex-col items-center">
                <span className="material-symbols-outlined text-primary mb-1">cloud</span>
                <span className="font-label-sm">Root API</span>
              </div>
              <div className="absolute top-[180px] left-[150px] px-4 py-2 bg-white border border-outline-variant rounded shadow-sm z-10 flex flex-col items-center opacity-60">
                <span className="material-symbols-outlined text-on-surface-variant mb-1">database</span>
                <span className="font-label-sm">Legacy DB</span>
              </div>
              <div className="absolute top-[180px] right-[150px] px-4 py-2 bg-white border border-primary rounded shadow-sm z-10 flex flex-col items-center">
                <span className="material-symbols-outlined text-primary mb-1">encrypted</span>
                <span className="font-label-sm">PQ-Storage</span>
              </div>
              <div className="absolute top-[300px] left-[50px] px-3 py-2 bg-white border border-outline-variant rounded shadow-sm z-10 font-label-sm">Edge Node A</div>
              <div className="absolute top-[300px] left-[250px] px-3 py-2 bg-white border border-primary rounded shadow-sm z-10 font-label-sm">Edge Node B</div>
              <div className="absolute top-[300px] right-[250px] px-3 py-2 bg-white border border-primary rounded shadow-sm z-10 font-label-sm">Edge Node C</div>
              <div className="absolute top-[300px] right-[50px] px-3 py-2 bg-white border border-primary rounded shadow-sm z-10 font-label-sm">Edge Node D</div>
            </div>
            <div className="absolute bottom-4 left-4 p-4 bg-white/80 backdrop-blur rounded-lg border border-outline-variant max-w-xs">
              <h4 className="font-label-sm font-bold mb-1">Architecture Health</h4>
              <p className="font-body-sm text-[12px] text-on-surface-variant">72% of traffic is now routed via Kyber-768 quantum-safe tunnels.</p>
            </div>
          </div>
        </div>

        {/* Migration Steps / Timeline Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-lg">
          <div className="bg-white border border-outline-variant rounded-2xl p-lg shadow-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-lg">Migration Timeline</h3>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
              {/* Milestone 1 Done */}
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[16px]">check</span>
                </div>
                <h4 className="font-label-md text-on-surface">Asset Discovery</h4>
                <p className="font-body-sm text-on-surface-variant">Completed Jan 2024</p>
              </div>
              {/* Milestone 2 In Progress */}
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
                <h4 className="font-label-md text-on-surface">Algorithm Agility</h4>
                <p className="font-body-sm text-on-surface-variant">In Progress - 82%</p>
              </div>
              {/* Milestone 3 Pending */}
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-outline-variant rounded-full"></div>
                <h4 className="font-label-md text-on-surface-variant">Full PQC Rollout</h4>
                <p className="font-body-sm text-on-surface-variant">Target: Q4 2024</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-container/10 border border-primary/20 rounded-2xl p-lg shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <h4 className="font-label-sm font-bold text-primary">Compliance Tip</h4>
            </div>
            <p className="font-body-sm text-on-surface">Prioritize RSA-4096 migration for core banking ledger services by end of month.</p>
          </div>
        </div>
      </div>

      {/* Compliance Matrix Table */}
      <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden mt-xl">
        <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Compliance Matrix</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-outline-variant rounded font-label-sm">
              <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant">
                <th className="px-lg py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Service Entity</th>
                <th className="px-lg py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Asset Class</th>
                <th className="px-lg py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Current Algorithm</th>
                <th className="px-lg py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Compliance Status</th>
                <th className="px-lg py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {migrationList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-lg py-8 text-center text-on-surface-variant">No Data Available</td>
                </tr>
              ) : (
                migrationList.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container transition-colors">
                    <td className="px-lg py-3 font-body-md font-medium text-on-surface">{item.name}</td>
                    <td className="px-lg py-3 font-body-sm text-on-surface-variant">{item.asset}</td>
                    <td className="px-lg py-3 font-body-sm text-on-surface-variant">{item.legacy}</td>
                    <td className="px-lg py-3">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-lg py-3">
                      <button className={`font-label-sm uppercase hover:underline underline-offset-4 ${item.status === 'COMPLIANT' ? 'text-on-surface-variant opacity-50 cursor-not-allowed' : 'text-primary'}`}>
                        {item.status === 'COMPLIANT' ? 'None' : 'Schedule Migration'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuantumReadiness;
