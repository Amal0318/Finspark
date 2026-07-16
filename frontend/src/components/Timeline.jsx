import React from 'react';
import { Clock, ShieldAlert, CheckCircle, Info } from 'lucide-react';

const Timeline = ({ items = [] }) => {
  const getColorClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'critical':
      case 'red':
      case 'anomalous':
        return 'bg-rose-500 border-rose-400 text-rose-400';
      case 'warning':
      case 'amber':
      case 'investigating':
        return 'bg-amber-550 border-amber-400 text-amber-400';
      case 'success':
      case 'green':
      case 'resolved':
        return 'bg-emerald-500 border-emerald-400 text-emerald-400';
      default:
        return 'bg-[#2563EB] border-[#2563EB] text-[#2563EB]';
    }
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'critical':
      case 'red':
      case 'anomalous':
        return <ShieldAlert className="h-3 w-3 text-white" />;
      case 'success':
      case 'green':
      case 'resolved':
        return <CheckCircle className="h-3 w-3 text-white" />;
      default:
        return <Info className="h-3 w-3 text-white" />;
    }
  };

  return (
    <div className="relative border-l border-gray-200 dark:border-gray-800 ml-4 pl-6 space-y-6 text-xs select-none">
      {items.length === 0 ? (
        <div className="text-gray-500 py-2">No activities recorded in timeline</div>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="relative">
            {/* Timeline Dot Node */}
            <span className={`absolute -left-[31px] top-0.5 rounded-full border border-gray-300 dark:border-gray-900 p-1 flex items-center justify-center ${getColorClass(item.status)}`}>
              {getIcon(item.status)}
            </span>
            
            {/* Timeline Content Block */}
            <div className="glass-panel border border-gray-200 dark:border-gray-850 rounded-xl p-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-800 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="font-bold text-gray-200 tracking-wide text-xs">{item.title}</span>
                <span className="text-[10px] text-gray-500 font-mono flex items-center space-x-1 shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                </span>
              </div>
              <p className="text-gray-400 mt-2 leading-relaxed text-[11px]">{item.description}</p>
              {item.meta && (
                <div className="mt-2 text-[10px] font-mono text-[#06B6D4] dark:text-cyan-400 bg-gray-100 dark:bg-gray-950 px-2 py-1 rounded inline-block">
                  {item.meta}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Timeline;
