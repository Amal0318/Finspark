import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TelemetryChart = ({ logs }) => {
  // Aggregate logs by hour for the chart
  const processChartData = () => {
    if (!logs || logs.length === 0) return [];
    
    // Group logs by hour
    const hourlyCounts = {};
    
    // Initialize last 6 hours
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = `${d.getHours().toString().padStart(2, '0')}:00`;
      hourlyCounts[key] = { name: key, info: 0, warning: 0, critical: 0 };
    }

    logs.forEach(log => {
      try {
        const d = new Date(log.timestamp);
        const hourKey = `${d.getHours().toString().padStart(2, '0')}:00`;
        
        // Only count if within our tracked window
        if (hourlyCounts[hourKey]) {
          const sev = log.severity.toUpperCase();
          if (sev === 'CRITICAL' || sev === 'HIGH') {
            hourlyCounts[hourKey].critical += 1;
          } else if (sev === 'MEDIUM') {
            hourlyCounts[hourKey].warning += 1;
          } else {
            hourlyCounts[hourKey].info += 1;
          }
        }
      } catch (err) {
        // Parse error, ignore
      }
    });

    return Object.values(hourlyCounts);
  };

  const chartData = processChartData();

  return (
    <div className="w-full h-80 bg-[#0F1424] border border-gray-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
          Cybersecurity Log Activity Trends
        </h3>
        <div className="flex space-x-2 text-xs">
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full inline-block"></span>
            <span>Info</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-400">
            <span className="h-2.5 w-2.5 bg-amber-500 rounded-full inline-block"></span>
            <span>Warning</span>
          </span>
          <span className="flex items-center space-x-1 text-rose-400">
            <span className="h-2.5 w-2.5 bg-rose-500 rounded-full inline-block"></span>
            <span>Critical</span>
          </span>
        </div>
      </div>

      <div className="w-full h-64">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No active telemetry logs available to render chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '10px' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', borderColor: '#374151', color: '#F9FAFB' }}
                labelStyle={{ color: '#6B7280', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Area type="monotone" dataKey="info" stroke="#10B981" fillOpacity={1} fill="url(#colorInfo)" strokeWidth={2} name="Info logs" />
              <Area type="monotone" dataKey="warning" stroke="#F59E0B" fillOpacity={1} fill="url(#colorWarning)" strokeWidth={2} name="Warning logs" />
              <Area type="monotone" dataKey="critical" stroke="#EF4444" fillOpacity={1} fill="url(#colorCritical)" strokeWidth={2} name="Critical logs" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TelemetryChart;
