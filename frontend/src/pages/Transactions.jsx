import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import TransactionTable from '../components/TransactionTable';
import { DollarSign, Landmark, ShieldCheck, ShieldX } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const data = await transactionAPI.list(0, 100);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCreateTransaction = async (txData) => {
    try {
      await transactionAPI.create(txData);
      fetchTransactions();
    } catch (err) {
      console.error('Error creating transaction:', err);
    }
  };

  const calculateMetrics = () => {
    const totalVolume = transactions.reduce((acc, tx) => acc + tx.amount, 0);
    const anomalousCount = transactions.filter(tx => tx.is_flagged).length;
    const normalCount = transactions.length - anomalousCount;
    return { totalVolume, anomalousCount, normalCount };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Transactions Audit Ledger</h2>
        <p className="text-xs text-gray-400 mt-0.5">Centralized record of all financial operations monitored for security indicators</p>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sub cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="glass-panel border border-gray-800 rounded-xl p-5 shadow flex items-center space-x-4">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-mono uppercase">Total Volume Monitored</p>
                <p className="text-base font-bold text-white mt-0.5">
                  {metrics.totalVolume.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
            </div>

            <div className="glass-panel border border-gray-800 rounded-xl p-5 shadow flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-mono uppercase">Legitimate Transactions</p>
                <p className="text-base font-bold text-white mt-0.5">{metrics.normalCount}</p>
              </div>
            </div>

            <div className="glass-panel border border-gray-800 rounded-xl p-5 shadow flex items-center space-x-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg">
                <ShieldX className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-mono uppercase">Flagged Fraud Anomalies</p>
                <p className="text-base font-bold text-white mt-0.5">{metrics.anomalousCount}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <TransactionTable
            transactions={transactions}
            onCreateTransaction={handleCreateTransaction}
          />
        </div>
      )}
    </div>
  );
};

export default Transactions;
