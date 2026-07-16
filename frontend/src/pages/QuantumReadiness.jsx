import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ShieldCheck, Cpu, AlertOctagon, HelpCircle, Binary, CheckCircle } from 'lucide-react';

const QuantumReadiness = () => {
  // Key length audits dataset
  const pqcData = [
    { name: 'RSA-2048', legacy: 100, pqc: 0 },
    { name: 'ECDSA', legacy: 100, pqc: 0 },
    { name: 'Kyber-512', legacy: 0, pqc: 100 },
    { name: 'Dilithium2', legacy: 0, pqc: 100 },
    { name: 'Falcon-512', legacy: 0, pqc: 100 }
  ];

  const migrationList = [
    { id: 1, name: 'TLS Encryption Layers', legacy: 'RSA-3072 / ECDHE', pqc: 'ML-KEM (Kyber-768)', status: 'MIGRATED', progress: 100 },
    { id: 2, name: 'Operator Signatures', legacy: 'ECDSA-256', pqc: 'ML-DSA (Dilithium3)', status: 'IN_PROGRESS', progress: 65 },
    { id: 3, name: 'Database Column-Level Crypt', legacy: 'AES-256-GCM', pqc: 'AES-256-GCM (Quantum Safe Keys)', status: 'COMPLIANT', progress: 100 },
    { id: 4, name: 'Firmware Integrity Hashes', legacy: 'SHA-256', pqc: 'LMS/XMSS State-ful Signatures', status: 'PLANNING', progress: 20 }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MIGRATED':
      case 'COMPLIANT':
        return 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20';
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-500/20';
      default:
        return 'bg-cyan-500/10 text-cyan-650 dark:text-[#38BDF8] border border-cyan-500/20';
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">Quantum Cryptographic Readiness</h2>
        <p className="text-xs text-slate-550 dark:text-gray-400 mt-0.5">Audit compliance metrics for Post-Quantum Cryptography (PQC) algorithm migrations</p>
      </div>

      {/* Numerical Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow flex items-center space-x-4">
          <div className="p-3 bg-[#2563EB]/10 text-[#2563EB] dark:text-[#38BDF8] rounded-lg">
            <Binary className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono uppercase">PQC Compliance Index</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">71.2%</p>
          </div>
        </div>

        <div className="glass-panel border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono uppercase">Legacy Algos Deprecated</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">4 / 6</p>
          </div>
        </div>

        <div className="glass-panel border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-gray-500 font-mono uppercase">Decrypt Later Threat Index</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">LOW</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Cryptographic Mix BarChart */}
        <div className="lg:col-span-1 glass-panel border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <h3 className="font-bold text-slate-550 dark:text-gray-300 uppercase tracking-wider text-[11px] mb-4">Cryptographic Algorithm Mix</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pqcData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--chart-text)" style={{ fontSize: '9px' }} />
                <YAxis stroke="var(--chart-text)" style={{ fontSize: '9px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', color: 'var(--chart-tooltip-text)' }}
                />
                <Legend style={{ fontSize: '10px' }} />
                <Bar dataKey="legacy" stackId="a" fill="#F43F5E" name="Legacy Crypto" />
                <Bar dataKey="pqc" stackId="a" fill="#06B6D4" name="Post-Quantum Safe" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Algorithm Migration Ledger */}
        <div className="lg:col-span-2 glass-panel border border-slate-200 dark:border-gray-800 rounded-xl p-5 shadow-lg overflow-x-auto">
          <h3 className="font-bold text-slate-550 dark:text-gray-300 uppercase tracking-wider text-[11px] mb-4">Algorithm Migration Ledger</h3>
          
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#1F2937] text-slate-600 dark:text-gray-400 font-mono border-b border-slate-250 dark:border-[#374151]">
              <tr>
                <th className="p-3">Compliance Domain</th>
                <th className="p-3">Legacy Algorithm</th>
                <th className="p-3">PQC Target</th>
                <th className="p-3">Migration State</th>
                <th className="p-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-gray-800 text-slate-700 dark:text-gray-300">
              {migrationList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-100/50 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="p-3 font-semibold text-slate-800 dark:text-gray-200">{item.name}</td>
                  <td className="p-3 font-mono text-rose-600 dark:text-rose-400">{item.legacy}</td>
                  <td className="p-3 font-mono text-cyan-600 dark:text-cyan-400">{item.pqc}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{item.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default QuantumReadiness;
