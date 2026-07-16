import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { alertAPI } from '../services/api';
import { Settings, Cpu, User as UserIcon, ShieldAlert, Database, RefreshCw, Key } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState('');

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainMsg('');
    try {
      const response = await alertAPI.triggerMLRetrain();
      setRetrainMsg({
        success: true,
        text: response.message || 'Model retraining cycle initiated successfully!'
      });
    } catch (err) {
      setRetrainMsg({
        success: false,
        text: err.response?.data?.detail || 'Retraining failed. Ensure at least 10 transaction records exist.'
      });
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">System Settings</h2>
        <p className="text-xs text-gray-400 mt-0.5">Manage ML model retraining, credentials, and settings</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition-colors ${activeTab === 'profile' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-200'}`}
        >
          User Profile
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`pb-3 transition-colors ${activeTab === 'models' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Model Retraining
        </button>
      </div>

      {/* Content Viewports */}
      {activeTab === 'profile' ? (
        <div className="glass-panel border border-gray-800 rounded-xl p-6 max-w-xl space-y-6">
          <div className="flex items-center space-x-4 border-b border-gray-800 pb-4">
            <div className="bg-purple-500/10 p-4 rounded-full border border-purple-500/20 text-purple-400">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{user?.full_name || 'Operator'}</h3>
              <p className="text-gray-500 font-mono text-[10px]">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-850">
              <span className="text-gray-500 font-semibold">Authentication Status:</span>
              <span className="text-gray-300 font-mono">SECURE ACTIVE SESSION</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-850">
              <span className="text-gray-500 font-semibold">Account Access Role:</span>
              <span className="text-purple-400 font-bold uppercase tracking-widest font-mono text-[9px] bg-purple-500/15 border border-purple-500/20 px-2 py-0.5 rounded">
                {user?.role || 'viewer'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-gray-500 font-semibold">Superuser Status:</span>
              <span className="text-gray-300 font-mono">{user?.is_superuser ? 'ENABLED' : 'DISABLED'}</span>
            </div>
          </div>
        </div>
      ) : (
        /* ML Anomaly Models Tab */
        <div className="glass-panel border border-gray-800 rounded-xl p-6 max-w-xl space-y-6">
          <div className="flex items-start space-x-3">
            <Cpu className="h-6 w-6 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white">ML Anomaly Detection Engine</h3>
              <p className="text-gray-450 leading-relaxed text-[11px] mt-1">
                The ML model dynamically scores transaction risks. You can manually trigger a model retrain to refresh the intelligence with newly uploaded datasets.
              </p>
            </div>
          </div>

          {retrainMsg && (
            <div className={`p-4 rounded-xl border ${retrainMsg.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-550/20 text-rose-455'}`}>
              {retrainMsg.text}
            </div>
          )}

          <div className="border-t border-gray-800 pt-4 flex items-center justify-between gap-4">
            <div className="text-gray-500">
              <p className="font-semibold text-gray-450">Model Margin: 5.0%</p>
              <p className="text-[10px] text-gray-600 mt-0.5">Underlying algorithm: Anomaly Isolation Forest</p>
            </div>

            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-purple-950/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isRetraining ? (
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Cpu className="h-4 w-4 text-white" />
              )}
              <span>Retrain Model</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
