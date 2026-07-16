import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { alertAPI } from '../services/api';
import { Settings, Cpu, User as UserIcon, RefreshCw } from 'lucide-react';

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
    <div className="space-y-xl max-w-7xl mx-auto font-sans">
      <div className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">SOC Settings Panel</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Manage model parameters, operator credentials, and sandbox databases</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-surface-container-low p-1.5 rounded-xl border border-outline-variant custom-shadow w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg font-label-md transition-all ${
            activeTab === 'profile' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          Operator Profile
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-lg font-label-md transition-all ${
            activeTab === 'models' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          ML Anomaly Models
        </button>
      </div>

      {/* Content Viewports */}
      {activeTab === 'profile' ? (
        <div className="bg-white border border-outline-variant rounded-2xl p-lg max-w-2xl custom-shadow space-y-6">
          <div className="flex items-center space-x-6 border-b border-outline-variant pb-6">
            <div className="bg-primary-container p-6 rounded-full text-primary shadow-inner">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{user?.full_name || 'Operator'}</h3>
              <p className="text-on-surface-variant font-mono text-label-sm mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/50">
              <span className="text-on-surface-variant font-body-md">Authentication Status:</span>
              <span className="text-on-surface font-mono font-semibold">ACTIVE JWT CONTEXT</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/50">
              <span className="text-on-surface-variant font-body-md">System RBAC Role:</span>
              <span className="text-primary font-bold uppercase tracking-widest font-mono text-label-sm bg-primary-container px-3 py-1 rounded-full border border-primary/20">
                {user?.role || 'viewer'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-on-surface-variant font-body-md">Superuser Status:</span>
              <span className="text-on-surface font-mono font-semibold">{user?.is_superuser ? 'TRUE' : 'FALSE'}</span>
            </div>
          </div>
        </div>
      ) : (
        /* ML Anomaly Models Tab */
        <div className="bg-white border border-outline-variant rounded-2xl p-lg max-w-2xl custom-shadow space-y-8">
          <div className="flex items-start space-x-4">
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant shadow-sm text-primary">
              <Cpu className="h-6 w-6" />
            </div>
            <div className="pt-1">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Isolation Forest Anomaly Classifier</h3>
              <p className="text-on-surface-variant leading-relaxed font-body-md mt-2">
                The ML model scores transaction risks by mapping transaction amounts, hours, and concurrent security event counts. You can manually retrain the model when new datasets are committed.
              </p>
            </div>
          </div>

          {retrainMsg && (
            <div className={`p-4 rounded-xl border font-body-md ${retrainMsg.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {retrainMsg.text}
            </div>
          )}

          <div className="border-t border-outline-variant pt-6 flex items-center justify-between gap-6">
            <div>
              <p className="font-body-md font-semibold text-on-surface">Contamination Coefficient: 5.0%</p>
              <p className="font-body-sm text-on-surface-variant mt-1">Algorithm parameters: IsolationForest (n_estimators=100)</p>
            </div>

            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="bg-primary hover:bg-primary/90 text-white font-label-md px-6 py-3 rounded-xl shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50 active:scale-95"
            >
              {isRetraining ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Cpu className="h-5 w-5" />
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
