import React, { useState } from 'react';
import { Plus, Building, Percent, Clock, X } from 'lucide-react';
import { LoanOffer } from '../../types';

interface LoansAdminProps {
  data: any;
  updateData: (updater: (prev: any) => any, persistenceInfo?: { table: string, data: any }) => void;
}

const LoansAdmin: React.FC<LoansAdminProps> = ({ data, updateData }) => {
  const [showCoopOfferModal, setShowCoopOfferModal] = useState(false);
  const [coopOfferForm, setCoopOfferForm] = useState({
    minAmount: '',
    maxAmount: '',
    interest: '',
    duration: '12'
  });

  const p2pOffers = data.loanOffers.filter((o: any) => o.lenderId !== 'admin1');
  const coopOffers = data.loanOffers.filter((o: any) => o.lenderId === 'admin1');

  const handleCreateCoopOffer = () => {
    const min = parseInt(coopOfferForm.minAmount);
    const max = parseInt(coopOfferForm.maxAmount);
    const interest = parseFloat(coopOfferForm.interest);
    const duration = parseInt(coopOfferForm.duration);

    if (isNaN(min) || isNaN(max) || isNaN(interest) || min <= 0 || max < min) {
      alert("Please provide valid amounts and interest.");
      return;
    }

    const offerId = 'coop-off-' + Date.now();
    const newOffer: LoanOffer = {
      id: offerId,
      lenderId: 'admin1',
      minAmount: min,
      maxAmount: max,
      interestPercent: interest,
      durationMonths: duration,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    updateData(prev => ({
      ...prev,
      loanOffers: [newOffer, ...prev.loanOffers]
    }), { table: 'loanOffers', data: newOffer });

    setShowCoopOfferModal(false);
    setCoopOfferForm({ minAmount: '', maxAmount: '', interest: '', duration: '12' });
    alert("Official Cooperative Loan Offer created successfully!");
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-gray-900">Loan Management</h3>
        <button
          onClick={() => setShowCoopOfferModal(true)}
          className="bg-sac-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/10"
        >
          <Plus size={18} />
          Add Cooperative Loan Offer
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Official Cooperative Offers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coopOffers.map((offer: any) => (
              <div key={offer.id} className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Building size={18} className="text-sac-green" />
                    <p className="font-bold text-sac-green">Official SACCO Offer</p>
                  </div>
                  <span className="text-lg font-black text-sac-green">{offer.interestPercent}%</span>
                </div>
                <div className="space-y-2 text-xs text-gray-600">
                  <p>Range: <span className="font-bold">{offer.minAmount.toLocaleString()} - {offer.maxAmount.toLocaleString()} UGX</span></p>
                  <p>Duration: <span className="font-bold">{offer.durationMonths} Months</span></p>
                </div>
              </div>
            ))}
            {coopOffers.length === 0 && <p className="text-sm text-gray-400 italic">No official offers created.</p>}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Member P2P Offers</h4>
          <div className="bg-white rounded-2xl border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Lender</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Amount Range</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Interest</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {p2pOffers.map((offer: any) => {
                  const lender = data.users.find((u: any) => u.id === offer.lenderId);
                  return (
                    <tr key={offer.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{lender?.fullName || 'Member'}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{lender?.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        {offer.minAmount.toLocaleString()} - {offer.maxAmount.toLocaleString()} UGX
                      </td>
                      <td className="px-6 py-4 font-bold text-sac-green">
                        {offer.interestPercent}%
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase border border-green-100">
                          {offer.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {p2pOffers.length === 0 && (
                  <tr><td colSpan={4} className="p-12 text-center text-gray-400 italic">No member P2P offers available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCoopOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative">
            <button onClick={() => setShowCoopOfferModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500">
              <X size={24} />
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-sac-green">New Cooperative Offer</h3>
              <p className="text-gray-500 text-sm">Create an official SACCO loan offer.</p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Min Amount (UGX)</label>
                  <input type="number" placeholder="e.g. 100,000" className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-1 focus:ring-sac-green text-sm font-bold" value={coopOfferForm.minAmount} onChange={(e) => setCoopOfferForm({ ...coopOfferForm, minAmount: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Max Amount (UGX)</label>
                  <input type="number" placeholder="e.g. 10,000,000" className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-1 focus:ring-sac-green text-sm font-bold" value={coopOfferForm.maxAmount} onChange={(e) => setCoopOfferForm({ ...coopOfferForm, maxAmount: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Interest Rate (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input type="number" placeholder="e.g. 10" className="w-full bg-gray-50 border pl-9 p-3 rounded-xl outline-none text-sm font-bold" value={coopOfferForm.interest} onChange={(e) => setCoopOfferForm({ ...coopOfferForm, interest: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Default Duration</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <select className="w-full bg-gray-50 border pl-9 p-3 rounded-xl outline-none text-sm font-bold appearance-none" value={coopOfferForm.duration} onChange={(e) => setCoopOfferForm({ ...coopOfferForm, duration: e.target.value })}>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                      <option value="24">24 Months</option>
                      <option value="36">36 Months</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button onClick={() => setShowCoopOfferModal(false)} className="flex-1 py-4 text-gray-400 font-bold border rounded-2xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleCreateCoopOffer} className="flex-[2] bg-sac-green text-white py-4 rounded-2xl font-bold hover:bg-emerald-800 flex items-center justify-center gap-2">Create Offer <Plus size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansAdmin;
