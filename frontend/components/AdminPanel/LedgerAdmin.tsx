import React, { useState } from 'react';
import { Wallet, TrendingUp, Building2, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

interface LedgerAdminProps {
  data: any;
}

const LedgerAdmin: React.FC<LedgerAdminProps> = ({ data }) => {
  const [ledgerFilter, setLedgerFilter] = useState('all');

  const adminWallet = data.wallets.find((w: any) => w.userId === 'admin1');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">System Transactions Ledger</h3>
        <div className="flex gap-2">
          <select
            value={ledgerFilter}
            onChange={(e) => setLedgerFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-600 outline-none hover:bg-white transition-colors cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="invest">Investments</option>
            <option value="fee">Fees</option>
            <option value="membership_fee">Membership Fees</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 transition-all hover:bg-emerald-100/50">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Wallet size={12} /> System Liquidity</p>
          <p className="text-2xl font-black text-emerald-900">
            {data.wallets.reduce((acc: number, w: any) => acc + (w.balanceUGX > 0 ? w.balanceUGX : 0), 0).toLocaleString()} <span className="text-sm">UGX</span>
          </p>
          <p className="text-[10px] text-emerald-600 font-medium mt-1 uppercase tracking-tight">Total sum of all members' current balances</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 transition-all hover:bg-blue-100/50">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><TrendingUp size={12} /> Transaction Volume</p>
          <p className="text-2xl font-black text-blue-900">
            {data.transactions.reduce((acc: number, t: any) => acc + Math.abs(t.amount || 0), 0).toLocaleString()} <span className="text-sm">UGX</span>
          </p>
          <p className="text-[10px] text-blue-600 font-medium mt-1 uppercase tracking-tight">Net sum of all historical transaction values</p>
        </div>
        <div className="bg-sac-beige border border-sac-green/10 rounded-xl p-4 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><Building2 size={80} /></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-sac-green uppercase tracking-widest mb-1 flex items-center gap-1.5"><Building2 size={12} /> Cooperative Reserves</p>
            <p className="text-2xl font-black text-sac-green">
              {(adminWallet?.balanceUGX || 0).toLocaleString()} <span className="text-sm">UGX</span>
            </p>
            <p className="text-[10px] text-sac-green/70 font-medium mt-1 uppercase tracking-tight">Current LADA SACCO Administrative Balance</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4 border-b">Member / Wallet</th>
                <th className="px-6 py-4 border-b">Transaction Info</th>
                <th className="px-6 py-4 border-b text-center">Type</th>
                <th className="px-6 py-4 border-b text-right">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.transactions
                .filter((t: any) => ledgerFilter === 'all' || t.type === ledgerFilter)
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((t: any) => {
                  const walletOwner = data.users.find((u: any) => u.walletId === t.walletId);
                  const isPositive = t.amount > 0;
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        {walletOwner ? (
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${walletOwner.role === 'ADMIN' ? 'bg-sac-green text-white' : 'bg-gray-100 text-gray-600'}`}>
                              {walletOwner.role === 'ADMIN' ? <Building2 size={14} /> : walletOwner.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${walletOwner.role === 'ADMIN' ? 'text-sac-green' : 'text-gray-900'}`}>{walletOwner.role === 'ADMIN' ? 'Admin / Cooperative' : walletOwner.fullName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">{t.walletId.substring(0, 8)}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-xs text-gray-300">?</div>
                            <div>
                              <p className="text-sm font-bold text-gray-400 italic">Unknown Wallet</p>
                              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest font-mono">{t.walletId.substring(0, 8)}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">{t.description}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex gap-2">
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                          <span className="text-gray-300">•</span>
                          <span>{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          t.type === 'deposit' ? 'bg-green-100 text-green-700' :
                          t.type === 'withdrawal' ? 'bg-amber-100 text-amber-700' :
                          t.type === 'invest' ? 'bg-blue-100 text-blue-700' :
                          t.type === 'fee' || t.type === 'membership_fee' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {t.type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${isPositive ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-400'}`}>
                            {isPositive ? <ArrowDownLeft size={12} strokeWidth={3} /> : <ArrowUpRight size={12} strokeWidth={3} />}
                          </div>
                          <p className={`text-base font-black tracking-tight ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{t.amount?.toLocaleString() || 0}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {data.transactions.filter((t: any) => ledgerFilter === 'all' || t.type === ledgerFilter).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400 italic border-t border-gray-50">
                    <History size={32} className="mx-auto mb-3 opacity-20" />
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LedgerAdmin;
