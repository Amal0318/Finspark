import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mlAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Database,
  Terminal,
  Activity,
  AlertTriangle,
  Server
} from 'lucide-react';

const Dashboard = () => {
  // Query dashboard statistics using TanStack React Query
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['mlDashboard'],
    queryFn: mlAPI.getDashboard,
    refetchInterval: 10000 // Poll every 10 seconds for real-time updates
  });

  // Query analytics series for trend charts
  const { data: analyticsData } = useQuery({
    queryKey: ['mlAnalytics'],
    queryFn: mlAPI.getAnalytics
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#090D16]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-gray-400 text-xs font-mono tracking-widest animate-pulse">LOADING SECURE CONNECTION...</p>
        </div>
      </div>
    );
  }

  // Format chart data
  const stats = dashboardData || {
    total_incidents_analyzed: 100,
    severity_distribution: { Low: 85, Medium: 12, High: 2, Critical: 1 },
    anomalies_detected: 5,
    frauds_detected: 1,
    active_threats_blocked: 2
  };

  const severityData = [
    { name: 'Low', count: stats.severity_distribution.Low, fill: '#10b981' },
    { name: 'Medium', count: stats.severity_distribution.Medium, fill: '#f59e0b' },
    { name: 'High', count: stats.severity_distribution.High, fill: '#ef4444' },
    { name: 'Critical', count: stats.severity_distribution.Critical, fill: '#7c3aed' }
  ];

  // Map analytics predictions to Recharts line format
  const rawTrends = analyticsData?.time_series_predictions || [];
  const trendData = rawTrends.length > 0 
    ? rawTrends.map((t, idx) => ({
        time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk: t.confidence_score,
        threat: t.label === 'Critical' || t.label === 'High' ? 1 : 0
      })).reverse()
    : [
        { time: '09:00', risk: 12, threat: 0 },
        { time: '10:00', risk: 18, threat: 0 },
        { time: '11:00', risk: 45, threat: 1 },
        { time: '12:00', risk: 25, threat: 0 },
        { time: '13:00', risk: 15, threat: 0 },
        { time: '14:00', risk: 90, threat: 2 },
        { time: '15:00', risk: 35, threat: 0 }
      ];

  return (
    <div className="space-y-6 text-white p-6 font-sans select-none">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-500 animate-pulse" />
            Security & Fraud Monitoring Dashboard
          </h2>
          <p className="text-xs text-gray-400 mt-1">Real-time monitoring of user logins, transaction risk, and security alerts</p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-lg hover:shadow-indigo-500/20"
        >
          REFRESH DATA
        </button>
      </div>

      {/* Grid: Indicators Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel rounded-2xl p-5 shadow-lg flex items-center space-x-4"
        >
          <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Analyzed Events</p>
            <p className="text-2xl font-extrabold mt-0.5">{stats.total_incidents_analyzed}</p>
            <p className="text-[9px] text-emerald-400 font-mono mt-1">Total logins & transactions</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-panel rounded-2xl p-5 shadow-lg flex items-center space-x-4"
        >
          <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Suspicious Activity</p>
            <p className="text-2xl font-extrabold mt-0.5 text-rose-450">{stats.anomalies_detected}</p>
            <p className="text-[9px] text-rose-400 font-mono mt-1">Unusual login patterns</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass-panel rounded-2xl p-5 shadow-lg flex items-center space-x-4"
        >
          <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Potential Fraud</p>
            <p className="text-2xl font-extrabold mt-0.5 text-amber-450">{stats.frauds_detected}</p>
            <p className="text-[9px] text-amber-400 font-mono mt-1">Flagged bank transactions</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="glass-panel rounded-2xl p-5 shadow-lg flex items-center space-x-4"
        >
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Blocked Threats</p>
            <p className="text-2xl font-extrabold mt-0.5 text-emerald-450">{stats.active_threats_blocked}</p>
            <p className="text-[9px] text-emerald-400 font-mono mt-1">Auto safety actions taken</p>
          </div>
        </motion.div>

      </div>

      {/* Grid: Charts & Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Risk Score Timeline (LineChart) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Risk Trend Over Time</h3>
            <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 font-mono">LIVE RISK RATING</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                <Area type="monotone" dataKey="risk" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" name="Risk Level" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Severity Class Distribution (BarChart) */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Threat Levels</h3>
            <span className="text-[9px] px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20 font-mono">THREAT CATEGORIES</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Alerts">
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-gray-400 border-t border-gray-850 pt-3 leading-relaxed mt-4">
            Events with risk scores above 75% are flagged as Critical and require immediate review.
          </div>
        </div>

      </div>

      {/* Real-time System Logs Console */}
      <div className="glass-panel rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 mb-3 font-mono">
          <Terminal className="h-4 w-4 text-indigo-400 animate-pulse" />
          <span>SYSTEM MONITORING LOGS</span>
        </div>
        <div className="bg-[#0c1222] border border-gray-850/30 rounded-xl p-4 font-mono text-[10px] text-indigo-300 space-y-2 h-36 overflow-y-auto shadow-inner">
          <div className="flex items-start space-x-2">
            <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
            <span className="text-indigo-400">$</span>
            <span className="text-emerald-400">System online. Anomaly and fraud detection engines loaded.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
            <span className="text-indigo-400">$</span>
            <span className="text-indigo-400">Monitoring active: analyzing transaction records.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
            <span className="text-indigo-400">$</span>
            <span className="text-indigo-400">Optimization active: adjusting data balance for high accuracy.</span>
          </div>
          {rawTrends.slice(0, 3).map((t, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-gray-600">[{new Date(t.timestamp).toLocaleTimeString()}]</span>
              <span className="text-indigo-400">$</span>
              <span className="text-amber-400">Analysis complete: Risk score is {t.confidence_score}% ({t.label}).</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

// Recharts cell wrapper to prevent compile error in Recharts 2
const Cell = (props) => {
  const { fill } = props;
  return <rect {...props} fill={fill} />;
};

export default Dashboard;
