import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mlAPI, alertAPI } from '../services/api';
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
  Cell
} from 'recharts';

const Dashboard = () => {
  // Query dashboard statistics
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['mlDashboard'],
    queryFn: mlAPI.getDashboard,
    refetchInterval: 10000
  });

  // Query analytics series for trend charts
  const { data: analyticsData } = useQuery({
    queryKey: ['mlAnalytics'],
    queryFn: mlAPI.getAnalytics
  });

  // Query recent alerts for the table
  const { data: alertsList } = useQuery({
    queryKey: ['dashboardAlerts'],
    queryFn: () => alertAPI.list(0, 5),
    refetchInterval: 10000
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-madrid-gold"></div>
        <p className="text-on-surface-variant font-label-md text-label-md animate-pulse">CONNECTING TO FORTRESS AI...</p>
      </div>
    );
  }

  const stats = dashboardData || {
    total_incidents_analyzed: 0,
    severity_distribution: { Low: 0, Medium: 0, High: 0, Critical: 0 },
    anomalies_detected: 0,
    frauds_detected: 0,
    active_threats_blocked: 0
  };
  
  const severityData = [
    { name: 'Low', count: stats.severity_distribution.Low, fill: '#10b981' },
    { name: 'Medium', count: stats.severity_distribution.Medium, fill: '#f59e0b' },
    { name: 'High', count: stats.severity_distribution.High, fill: '#ef4444' },
    { name: 'Critical', count: stats.severity_distribution.Critical, fill: '#ba1a1a' }
  ];

  const rawTrends = analyticsData?.time_series_predictions || [];
  const trendData = rawTrends.length > 0 
    ? rawTrends.map((t) => ({
        time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk: t.confidence_score,
      })).reverse()
    : [];

  return (
    <>
      {/* Dashboard Header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Executive Overview</p>
          <h2 className="font-headline-lg text-headline-lg font-extrabold text-night-black">Security Operations Center</h2>
        </div>
        <div className="flex gap-md">
          <button onClick={() => refetch()} className="flex items-center gap-2 px-md py-sm bg-white border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined text-[18px]">sync</span>
            Sync Telemetry
          </button>
          <button className="flex items-center gap-2 px-md py-sm bg-night-black text-white rounded-lg font-label-md text-label-md hover:bg-black transition-all">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-lg mb-xl">
        <div className="glass-card p-lg rounded-2xl custom-shadow metric-card-hover bg-white/95 backdrop-blur-md border border-surface-variant">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Events Correlated</p>
          <h3 className="font-metric-lg text-metric-lg text-night-black mt-xs">{stats.total_incidents_analyzed.toLocaleString()}</h3>
          <div className="flex items-center gap-1 mt-md text-green-600 font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Live Data</span>
          </div>
        </div>
        <div className="glass-card p-lg rounded-2xl custom-shadow metric-card-hover bg-white/95 backdrop-blur-md border border-surface-variant">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Fraud Alerts</p>
          <h3 className="font-metric-lg text-metric-lg text-night-black mt-xs">{stats.frauds_detected}</h3>
          <div className="flex items-center gap-1 mt-md text-error font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-sm">priority_high</span>
            <span>RF Model</span>
          </div>
        </div>
        <div className="glass-card p-lg rounded-2xl custom-shadow metric-card-hover bg-white/95 backdrop-blur-md border border-surface-variant">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Behaviour Anomalies</p>
          <h3 className="font-metric-lg text-metric-lg text-night-black mt-xs">{stats.anomalies_detected}</h3>
          <div className="flex items-center gap-1 mt-md text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-sm">history</span>
            <span>IF Model</span>
          </div>
        </div>
        <div className="glass-card p-lg rounded-2xl custom-shadow metric-card-hover bg-white/95 backdrop-blur-md border border-surface-variant">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Critical Threats</p>
          <h3 className="font-metric-lg text-metric-lg text-error mt-xs">{stats.active_threats_blocked}</h3>
          <div className="flex items-center gap-1 mt-md text-error font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <span>Action Required</span>
          </div>
        </div>
        <div className="glass-card p-lg rounded-2xl custom-shadow metric-card-hover bg-white/95 backdrop-blur-md border border-surface-variant">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Avg Risk Score</p>
          <h3 className="font-metric-lg text-metric-lg text-green-600 mt-xs">Low</h3>
          <div className="flex items-center gap-1 mt-md text-green-600 font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>Within Limits</span>
          </div>
        </div>
      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Risk Timeline */}
        <div className="col-span-12 lg:col-span-8 glass-card p-lg rounded-2xl custom-shadow bg-white/95 backdrop-blur-md border border-surface-variant">
          <div className="flex justify-between items-start mb-xl">
            <h4 className="font-headline-sm text-headline-sm text-night-black">Risk Timeline</h4>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-night-black">more_horiz</span>
          </div>
          <div className="h-64 w-full relative">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FEBE10" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FEBE10" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" vertical={false} />
                  <XAxis dataKey="time" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="risk" stroke="#FEBE10" strokeWidth={3} fillOpacity={1} fill="url(#goldGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full font-label-sm text-label-sm text-on-surface-variant">No Data Available</div>
            )}
          </div>
        </div>

        {/* Threat Distribution (Donut / Bar) */}
        <div className="col-span-12 lg:col-span-4 glass-card p-lg rounded-2xl custom-shadow flex flex-col bg-white/95 backdrop-blur-md border border-surface-variant">
          <h4 className="font-headline-sm text-headline-sm text-night-black mb-xl">Threat Distribution</h4>
          <div className="flex-1 w-full relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECECEC" vertical={false} />
                <XAxis dataKey="name" stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f5f3f3'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="mt-xl glass-card rounded-2xl custom-shadow bg-white/95 backdrop-blur-md border border-surface-variant">
        <div className="p-lg border-b border-outline-variant flex justify-between items-center">
          <h4 className="font-headline-sm text-headline-sm text-night-black">Critical Incident Response</h4>
          <button className="text-primary font-label-md text-label-md hover:underline">View All Intelligence</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Incident ID</th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Type</th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Severity</th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Vector / Reason</th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Status</th>
                <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {alertsList && alertsList.map((alert) => (
                <tr key={alert.id} className="hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <td className="px-lg py-md font-body-sm text-body-sm font-bold">#SX-{alert.id}</td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-night-black flex items-center justify-center text-white font-bold text-xs">
                        {alert.banking_transaction ? 'TX' : 'TL'}
                      </div>
                      <span className="font-body-sm text-body-sm">
                        {alert.banking_transaction ? 'Transaction' : 'Telemetry'}
                      </span>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm border ${
                      alert.risk_score > 80 ? 'bg-error/10 text-error border-error/20' : 
                      alert.risk_score > 50 ? 'bg-orange-500/10 text-orange-700 border-orange-500/20' : 
                      'bg-blue-500/10 text-blue-700 border-blue-500/20'
                    }`}>
                      {alert.risk_score > 80 ? 'Critical' : alert.risk_score > 50 ? 'High' : 'Medium'}
                    </span>
                  </td>
                  <td className="px-lg py-md font-body-sm text-body-sm truncate max-w-[200px]">{alert.correlation_reason}</td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                      <span className={`w-2 h-2 rounded-full ${
                        alert.status === 'OPEN' ? 'bg-error animate-pulse' :
                        alert.status === 'INVESTIGATING' ? 'bg-madrid-gold' : 'bg-green-500'
                      }`}></span> {alert.status}
                    </div>
                  </td>
                  <td className="px-lg py-md font-body-sm text-body-sm font-bold">{alert.risk_score.toFixed(1)}%</td>
                </tr>
              ))}
              {(!alertsList || alertsList.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-lg py-md text-center font-body-sm text-on-surface-variant">
                    No recent incidents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
