import React, { useState } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const SearchFilter = ({ onSearch, showStatus = true, showSeverity = true }) => {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const handleApply = (e) => {
    if (e) e.preventDefault();
    onSearch({ query, severity, status });
  };

  const handleReset = () => {
    setQuery('');
    setSeverity('ALL');
    setStatus('ALL');
    onSearch({ query: '', severity: 'ALL', status: 'ALL' });
  };

  return (
    <form onSubmit={handleApply} className="bg-[#1F2937] border border-[#374151] rounded-[16px] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs shadow-soft">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Filter by IP, device name, account number or event pattern..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#111827] border border-[#374151] rounded-[10px] py-2 pl-10 pr-4 text-[#F9FAFB] focus:outline-none focus:border-[#2563EB] transition-colors"
        />
      </div>

      {/* Filter Parameters */}
      <div className="flex flex-wrap items-center gap-2">
        {showSeverity && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 font-mono text-[10px] uppercase">Severity</span>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="bg-[#111827] border border-[#374151] rounded-[10px] p-2 text-[#F9FAFB] focus:outline-none focus:border-[#2563EB] transition-colors"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        )}

        {showStatus && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 font-mono text-[10px] uppercase">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-[#111827] border border-[#374151] rounded-[10px] p-2 text-[#F9FAFB] focus:outline-none focus:border-[#2563EB] transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center space-x-2 pl-2">
          <button
            type="submit"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-4 py-2 rounded-[12px] transition-colors"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-[#1F2937] hover:bg-[#374151] text-[#F9FAFB] p-2 rounded-[12px] transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchFilter;
