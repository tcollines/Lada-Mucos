
import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  PlusCircle,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  X,
  FileText,
  Upload,
  Info,
  Image as ImageIcon,
  MessageCircle,
  Send,
  Download,
  Building,
  CreditCard,
  User as UserIcon
} from 'lucide-react';
import { UserRole, TransactionType, InvestmentOpportunity, Investment } from '../types';
import { PersistenceChange } from '../store';
import { uploadImage } from '../supabase';

interface InvestmentsProps {
  data: any;
  updateData: (updater: (prev: any) => any, persistenceInfo?: PersistenceChange | PersistenceChange[]) => void;
}

const Investments: React.FC<InvestmentsProps> = ({ data, updateData }) => {
  const [activeTab, setActiveTab] = useState<'available' | 'portfolio' | 'submissions'>('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvestModal, setShowInvestModal] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState('');

  const [showWithdrawModal, setShowWithdrawModal] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    branchCode: ''
  });

  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: '',
    description: '',
    roi: '',
    type: 'open' as 'open' | 'closed',
    targetAmount: '',
    participantCount: '',
    proposalFile: null as File | null,
    coverPhoto: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = data.currentUser;
  const wallet = data.wallets.find((w: any) => w.userId === user.id);

  const availableOpps = data.opportunities.filter((o: any) => o.status === 'open');
  const myInvestments = data.investments.filter((i: any) => i.userId === user.id);
  const myOpportunities = data.opportunities.filter((o: any) => o.createdBy === user.id);

  const activeSub = data.opportunities.find((o: any) => o.id === selectedSubId);

  const handleInvest = (oppId: string) => {
    const amount = parseInt(investAmount);
    const opportunity = data.opportunities.find((o: any) => o.id === oppId);
    if (!opportunity || isNaN(amount) || amount < (opportunity.minInvestment || 10000)) return;
    if (wallet.balanceUGX < amount) {
      alert("Insufficient balance");
      return;
    }

    const investmentId = 'inv-' + Date.now();
    const newInvestment: Investment = {
      id: investmentId,
      userId: user.id,
      opportunityId: oppId,
      amount,
      createdAt: new Date().toISOString()
    };
    const txId = 'tx-' + Date.now();
    const newTx = {
      id: txId,
      walletId: user.walletId,
      amount: -amount,
      type: TransactionType.INVEST,
      description: `Invest in ${opportunity.title}`,
      createdAt: new Date().toISOString()
    };
    const updatedWallet = { ...wallet, balanceUGX: wallet.balanceUGX - amount };
    const updatedOpp = { ...opportunity, raisedAmount: (opportunity.raisedAmount || 0) + amount };

    const persistenceTasks: PersistenceChange[] = [
      { table: 'investments', data: newInvestment },
      { table: 'transactions', data: newTx },
      { table: 'wallets', data: updatedWallet },
      { table: 'opportunities', data: updatedOpp }
    ];

    updateData(prev => {
      return {
        ...prev,
        investments: [...prev.investments, newInvestment],
        transactions: [newTx, ...prev.transactions],
        wallets: prev.wallets.map((w: any) => w.id === wallet.id ? updatedWallet : w),
        opportunities: prev.opportunities.map((o: any) => o.id === oppId ? updatedOpp : o)
      };
    }, persistenceTasks);

    setShowInvestModal(null);
    setInvestAmount('');
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.title || !submitForm.targetAmount) {
      alert("Please fill required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let coverPhotoUrl = 'https://picsum.photos/seed/' + Date.now() + '/800/400';
      if (submitForm.coverPhoto) {
        const uploadedUrl = await uploadImage(submitForm.coverPhoto);
        if (uploadedUrl) {
          coverPhotoUrl = uploadedUrl;
        }
      }

      const targetAmount = parseInt(submitForm.targetAmount);
      const newOppId = 'opp-' + Date.now();

      const newOpp: InvestmentOpportunity = {
        id: newOppId,
        title: submitForm.title,
        description: submitForm.description,
        goalAmount: targetAmount,
        raisedAmount: 0,
        minInvestment: submitForm.type === 'closed' ? (targetAmount / (parseInt(submitForm.participantCount) || 1)) : 10000,
        maxInvestment: targetAmount,
        status: 'pending_review',
        images: [coverPhotoUrl],
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: user.id,
        roi: submitForm.roi,
        type: submitForm.type,
        proposalUrl: submitForm.proposalFile ? 'uploaded_proposal.pdf' : 'simulated_pdf_path.pdf',
        participantCount: submitForm.type === 'closed' ? parseInt(submitForm.participantCount) : undefined,
        discussion: []
      };

      updateData(prev => ({ ...prev, opportunities: [...prev.opportunities, newOpp] }), { table: 'opportunities', data: newOpp });
      setShowSubmitModal(false);
      setSubmitForm({
        title: '', description: '', roi: '', type: 'open', targetAmount: '', participantCount: '', proposalFile: null, coverPhoto: null
      });
      setActiveTab('submissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawalRequest = (oppId: string) => {
    const opp = data.opportunities.find((o: any) => o.id === oppId);
    if (!opp) return;

    const reqId = 'wd-opp-' + Date.now();
    const newRequest = {
      id: reqId,
      userId: user.id,
      amount: opp.raisedAmount || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      meta: {
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        bankDetails
      }
    };

    updateData(prev => ({
      ...prev,
      withdrawalRequests: [newRequest, ...(prev.withdrawalRequests || [])]
    }), { table: 'withdrawalRequests', data: newRequest });

    setShowWithdrawModal(null);
    setBankDetails({ bankName: '', accountNumber: '', accountName: '', branchCode: '' });
    alert("Withdrawal request submitted for Board Review.");
  };

  const sendChatMessage = () => {
    if (!selectedSubId || !chatMessage.trim()) return;
    const newMessage = {
      userId: user.id,
      userName: user.fullName,
      text: chatMessage,
      createdAt: new Date().toISOString()
    };

    const updatedOpp = {
      ...activeSub,
      discussion: [...(activeSub.discussion || []), newMessage]
    };

    updateData(prev => ({
      ...prev,
      opportunities: prev.opportunities.map((o: any) =>
        o.id === selectedSubId ? updatedOpp : o
      )
    }), { table: 'opportunities', data: updatedOpp });
    setChatMessage('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-sac-green">Investments</h2>
          <p className="text-gray-500">Grow your wealth with vetted opportunities.</p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="bg-sac-green text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/10"
        >
          <PlusCircle size={20} />
          <span>Submit Opportunity</span>
        </button>
      </div>

      <div className="flex gap-1 bg-white p-1 rounded-xl w-fit shadow-sm border">
        {(['available', 'portfolio', 'submissions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6 py-2 rounded-lg text-sm font-semibold transition-all
              ${activeTab === tab ? 'bg-sac-green text-white shadow-sm' : 'text-gray-500 hover:text-sac-green hover:bg-emerald-50'}
            `}
          >
            {tab === 'available' ? 'Available' : tab === 'portfolio' ? 'My Portfolio' : 'My Submissions'}
          </button>
        ))}
      </div>

      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableOpps.map((opp: any) => (
            <div key={opp.id} className="bg-white rounded-2xl overflow-hidden border shadow-sm group hover:shadow-md transition-shadow">
              <div className="h-48 relative overflow-hidden">
                <img src={opp.images?.[0] || 'https://picsum.photos/seed/inv/800/400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-sac-green shadow-sm">
                  {opp.type === 'closed' ? 'Closed Pool' : 'Open Investment'}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold truncate pr-2">{opp.title}</h3>
                  {opp.roi && <span className="text-sac-green font-bold text-[10px] bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{opp.roi} ROI</span>}
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{opp.description}</p>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>PROGRESS</span>
                    <span>{Math.round(((opp.raisedAmount || 0) / opp.goalAmount) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sac-green transition-all" style={{ width: `${Math.min(100, ((opp.raisedAmount || 0) / opp.goalAmount) * 100)}%` }}></div>
                  </div>
                  <button onClick={() => setShowInvestModal(opp.id)} className="w-full py-3 bg-sac-green text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors">
                    Invest Now <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {availableOpps.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 italic">No available investments.</div>}
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Opportunity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount Invested</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myInvestments.map((inv: any) => {
                const opp = data.opportunities.find((o: any) => o.id === inv.opportunityId);
                return (
                  <tr key={inv.id}>
                    <td className="px-6 py-4 font-bold text-sm">{opp?.title}</td>
                    <td className="px-6 py-4 font-bold text-sac-green">{inv.amount.toLocaleString()} UGX</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase border border-green-100">Active</span></td>
                  </tr>
                );
              })}
              {myInvestments.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">No portfolio found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myOpportunities.map((opp: any) => {
            const isFunded = (opp.raisedAmount || 0) >= opp.goalAmount;
            const hasPendingWithdrawal = (data.withdrawalRequests || []).some((r: any) => r.meta?.opportunityId === opp.id && r.status === 'pending');

            return (
              <div key={opp.id} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{opp.title}</h3>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${opp.status === 'pending_review' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      opp.status === 'open' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                    {opp.status?.replace('_', ' ') || 'pending_review'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2">{opp.description}</p>

                {opp.status === 'rejected' && opp.rejectionReason && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Feedback from Board</p>
                    <p className="text-xs text-red-700 italic">"{opp.rejectionReason}"</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>PROGRESS: {(opp.raisedAmount || 0).toLocaleString()} / {opp.goalAmount.toLocaleString()} UGX</span>
                    <span>{Math.round(((opp.raisedAmount || 0) / opp.goalAmount) * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sac-green" style={{ width: `${Math.min(100, ((opp.raisedAmount || 0) / opp.goalAmount) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => setSelectedSubId(opp.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sac-green text-xs font-bold bg-emerald-50 px-3 py-2.5 rounded-lg hover:bg-sac-green hover:text-white transition-all border border-emerald-100"
                  >
                    <MessageCircle size={14} /> Discussion
                  </button>

                  {isFunded && !hasPendingWithdrawal && (
                    <button
                      onClick={() => setShowWithdrawModal(opp.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-sac-green text-white text-xs font-bold px-3 py-2.5 rounded-lg hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/10"
                    >
                      <Download size={14} /> Withdraw Funds
                    </button>
                  )}

                  {hasPendingWithdrawal && (
                    <div className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-2.5 rounded-lg border border-amber-100 italic">
                      Withdrawal Pending Review
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {myOpportunities.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 italic">No submissions yet.</div>}
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-sac-green">Withdraw Funded Capital</h3>
              <button onClick={() => setShowWithdrawModal(null)} className="text-gray-400 hover:text-red-500"><X /></button>
            </div>
            <p className="text-sm text-gray-500 mb-6">Your project is fully funded! Please provide your bank details for the Board to disburse the capital.</p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Bank Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" className="w-full bg-gray-50 border pl-10 p-3 rounded-xl outline-none text-sm" placeholder="e.g. Stanbic Bank" value={bankDetails.bankName} onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Account Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" className="w-full bg-gray-50 border pl-10 p-3 rounded-xl outline-none text-sm" placeholder="Account Holder Name" value={bankDetails.accountName} onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Account Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" className="w-full bg-gray-50 border pl-10 p-3 rounded-xl outline-none text-sm" placeholder="XXXX-XXXX" value={bankDetails.accountNumber} onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Branch Code</label>
                  <input type="text" className="w-full bg-gray-50 border p-3 rounded-xl outline-none text-sm" placeholder="Optional" value={bankDetails.branchCode} onChange={e => setBankDetails({ ...bankDetails, branchCode: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowWithdrawModal(null)} className="flex-1 py-3 text-gray-400 font-bold border rounded-xl">Cancel</button>
                <button onClick={() => handleWithdrawalRequest(showWithdrawModal)} className="flex-1 py-3 bg-sac-green text-white font-bold rounded-xl shadow-lg">Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSubId && activeSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sac-green flex items-center justify-center text-white"><MessageCircle size={22} /></div>
                <div><h3 className="font-bold text-gray-900">{activeSub.title}</h3><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Project Q&A with Board</p></div>
              </div>
              <button onClick={() => setSelectedSubId(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3"><h4 className="text-xs font-bold text-sac-green uppercase tracking-widest">Proposal Details</h4><p className="text-sm text-gray-700 leading-relaxed">{activeSub.description}</p></div>
              <div className="space-y-4">
                {(activeSub.discussion || []).map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.userId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] space-y-1 ${msg.userId === user.id ? 'items-end' : 'items-start'}`}>
                      <p className="text-[9px] font-bold text-gray-400 uppercase px-2">{msg.userName}</p>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.userId === user.id ? 'bg-sac-green text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none border'}`}>{msg.text}</div>
                      <p className="text-[8px] text-gray-400 px-2">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t bg-white"><div className="flex gap-2 bg-gray-50 p-2 rounded-2xl border"><input type="text" placeholder="Ask a question..." className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()} /><button onClick={sendChatMessage} className="bg-sac-green text-white p-2.5 rounded-xl hover:bg-emerald-800 transition-colors"><Send size={18} /></button></div></div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-sac-green">Submit Project Proposal</h3>
                <p className="text-xs text-gray-500 font-medium">Share your business idea for board review.</p>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Project Title"
                    required
                    value={submitForm.title}
                    onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })}
                  />
                  <Input
                    label="Expected ROI"
                    placeholder="e.g. 15% yearly"
                    value={submitForm.roi}
                    onChange={e => setSubmitForm({ ...submitForm, roi: e.target.value })}
                  />
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Investment Type</label>
                    <select
                      className="w-full bg-gray-50 border p-3 rounded-xl outline-none text-sm transition-all focus:ring-1 focus:ring-sac-green"
                      value={submitForm.type}
                      onChange={e => setSubmitForm({ ...submitForm, type: e.target.value as any })}
                    >
                      <option value="open">Open (Any amount)</option>
                      <option value="closed">Closed (Fixed participants)</option>
                    </select>
                  </div>
                  {submitForm.type === 'closed' && (
                    <Input
                      label="Number of Participants"
                      type="number"
                      placeholder="e.g. 10"
                      value={submitForm.participantCount}
                      onChange={e => setSubmitForm({ ...submitForm, participantCount: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-4 flex flex-col">
                  <Input
                    label="Target Amount (UGX)"
                    type="number"
                    required
                    value={submitForm.targetAmount}
                    onChange={e => setSubmitForm({ ...submitForm, targetAmount: e.target.value })}
                  />
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Brief Details</label>
                    <textarea
                      required
                      className="w-full bg-gray-50 border p-3 rounded-xl outline-none text-sm min-h-[140px] resize-none focus:ring-1 focus:ring-sac-green"
                      value={submitForm.description}
                      onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Proposal PDF</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center h-32 hover:border-sac-green cursor-pointer relative">
                    <input type="file" accept=".pdf" className="absolute inset-0 opacity-0" onChange={e => setSubmitForm({ ...submitForm, proposalFile: e.target.files?.[0] || null })} />
                    <FileText size={24} className="text-gray-300 mb-1" />
                    <p className="text-[10px] font-bold text-gray-500 truncate w-full text-center">
                      {submitForm.proposalFile ? submitForm.proposalFile.name : 'Upload PDF'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Cover Photo</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center h-32 hover:border-sac-green cursor-pointer relative">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0" onChange={e => setSubmitForm({ ...submitForm, coverPhoto: e.target.files?.[0] || null })} />
                    <ImageIcon size={24} className="text-gray-300 mb-1" />
                    <p className="text-[10px] font-bold text-gray-500 truncate w-full text-center">
                      {submitForm.coverPhoto ? submitForm.coverPhoto.name : 'Upload Image'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 border-t">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 text-gray-400 font-bold border border-gray-100 rounded-xl hover:bg-gray-50" disabled={isSubmitting}>Discard</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 bg-sac-green text-white font-bold rounded-xl shadow-lg hover:bg-emerald-800 transition-all disabled:opacity-50">
                  {isSubmitting ? 'Uploading & Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Confirm Investment</h3>
            <p className="text-sm text-gray-500 mb-6">Enter amount you wish to contribute from your wallet.</p>
            <div className="space-y-4">
              <input type="number" placeholder="Amount in UGX" className="w-full bg-gray-50 border p-4 rounded-xl outline-none font-bold text-lg" value={investAmount} onChange={e => setInvestAmount(e.target.value)} /><div className="bg-emerald-50 p-4 rounded-xl flex gap-3 border border-emerald-100"><AlertCircle size={20} className="text-sac-green shrink-0" /><p className="text-[10px] text-sac-green font-medium leading-relaxed">By investing, funds are moved to the cooperative pool. ROI is paid upon project completion.</p></div>
              <div className="flex gap-3 pt-4"><button onClick={() => setShowInvestModal(null)} className="flex-1 py-3 text-gray-400 font-bold border rounded-xl">Cancel</button><button onClick={() => handleInvest(showInvestModal)} className="flex-1 py-3 bg-sac-green text-white font-bold rounded-xl shadow-lg">Confirm</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Input: React.FC<any> = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{label}</label>
    <input className="w-full bg-gray-50 border p-3 rounded-xl outline-none text-sm transition-all focus:ring-1 focus:ring-sac-green" {...props} />
  </div>
);

export default Investments;
