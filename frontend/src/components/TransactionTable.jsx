import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Plus, X } from 'lucide-react';

const TransactionTable = ({ transactions, onCreateTransaction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    sender_account: 'ACC-887766',
    receiver_account: 'ACC-112233',
    amount: '25000.00',
    currency: 'USD',
    transaction_type: 'transfer',
    location: 'Miami, USA',
    ip_address: '192.168.1.99',
    device_fingerprint: 'chrome-linux-v8'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateTransaction({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    setIsOpen(false);
  };

  return (
    <div className="glass-panel p-5 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
            Banking Transaction Ledger
          </h3>
          <p className="text-xs text-gray-500 mt-1">Audit of transactional flows mapped with originating device telemetry</p>
        </div>
        
        {/* Trigger Simulation Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-2 rounded-[12px] text-xs font-semibold transition-all shadow-soft"
        >
          <Plus className="h-4 w-4" />
          <span>Simulate Transaction</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1F2937] text-gray-400 font-mono border-b border-[#374151]">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Route (Sender / Receiver)</th>
              <th className="p-3">Amount</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Location</th>
              <th className="p-3 text-center">ML Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No transaction records loaded
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="p-3 font-mono text-gray-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-gray-200">{tx.sender_account}</span>
                    <span className="text-gray-500 px-2">→</span>
                    <span className="font-semibold text-cyan-400">{tx.receiver_account}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">
                    {tx.amount.toLocaleString('en-US', { style: 'currency', currency: tx.currency })}
                  </td>
                  <td className="p-3 font-mono text-gray-300">{tx.ip_address}</td>
                  <td className="p-3 text-gray-400">{tx.location || 'Unknown'}</td>
                  <td className="p-3 text-center">
                    {tx.is_flagged ? (
                      <span className="inline-flex items-center space-x-1 bg-rose-500/10 text-rose-400 px-2 py-1 rounded-full font-semibold border border-rose-500/20">
                        <ShieldAlert className="h-3 w-3" />
                        <span>ANOMALOUS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full font-semibold border border-emerald-500/20">
                        <CheckCircle className="h-3 w-3" />
                        <span>NORMAL</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simulation Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-[#374151] rounded-[16px] w-full max-w-md p-6 relative shadow-large">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Simulate Cyber-Banking Transaction</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Inject a transaction event. To trigger an **anomaly alarm**, log security telemetry on an IP address (e.g. login failures) immediately prior to firing a transaction from that same IP!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Sender Account</label>
                  <input
                    type="text"
                    required
                    value={formData.sender_account}
                    onChange={(e) => setFormData({...formData, sender_account: e.target.value})}
                    className="w-full bg-[#111827] border border-[#374151] rounded-[10px] p-2 text-[#F9FAFB] focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Receiver Account</label>
                  <input
                    type="text"
                    required
                    value={formData.receiver_account}
                    onChange={(e) => setFormData({...formData, receiver_account: e.target.value})}
                    className="w-full bg-[#111827] border border-[#374151] rounded-[10px] p-2 text-[#F9FAFB] focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-[#111827] border border-[#374151] rounded-[10px] p-2 text-[#F9FAFB] font-mono focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Transaction Type</label>
                  <select
                    value={formData.transaction_type}
                    onChange={(e) => setFormData({...formData, transaction_type: e.target.value})}
                    className="w-full bg-[#111827] border border-[#374151] rounded-[10px] p-2 text-[#F9FAFB] focus:outline-none focus:border-[#2563EB] transition-colors"
                  >
                    <option value="transfer">Transfer</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="deposit">Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Originating IP Address</label>
                <input
                  type="text"
                  required
                  value={formData.ip_address}
                  onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                  className="w-full bg-[#111827] border border-[#374151] rounded-[10px] p-2 text-[#F9FAFB] font-mono focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-[#111827] border border-[#374151] rounded-[10px] p-2 text-[#F9FAFB] focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Device Signature</label>
                  <input
                    type="text"
                    value={formData.device_fingerprint}
                    onChange={(e) => setFormData({...formData, device_fingerprint: e.target.value})}
                    className="w-full bg-[#111827] border border-[#374151] rounded-[10px] p-2 text-[#F9FAFB] focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white p-3 rounded-[12px] font-bold transition-all shadow-medium"
              >
                Incorporate Simulation Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
