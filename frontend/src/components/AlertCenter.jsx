import React from 'react';
import { Bell, ShieldAlert, CheckSquare, Clock, AlertOctagon } from 'lucide-react';

const AlertCenter = ({ alerts, onResolveAlert }) => {
  const getRiskColor = (score) => {
    if (score >= 75) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (score >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckSquare className="h-4 w-4 text-emerald-400" />;
      case 'INVESTIGATING':
        return <Clock className="h-4 w-4 text-amber-400" />;
      default:
        return <AlertOctagon className="h-4 w-4 text-rose-400" />;
    }
  };

  return (
    <div className="bg-[#0F1424] border border-gray-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
            Correlated AI Threat Stream
          </h3>
          <p className="text-xs text-gray-500 mt-1">Real-time alerts correlating financial transfers with concurrent cyber activity</p>
        </div>
        <Bell className="h-5 w-5 text-gray-500" />
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            No correlated alerts triggered. System state secure.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${getRiskColor(
                alert.risk_score
              )}`}
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div className="mt-1 shrink-0">
                  {getStatusIcon(alert.status)}
                </div>
                <div className="min-w-0 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold tracking-wider uppercase text-[10px]">
                      Alert #{alert.id}
                    </span>
                    <span className="h-1 w-1 bg-gray-500 rounded-full"></span>
                    <span className="text-gray-400 font-mono text-[10px]">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-200 mt-1 leading-relaxed">
                    {alert.correlation_reason}
                  </p>
                  
                  {/* Correlation Context */}
                  {(alert.banking_transaction || alert.telemetry_log) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono">
                      {alert.banking_transaction && (
                        <span className="bg-gray-900/60 text-gray-400 px-2 py-0.5 rounded border border-gray-800">
                          Tx Amount: ${alert.banking_transaction.amount.toFixed(2)} // IP: {alert.banking_transaction.ip_address}
                        </span>
                      )}
                      {alert.telemetry_log && (
                        <span className="bg-gray-900/60 text-gray-400 px-2 py-0.5 rounded border border-gray-800">
                          Log Threat: {alert.telemetry_log.event_type} ({alert.telemetry_log.severity})
                        </span>
                      )}
                    </div>
                  )}

                  {alert.notes && (
                    <p className="text-[10px] text-gray-400 mt-1 italic">
                      Notes: {alert.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center text-xs">
                <div className="text-right mr-2 hidden md:block">
                  <p className="text-[10px] text-gray-500 font-mono">Risk Score</p>
                  <p className="font-bold text-sm">{alert.risk_score}%</p>
                </div>

                {alert.status === 'OPEN' && (
                  <button
                    onClick={() => onResolveAlert(alert.id, 'INVESTIGATING', 'Investigation opened by security staff')}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
                  >
                    Investigate
                  </button>
                )}
                {alert.status !== 'RESOLVED' ? (
                  <button
                    onClick={() => onResolveAlert(alert.id, 'RESOLVED', 'Alert closed as verified resolved')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                  >
                    Resolve
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded font-bold uppercase tracking-wider">
                    Closed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertCenter;
