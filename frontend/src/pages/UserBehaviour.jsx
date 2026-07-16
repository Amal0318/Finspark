import React, { useState, useEffect } from 'react';
import { riskAPI } from '../services/api';
import { Users, ShieldAlert, Cpu, Search, CheckCircle, Clock } from 'lucide-react';

const UserBehaviour = () => {
  const [entityType, setEntityType] = useState('ip');
  const [entityId, setEntityId] = useState('192.168.1.99');
  
  const [riskData, setRiskData] = useState(null);
  const [riskHistory, setRiskHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!entityId) return;
    setLoading(true);
    setMsg('');
    setRiskData(null);

    try {
      // Evaluate Risk
      const result = await riskAPI.evaluate(entityType, entityId);
      setRiskData(result);

      // Fetch history
      const history = await riskAPI.getHistory(entityType, entityId);
      setRiskHistory(history);
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Risk evaluation failed. Make sure database is online.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (score >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">User Access Auditing</h2>
        <p className="text-xs text-gray-400 mt-0.5">Continuous risk assessment for active customer accounts and network IP addresses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Input controls */}
        <div className="lg:col-span-1 glass-panel border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Search for Target User or IP</h3>
          <p className="text-gray-455 leading-relaxed text-[11px]">
            Input an IP address or customer account number to extract activity logs and calculate threat risk scores.
          </p>

          {msg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-550/20 text-rose-400">
              {msg}
            </div>
          )}

          <form onSubmit={handleEvaluate} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-gray-400 font-semibold">Entity Classification</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setEntityType('ip'); setEntityId('192.168.1.99'); }}
                  className={`p-2 rounded-lg border text-center font-bold transition-all ${entityType === 'ip' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-gray-800 bg-gray-900 text-gray-400'}`}
                >
                  IP Address
                </button>
                <button
                  type="button"
                  onClick={() => { setEntityType('account'); setEntityId('ACC-887766'); }}
                  className={`p-2 rounded-lg border text-center font-bold transition-all ${entityType === 'account' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-gray-800 bg-gray-900 text-gray-400'}`}
                >
                  Bank Account
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-gray-400 font-semibold">Identifier Address / ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder={entityType === 'ip' ? 'e.g. 192.168.1.50' : 'e.g. ACC-123456'}
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  className="w-full bg-[#0F1424] border border-gray-800 rounded-lg p-2.5 pl-10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !entityId}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white p-3 rounded-lg font-bold shadow-lg shadow-purple-950/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <>
                  <Cpu className="h-4 w-4" />
                  <span>Execute Threat Scoring</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Scoring details */}
        <div className="lg:col-span-2 space-y-6">
          {riskData ? (
            <div className="glass-panel border border-gray-800 rounded-2xl p-6 shadow-lg space-y-6">
              
              {/* Dynamic Risk Gauge */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Active Profiler Output</span>
                  <h3 className="text-base font-bold text-white mt-1">Calculated Entity Risk Score</h3>
                </div>
                
                <span className={`px-4 py-2 rounded-xl text-base font-extrabold border ${getScoreColor(riskData.score)}`}>
                  {riskData.score}%
                </span>
              </div>

              {/* Factors list */}
              <div className="bg-[#0c1222] border border-gray-850/40 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-gray-300 uppercase tracking-wider text-[10px] border-b border-gray-800 pb-1">
                  Scoring Analysis Factors
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(riskData.factors_json || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center py-1">
                      <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-semibold text-gray-200 font-mono">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluation histories */}
              <div className="border-t border-gray-800 pt-6 space-y-4">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px] flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span>Evaluation Logs History</span>
                </h4>
                
                <div className="space-y-2">
                  {riskHistory.slice(1).map((h) => (
                    <div key={h.id} className="p-3 bg-[#0F1424] border border-gray-850/40 rounded-lg flex items-center justify-between">
                      <span className="text-gray-500 font-mono">{new Date(h.timestamp).toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${h.score >= 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {h.score}%
                      </span>
                    </div>
                  ))}
                  {riskHistory.length <= 1 && (
                    <p className="text-gray-500 italic">No historical risk logs registered for this entity</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[300px] text-gray-500">
              <Users className="h-10 w-10 text-gray-700 mb-2" />
              <p>Execute scoring evaluations to audit parameters</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserBehaviour;
