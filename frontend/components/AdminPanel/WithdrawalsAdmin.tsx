import React, { useState } from 'react';
import { X, Building, CreditCard, AlertTriangle } from 'lucide-react';
import { TransactionType } from '../../types';

interface WithdrawalsAdminProps {
  data: any;
  updateData: (updater: (prev: any) => any, persistenceInfo?: { table: string, data: any }) => void;
}

const WithdrawalsAdmin: React.FC<WithdrawalsAdminProps> = ({ data, updateData }) => {
  const [reviewWithdrawalId, setReviewWithdrawalId] = useState<string | null>(null);

  const pendingWithdrawals = data.withdrawalRequests?.filter((w: any) => w.status === 'pending') || [];
  const selectedWithdrawal = (data.withdrawalRequests || []).find((w: any) => w.id === reviewWithdrawalId);

  const handleApproveWithdrawal = (requestId: string) => {
    const request = data.withdrawalRequests.find((r: any) => r.id === requestId);
    if (!request) return;

    const isInvestmentCap = !!request.meta?.opportunityId;

    updateData(prev => ({
      ...prev,
      withdrawalRequests: prev.withdrawalRequests.map((r: any) => r.id === requestId ? { ...r, status: 'approved' } : r),
      wallets: prev.wallets.map((w: any) => {
        if (!isInvestmentCap && w.userId === request.userId) {
          return { ...w, balanceUGX: (w.balanceUGX || 0) - request.amount };
        }
        if (isInvestmentCap && w.userId === 'admin1') {
          return { ...w, balanceUGX: (w.balanceUGX || 0) - request.amount };
        }
        return w;
      }),
      transactions: [{
        id: 'tx-wd-' + Date.now(),
        walletId: isInvestmentCap ? 'admin-wallet-id' : (data.wallets.find((w: any) => w.userId === request.userId)?.id),
        amount: -request.amount,
        type: TransactionType.WITHDRAWAL,
        description: isInvestmentCap ? `Disburse Capital: ${request.meta.opportunityTitle}` : 'Wallet Disbursement',
        createdAt: new Date().toISOString()
      }, ...prev.transactions]
    }), { table: 'withdrawalRequests', data: { ...request, status: 'approved' } });

    setReviewWithdrawalId(null);
    alert("Funds disbursed successfully.");
  };

  return (
    <div className="p-0">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Requester</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Type</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Amount</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pendingWithdrawals.map((req: any) => {
            const user = data.users.find((u: any) => u.id === req.userId);
            const isInvestment = !!req.meta?.opportunityId;
            return (
              <tr key={req.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <p className="font-bold text-sm text-gray-900">{user?.fullName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{user?.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${isInvestment ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {isInvestment ? 'Capital Disbursement' : 'Wallet Withdrawal'}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-sac-green">{req.amount.toLocaleString()} UGX</td>
                <td className="px-6 py-4">
                  <button onClick={() => setReviewWithdrawalId(req.id)} className="text-sac-green bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-sac-green hover:text-white transition-all border border-emerald-100">
                    Review Request
                  </button>
                </td>
              </tr>
            );
          })}
          {pendingWithdrawals.length === 0 && (
            <tr><td colSpan={4} className="p-20 text-center text-gray-400 italic">No pending withdrawal requests.</td></tr>
          )}
        </tbody>
      </table>

      {reviewWithdrawalId && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-sac-green">Review Disbursement</h3>
              <button onClick={() => setReviewWithdrawalId(null)} className="text-gray-400 hover:text-red-500"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-sac-beige/50 rounded-2xl border border-sac-green/10">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Requested Amount</p>
                <p className="text-2xl font-black text-sac-green">{selectedWithdrawal.amount.toLocaleString()} UGX</p>
              </div>
              {selectedWithdrawal.meta?.bankDetails ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2"><Building size={14} className="text-sac-green" /> Bank Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border rounded-xl shadow-sm"><p className="text-[8px] text-gray-400 font-bold uppercase">Bank</p><p className="text-xs font-bold">{selectedWithdrawal.meta.bankDetails.bankName}</p></div>
                    <div className="p-3 bg-white border rounded-xl shadow-sm"><p className="text-[8px] text-gray-400 font-bold uppercase">Acc Holder</p><p className="text-xs font-bold">{selectedWithdrawal.meta.bankDetails.accountName}</p></div>
                  </div>
                  <div className="p-4 bg-white border rounded-xl shadow-sm">
                    <p className="text-[8px] text-gray-400 font-bold uppercase mb-1">Account Number</p>
                    <div className="flex items-center gap-2"><CreditCard size={14} className="text-sac-green" /><p className="text-sm font-black tracking-widest">{selectedWithdrawal.meta.bankDetails.accountNumber}</p></div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 text-blue-700 text-xs rounded-xl border border-blue-100 flex items-center gap-2">
                  <AlertTriangle size={16} />Standard Wallet Withdrawal (Internal Ledger)
                </div>
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setReviewWithdrawalId(null)} className="flex-1 py-3 text-gray-400 font-bold border rounded-xl">Hold Request</button>
              <button onClick={() => handleApproveWithdrawal(selectedWithdrawal.id)} className="flex-[2] py-3 bg-sac-green text-white font-bold rounded-xl shadow-lg hover:bg-emerald-800">Approve & Disburse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalsAdmin;
