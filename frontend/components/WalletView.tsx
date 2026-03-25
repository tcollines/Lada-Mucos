
import React, { useState } from 'react';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  History,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';
import { TransactionType } from '../types';

interface WalletViewProps {
  data: any;
  updateData: (updater: (prev: any) => any) => void;
}

const WalletView: React.FC<WalletViewProps> = ({ data, updateData }) => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');

  const user = data.currentUser;
  const wallet = data.wallets.find((w: any) => w.userId === user.id);
  const transactions = data.transactions
    .filter((t: any) => t.walletId === user.walletId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const myWithdrawalRequests = data.withdrawalRequests?.filter((r: any) => r.userId === user.id) || [];

  const handleDeposit = () => {
    const val = parseInt(amount);
    if (isNaN(val) || val <= 0) return;

    const newTx = {
      id: 'tx-' + Date.now(),
      walletId: wallet.id,
      amount: val,
      type: TransactionType.DEPOSIT,
      description: 'Wallet Top-up',
      createdAt: new Date().toISOString()
    };

    updateData(prev => ({
      ...prev,
      wallets: prev.wallets.map((w: any) => w.id === wallet.id ? { ...w, balanceUGX: w.balanceUGX + val } : w),
      transactions: [newTx, ...prev.transactions]
    }), [
      { table: 'wallets', data: { ...wallet, balanceUGX: wallet.balanceUGX + val } },
      { table: 'transactions', data: newTx }
    ]);
    setShowDepositModal(false);
    setAmount('');
  };

  const handleWithdrawRequest = () => {
    const val = parseInt(amount);
    if (isNaN(val) || val <= 0 || val > wallet.balanceUGX) {
      alert("Invalid amount.");
      return;
    }

    const newRequest = {
      id: 'wd-' + Date.now(),
      userId: user.id,
      amount: val,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    updateData(prev => ({
      ...prev,
      withdrawalRequests: [newRequest, ...(prev.withdrawalRequests || [])]
    }), { table: 'withdrawalRequests', data: newRequest });

    setShowWithdrawModal(false);
    setAmount('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Wallet</h2>
        <p className="text-gray-500">Manage your SACCO capital and view history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-sac-green text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <WalletIcon size={120} />
            </div>
            <p className="text-white/60 text-sm font-medium mb-1">Available Balance</p>
            <h3 className="text-3xl font-bold mb-8">{wallet?.balanceUGX.toLocaleString()} UGX</h3>

            <div className="flex gap-3 relative z-10">
              <button onClick={() => setShowDepositModal(true)} className="flex-1 bg-white text-sac-green px-4 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all">
                Deposit
              </button>
              <button onClick={() => setShowWithdrawModal(true)} className="flex-1 bg-emerald-800 text-white border border-white/20 px-4 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all">
                Withdraw
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-bold text-sm flex items-center gap-2 text-gray-500">
              <Clock size={16} className="text-sac-green" />
              Withdrawal Requests
            </h4>
            <div className="space-y-3">
              {myWithdrawalRequests.length > 0 ? myWithdrawalRequests.slice(0, 3).map((r: any) => (
                <div key={r.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-sm">{r.amount.toLocaleString()} UGX</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${r.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                      r.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {r.status}
                  </span>
                </div>
              )) : (
                <p className="text-xs text-gray-400 text-center py-4 italic">No pending requests.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <History size={20} className="text-sac-green" />
              Transactions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                          {t.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{t.description}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{new Date(t.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-500 uppercase">
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Deposit Funds</h3>
              <button onClick={() => setShowDepositModal(false)} className="text-gray-400 hover:text-black"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount (UGX)</label>
                <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold text-lg" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <button onClick={handleDeposit} className="w-full py-4 bg-sac-green text-white font-bold rounded-xl hover:bg-emerald-800 transition-all">
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
