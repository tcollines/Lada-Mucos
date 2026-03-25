
import React, { useState, useMemo } from 'react';
import {
  HandCoins,
  Users,
  Building2,
  Plus,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  X,
  Clock,
  Percent,
  ArrowRight
} from 'lucide-react';
import { P2P_SERVICE_FEE_PERCENT, MEMBERSHIP_FEE_UGX } from '../constants';
import { TransactionType, LoanOffer } from '../types';

interface LoansProps {
  data: any;
  updateData: (updater: (prev: any) => any, persistenceInfo?: { table: string, data: any }) => void;
}

const Loans: React.FC<LoansProps> = ({ data, updateData }) => {
  const [loanType, setLoanType] = useState<'coop' | 'p2p'>('coop');
  const [showOfferModal, setShowOfferModal] = useState(false);

  const [offerForm, setOfferForm] = useState({
    minAmount: '',
    maxAmount: '',
    interest: '',
    duration: '6'
  });

  const user = data.currentUser;

  const eligibility = useMemo(() => {
    const hasMembership = user.membershipPaid;
    const hasInvestments = data.investments.some((i: any) => i.userId === user.id);
    const isComplete = user.phone && user.nin && user.address;

    return {
      qualified: hasMembership && hasInvestments && isComplete,
      checks: [
        { label: 'Membership Fee Paid', status: hasMembership },
        { label: 'Active Investment on Platform', status: hasInvestments },
        { label: 'Profile 100% Complete', status: isComplete }
      ]
    };
  }, [user, data.investments]);

  const handlePostOffer = () => {
    const min = parseInt(offerForm.minAmount);
    const max = parseInt(offerForm.maxAmount);
    const interest = parseFloat(offerForm.interest);
    const duration = parseInt(offerForm.duration);

    if (isNaN(min) || isNaN(max) || isNaN(interest) || min <= 0 || max < min) {
      alert("Please provide valid amounts and interest.");
      return;
    }

    const offerId = 'off-' + Date.now();
    const newOffer: LoanOffer = {
      id: offerId,
      lenderId: user.id,
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

    setShowOfferModal(false);
    setOfferForm({ minAmount: '', maxAmount: '', interest: '', duration: '6' });
    alert("P2P Loan Offer posted successfully!");
  };

  const activeP2POffers = data.loanOffers.filter((o: any) => o.status === 'active' && o.lenderId !== 'admin1');
  const activeCoopOffers = data.loanOffers.filter((o: any) => o.status === 'active' && o.lenderId === 'admin1');

  const handleRequestLoan = (offer: any) => {
    if (!eligibility.qualified) return;

    // In a real app we'd open a modal to enter the exact amount.
    // For now we'll just request the max amount to make it work quickly.
    const loanReqId = 'req-' + Date.now();
    const newRequest = {
      id: loanReqId,
      offerId: offer.id,
      borrowerId: user.id,
      amount: offer.maxAmount,
      duration: offer.durationMonths,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    updateData(prev => ({
      ...prev,
      loanRequests: prev.loanRequests ? [newRequest, ...prev.loanRequests] : [newRequest]
    }), { table: 'loanRequests', data: newRequest });

    alert(`Successfully applied for a loan of ${offer.maxAmount.toLocaleString()} UGX. Pending approval.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sac-green">Loans</h2>
          <p className="text-gray-500">Flexible financial solutions for our members.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border">
          <ShieldCheck className="text-sac-green" size={20} />
          <div>
            <span className="block text-[10px] text-gray-400 uppercase font-bold">Credit Score</span>
            <span className="text-lg font-bold">{user.creditScore}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-sac-green" />
              Loan Eligibility
            </h3>
            <div className="space-y-4">
              {eligibility.checks.map((check, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{check.label}</span>
                  {check.status ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <AlertCircle size={18} className="text-red-400" />
                  )}
                </div>
              ))}
              <div className={`mt-6 p-4 rounded-xl text-center ${eligibility.qualified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1">Status</p>
                <p className="font-bold">{eligibility.qualified ? 'ELIGIBLE TO APPLY' : 'NOT YET ELIGIBLE'}</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 text-white p-6 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Grow Together</h3>
              <p className="text-emerald-100 text-sm mb-4">Lend your extra funds to other members and earn interest while helping the community.</p>
              <button
                onClick={() => setShowOfferModal(true)}
                className="bg-white text-sac-green px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-emerald-50 transition-colors"
              >
                Create P2P Offer
              </button>
            </div>
            <TrendingUp className="absolute -bottom-4 -right-4 text-white/5" size={140} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex p-1 bg-white border rounded-xl w-fit">
            <button
              onClick={() => setLoanType('coop')}
              className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${loanType === 'coop' ? 'bg-sac-green text-white' : 'text-gray-400 hover:text-sac-green'}`}
            >
              <Building2 size={18} />
              Cooperative Loan
            </button>
            <button
              onClick={() => setLoanType('p2p')}
              className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${loanType === 'p2p' ? 'bg-sac-green text-white' : 'text-gray-400 hover:text-sac-green'}`}
            >
              <Users size={18} />
              Peer-to-Peer (P2P)
            </button>
          </div>

          {loanType === 'p2p' && activeP2POffers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-300">
              {activeP2POffers.map((offer: any) => {
                const lender = data.users.find((u: any) => u.id === offer.lenderId);
                return (
                  <div key={offer.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:border-sac-green transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sac-beige flex items-center justify-center text-sac-green font-bold">
                          {lender?.fullName?.charAt(0) || 'L'}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{lender?.fullName || 'Anonymous Lender'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Credit: {lender?.creditScore || 0}</p>
                        </div>
                      </div>
                      <span className="text-sac-green font-black text-lg">{offer.interestPercent}% <span className="text-[10px] font-bold text-gray-400">APR</span></span>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Available Range</span>
                        <span className="font-bold">{offer.minAmount.toLocaleString()} - {offer.maxAmount.toLocaleString()} UGX</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Max Duration</span>
                        <span className="font-bold">{offer.durationMonths} Months</span>
                      </div>
                    </div>
                    <button
                      disabled={!eligibility.qualified}
                      onClick={() => handleRequestLoan(offer)}
                      className="w-full py-2.5 bg-sac-beige text-sac-green font-bold rounded-xl hover:bg-sac-green hover:text-white transition-all text-sm border border-sac-green/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Request Loan
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {loanType === 'coop' && (
            <div className="space-y-4">
              {activeCoopOffers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-300">
                  {activeCoopOffers.map((offer: any) => (
                    <div key={offer.id} className="bg-white p-6 rounded-2xl border border-sac-green/10 shadow-sm relative overflow-hidden group hover:border-sac-green transition-all">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Building2 size={80} />
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="px-3 py-1 bg-emerald-50 text-sac-green text-[10px] font-black uppercase rounded-lg border border-emerald-100">Official Sacco Offer</div>
                          <span className="text-2xl font-black text-sac-green">{offer.interestPercent}% <span className="text-[10px] font-bold text-gray-400">Fixed</span></span>
                        </div>
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Limit</span>
                            <span className="font-bold">Up to {offer.maxAmount.toLocaleString()} UGX</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Term</span>
                            <span className="font-bold">{offer.durationMonths} Months</span>
                          </div>
                        </div>
                        <button
                          disabled={!eligibility.qualified}
                          onClick={() => handleRequestLoan(offer)}
                          className="w-full py-3 bg-sac-green text-white font-bold rounded-xl hover:bg-emerald-800 transition-all text-sm shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Apply Now <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border shadow-sm p-8 text-center py-20">
                  <Building2 size={48} className="text-gray-200 mx-auto mb-4" />
                  <h4 className="text-xl font-bold mb-2">Standard Cooperative Loan</h4>
                  <p className="text-gray-500 max-w-sm mx-auto mb-8">
                    Borrow directly from the SACCO funds at fixed community interest rates.
                  </p>
                  <button
                    disabled={!eligibility.qualified}
                    className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-lg ${eligibility.qualified
                        ? 'bg-sac-green text-white hover:bg-emerald-800 shadow-emerald-900/20'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {eligibility.qualified ? 'Start Application' : 'Meet Requirements to Apply'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">My Loan History</h3>
              <span className="text-xs text-sac-green font-bold">Total Active: 0</span>
            </div>
            <div className="p-12 text-center text-gray-400 italic">
              No loan records found.
            </div>
          </div>
        </div>
      </div>

      {/* Create P2P Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative">
            <button
              onClick={() => setShowOfferModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-sac-green">Lend Capital</h3>
              <p className="text-gray-500 text-sm">Set your terms for community members.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Min Amount (UGX)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50,000"
                    className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-1 focus:ring-sac-green text-sm font-bold"
                    value={offerForm.minAmount}
                    onChange={(e) => setOfferForm({ ...offerForm, minAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Max Amount (UGX)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5,000,000"
                    className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:ring-1 focus:ring-sac-green text-sm font-bold"
                    value={offerForm.maxAmount}
                    onChange={(e) => setOfferForm({ ...offerForm, maxAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Interest Rate (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      className="w-full bg-gray-50 border pl-9 p-3 rounded-xl outline-none focus:ring-1 focus:ring-sac-green text-sm font-bold"
                      value={offerForm.interest}
                      onChange={(e) => setOfferForm({ ...offerForm, interest: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Duration (Months)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <select
                      className="w-full bg-gray-50 border pl-9 p-3 rounded-xl outline-none focus:ring-1 focus:ring-sac-green text-sm font-bold appearance-none"
                      value={offerForm.duration}
                      onChange={(e) => setOfferForm({ ...offerForm, duration: e.target.value })}
                    >
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                      <option value="24">24 Months</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
                <AlertCircle size={20} className="text-sac-green shrink-0" />
                <p className="text-[10px] text-sac-green font-medium leading-relaxed">
                  A <span className="font-bold">{P2P_SERVICE_FEE_PERCENT}% service fee</span> is charged by the SACCO upon successful funding of a borrower. Funds will be locked once requested.
                </p>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 py-4 text-gray-400 font-bold border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handlePostOffer}
                  className="flex-[2] bg-sac-green text-white py-4 rounded-2xl font-bold hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2"
                >
                  Post Offer
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
