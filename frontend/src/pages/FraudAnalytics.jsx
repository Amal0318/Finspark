import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mlAPI } from '../services/api';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  ShieldAlert
} from 'lucide-react';

const FraudAnalytics = () => {
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' or 'plots'

  // Query evaluation metrics from the FastAPI backend using React Query
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['mlMetrics'],
    queryFn: mlAPI.getMetrics
  });

  const { data: modelsData } = useQuery({
    queryKey: ['mlModels'],
    queryFn: mlAPI.getModels
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-on-surface-variant text-sm font-mono tracking-widest animate-pulse">RETRIEVING PIPELINE METRICS...</p>
        </div>
      </div>
    );
  }

  const metrics = metricsData?.metrics;
  const hasData = !!metrics;

  const rfMetrics = metrics?.random_forest || {
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1_score: 0,
    roc_auc: 0,
    mean_cv_f1_score: 0
  };

  const featureImportanceData = metrics?.feature_importance?.map(f => ({
    name: f.feature,
    value: f.importance * 100 // assuming it's a fraction
  })) || [];

  const cm = metrics?.confusion_matrix || { TN: 0, FP: 0, FN: 0, TP: 0 };

  return (
    <div className="space-y-xl max-w-7xl mx-auto font-sans">
      
      {/* Page Header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Fraud Analytics & Model Evaluation
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Supervised Random Forest evaluations and feature split importance coefficients</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-surface-container-low p-1.5 rounded-xl border border-outline-variant custom-shadow">
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg font-label-md transition-all ${
              activeTab === 'metrics' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            METRICS MATRIX
          </button>
          <button 
            onClick={() => setActiveTab('plots')}
            className={`px-4 py-2 rounded-lg font-label-md transition-all ${
              activeTab === 'plots' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            VALIDATION PLOTS
          </button>
        </div>
      </div>

      {activeTab === 'metrics' ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Card Scorecards Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-lg">
            <div className="bg-white border border-outline-variant rounded-2xl p-6 text-center custom-shadow group hover:border-primary transition-all">
              <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Classification Accuracy</p>
              <p className="font-metric-xl text-metric-xl text-on-surface">{(rfMetrics.accuracy * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-white border border-outline-variant rounded-2xl p-6 text-center custom-shadow group hover:border-primary transition-all">
              <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Precision (PPV)</p>
              <p className="font-metric-xl text-metric-xl text-primary">{(rfMetrics.precision * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-white border border-outline-variant rounded-2xl p-6 text-center custom-shadow group hover:border-primary transition-all">
              <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Recall (Sensitivity)</p>
              <p className="font-metric-xl text-metric-xl text-orange-500">{(rfMetrics.recall * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-white border border-outline-variant rounded-2xl p-6 text-center custom-shadow group hover:border-primary transition-all">
              <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Mean Cross-Val F1</p>
              <p className="font-metric-xl text-metric-xl text-purple-500">{(rfMetrics.mean_cv_f1_score * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-white border border-outline-variant rounded-2xl p-6 text-center custom-shadow group hover:border-primary transition-all">
              <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Area Under ROC (AUC)</p>
              <p className="font-metric-xl text-metric-xl text-green-600">{(rfMetrics.roc_auc * 100).toFixed(2)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Left: Recharts Feature Importance */}
            <div className="lg:col-span-2 bg-white border border-outline-variant rounded-2xl p-lg custom-shadow">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Feature Importance Index
              </h3>
              <div className="h-80">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" vertical={false} />
                      <XAxis type="number" stroke="#A3A3A3" fontSize={11} unit="%" />
                      <YAxis dataKey="name" type="category" stroke="#A3A3A3" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFF', borderColor: '#ECECEC', color: '#1A1A1A', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="value" fill="#FEBE10" radius={[0, 4, 4, 0]} name="Gini split contribution" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">No Data Available</div>
                )}
              </div>
            </div>

            {/* Right: Confusion Matrix */}
            <div className="lg:col-span-1 bg-white border border-outline-variant rounded-2xl p-lg custom-shadow flex flex-col justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-error" />
                Confusion Matrix Model 2
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl">
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">True Legitimate (TN)</p>
                  <p className="font-headline-lg text-green-600">{hasData ? cm.TN : "No Data"}</p>
                </div>
                <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl">
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">False Fraud (FP)</p>
                  <p className="font-headline-lg text-error">{hasData ? cm.FP : "No Data"}</p>
                </div>
                <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl">
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">False Legitimate (FN)</p>
                  <p className="font-headline-lg text-orange-500">{hasData ? cm.FN : "No Data"}</p>
                </div>
                <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl">
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">True Fraud (TP)</p>
                  <p className="font-headline-lg text-primary">{hasData ? cm.TP : "No Data"}</p>
                </div>
              </div>
              <p className="font-body-sm text-on-surface-variant leading-relaxed border-t border-outline-variant pt-4">
                Oversampled SMOTE distributions minimize False Legitimates (FN), ensuring critical payment alerts are surfaced.
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        // Validation plots tab: serves actual matplotlib outputs dynamically!
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-lg"
        >
          <div className="bg-white border border-outline-variant rounded-2xl p-lg custom-shadow">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Receiver Operating Characteristic (ROC)</h3>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant flex items-center justify-center p-2">
              <img 
                src="/plots/roc_curve.png" 
                alt="ROC Curve" 
                className="w-full h-auto object-contain hover:scale-105 transition-all duration-300 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-lg custom-shadow">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Precision-Recall Curve</h3>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant flex items-center justify-center p-2">
              <img 
                src="/plots/precision_recall_curve.png" 
                alt="Precision Recall Curve" 
                className="w-full h-auto object-contain hover:scale-105 transition-all duration-300 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-lg custom-shadow">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Risk Scores Distribution Density</h3>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant flex items-center justify-center p-2">
              <img 
                src="/plots/risk_distribution.png" 
                alt="Risk Density Distribution" 
                className="w-full h-auto object-contain hover:scale-105 transition-all duration-300 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-lg custom-shadow">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Model Correlation Heatmap Matrix</h3>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant flex items-center justify-center p-2">
              <img 
                src="/plots/correlation_heatmap.png" 
                alt="Correlation Heatmap Matrix" 
                className="w-full h-auto object-contain hover:scale-105 transition-all duration-300 rounded-lg"
              />
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default FraudAnalytics;
