import React, { useState } from 'react';
import { mlAPI } from '../services/api';
import { Users, Cpu, Search, Clock } from 'lucide-react';

const UserBehaviour = () => {
  const [entityType, setEntityType] = useState('ip');
  const [entityId, setEntityId] = useState('');
  
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!entityId) return;
    setLoading(true);
    setMsg('');
    setRiskData(null);

    try {
      const result = await mlAPI.getBehaviour(entityId);
      
      if (result.status === 'error') {
        setMsg(result.message);
      } else {
        setRiskData(result.profile);
      }
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Behaviour profile search failed.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-error bg-error/10 border-error/20';
    if (score >= 40) return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
    return 'text-green-600 bg-green-500/10 border-green-500/20';
  };

  return (
    <div className="space-y-xl max-w-7xl mx-auto font-sans">
      <div className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">User & IP Behaviour Profiling</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Continuous risk assessment for active client accounts and network IPs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        
        {/* Left: Input controls */}
        <div className="lg:col-span-1 bg-white border border-outline-variant rounded-2xl p-lg custom-shadow space-y-6 h-fit">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Entity Search Investigator</h3>
          <p className="font-body-sm text-on-surface-variant leading-relaxed mb-6">
            Input an IP address or customer account number to extract logged telemetry activities and compute dynamic threat scores.
          </p>

          {msg && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/20 text-sm">
              {msg}
            </div>
          )}

          <form onSubmit={handleEvaluate} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Entity Classification</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setEntityType('ip'); setEntityId(''); }}
                  className={`p-3 rounded-lg border text-center font-label-md transition-all ${entityType === 'ip' ? 'border-primary bg-primary-container text-on-primary-container shadow-sm' : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  IP Address
                </button>
                <button
                  type="button"
                  onClick={() => { setEntityType('account'); setEntityId(''); }}
                  className={`p-3 rounded-lg border text-center font-label-md transition-all ${entityType === 'account' ? 'border-primary bg-primary-container text-on-primary-container shadow-sm' : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  Bank Account
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Identifier Address / ID</label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-on-surface-variant" />
                <input
                  type="text"
                  required
                  placeholder={entityType === 'ip' ? 'e.g. 192.168.1.50' : 'e.g. ACC-123456'}
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 pl-12 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !entityId}
              className="w-full bg-primary hover:bg-primary/90 text-white p-3.5 rounded-xl font-label-md shadow-sm disabled:opacity-50 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <>
                  <Cpu className="h-5 w-5" />
                  <span>Execute Threat Scoring</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Scoring details */}
        <div className="lg:col-span-2 space-y-lg">
          {riskData ? (
            <div className="bg-white border border-outline-variant rounded-2xl p-lg custom-shadow space-y-8">
              
              {/* Dynamic Risk Gauge */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-on-surface-variant uppercase tracking-widest">Active Profiler Output</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">Calculated Entity Risk Score</h3>
                </div>
                
                <span className={`px-6 py-3 rounded-2xl text-2xl font-metric-xl border shadow-sm ${getScoreColor(riskData.risk_score)}`}>
                  {riskData.risk_score}%
                </span>
              </div>

              {/* Factors list */}
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 space-y-4">
                <h4 className="font-label-sm text-primary uppercase tracking-wider border-b border-outline-variant pb-2">
                  Scoring Analysis Factors
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                    <span className="text-on-surface-variant font-body-md capitalize">Previous Logins:</span>
                    <span className="font-semibold text-on-surface font-mono">{riskData.previous_logins}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                    <span className="text-on-surface-variant font-body-md capitalize">Known Devices:</span>
                    <span className="font-semibold text-on-surface font-mono">{riskData.known_devices}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                    <span className="text-on-surface-variant font-body-md capitalize">Known Countries:</span>
                    <span className="font-semibold text-on-surface font-mono">{riskData.known_countries}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                    <span className="text-on-surface-variant font-body-md capitalize">Avg Transaction:</span>
                    <span className="font-semibold text-on-surface font-mono">{riskData.average_transaction}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                    <span className="text-on-surface-variant font-body-md capitalize">Behaviour Score:</span>
                    <span className="font-semibold text-on-surface font-mono">{riskData.behaviour_score}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/50">
                    <span className="text-on-surface-variant font-body-md capitalize">Recommendation:</span>
                    <span className="font-semibold text-primary font-mono">{riskData.recommendation}</span>
                  </div>
                </div>
              </div>

              {/* Evaluation histories */}
              <div className="border-t border-outline-variant pt-8 space-y-4">
                <h4 className="font-label-sm text-on-surface uppercase tracking-wider flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Evaluation Logs History</span>
                </h4>
                
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
                  <p className="text-on-surface-variant font-body-sm italic">No historical risk logs registered for this entity in the demo environment.</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-2xl p-lg custom-shadow flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-on-surface-variant" />
              </div>
              <h3 className="font-headline-sm text-on-surface mb-2">Awaiting Entity Search</h3>
              <p className="font-body-md text-on-surface-variant max-w-md">Execute scoring evaluations using the investigator panel to audit user and IP parameters.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserBehaviour;
