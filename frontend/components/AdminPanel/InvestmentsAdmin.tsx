import React, { useState } from 'react';
import { Eye, AlertTriangle, MessageCircle, Check, X, Send, FileText } from 'lucide-react';

interface InvestmentsAdminProps {
  data: any;
  updateData: (updater: (prev: any) => any, persistenceInfo?: { table: string, data: any }) => void;
}

const InvestmentsAdmin: React.FC<InvestmentsAdminProps> = ({ data, updateData }) => {
  const [reviewOppId, setReviewOppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  const allOpps = data.opportunities;
  const selectedOpp = data.opportunities.find((o: any) => o.id === reviewOppId);

  const handleApproveInvestment = () => {
    if (!reviewOppId) return;
    const updatedOpp = { ...selectedOpp, status: 'open', rejectionReason: '' };
    updateData(prev => ({
      ...prev,
      opportunities: prev.opportunities.map((o: any) => o.id === reviewOppId ? updatedOpp : o)
    }), { table: 'opportunities', data: updatedOpp });
    setReviewOppId(null);
  };

  const handleRejectInvestment = () => {
    if (!reviewOppId || !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    const updatedOpp = { ...selectedOpp, status: 'rejected', rejectionReason };
    updateData(prev => ({
      ...prev,
      opportunities: prev.opportunities.map((o: any) => o.id === reviewOppId ? updatedOpp : o)
    }), { table: 'opportunities', data: updatedOpp });
    setReviewOppId(null);
    setRejectionReason('');
  };

  const sendDiscussionMessage = () => {
    if (!reviewOppId || !chatMessage.trim()) return;
    const newMessage = {
      userId: 'admin1',
      userName: 'Board Admin',
      text: chatMessage,
      createdAt: new Date().toISOString()
    };
    const updatedOpp = {
      ...selectedOpp,
      discussion: [...(selectedOpp.discussion || []), newMessage]
    };
    updateData(prev => ({
      ...prev,
      opportunities: prev.opportunities.map((o: any) => o.id === reviewOppId ? updatedOpp : o)
    }), { table: 'opportunities', data: updatedOpp });
    setChatMessage('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Opportunity Tracking</h3>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div> Pending Review
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
            <div className="w-2 h-2 rounded-full bg-sac-green"></div> Funded/Open
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allOpps.map((opp: any) => {
          const isCompleted = (opp.raisedAmount || 0) >= opp.goalAmount;
          const hasWithdrawalReq = (data.withdrawalRequests || []).some((r: any) => r.meta?.opportunityId === opp.id && r.status === 'pending');
          return (
            <div key={opp.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col group ${isCompleted ? 'border-amber-200' : 'border-gray-100'}`}>
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-900 line-clamp-1">{opp.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${opp.status === 'pending_review' ? 'bg-amber-100 text-amber-600' : opp.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {opp.status?.replace('_', ' ') || 'pending_review'}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-tighter">
                      <span>Capital Raised</span>
                      <span className={isCompleted ? 'text-sac-green' : ''}>{Math.round(((opp.raisedAmount || 0) / opp.goalAmount) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${isCompleted ? 'bg-sac-green' : 'bg-emerald-400'}`} style={{ width: `${Math.min(100, ((opp.raisedAmount || 0) / opp.goalAmount) * 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center py-2 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">Raised</p>
                      <p className="text-xs font-black">{(opp.raisedAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">Target</p>
                      <p className="text-xs font-black">{opp.goalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  {isCompleted && (
                    <div className={`p-2 rounded-lg text-center flex items-center justify-center gap-2 ${hasWithdrawalReq ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                      <AlertTriangle size={14} /><span className="text-[9px] font-bold uppercase">{hasWithdrawalReq ? 'Withdrawal Pending' : 'Fully Funded'}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setReviewOppId(opp.id)} className="w-full mt-4 py-2 bg-white text-sac-green font-bold text-xs rounded-xl border border-sac-green/10 hover:bg-sac-green hover:text-white transition-all flex items-center justify-center gap-2">
                  <Eye size={14} /> View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {reviewOppId && selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]">
            <div className="lg:w-2/5 p-8 border-r overflow-y-auto space-y-8 bg-gray-50/40">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">{selectedOpp.title}</h3>
                  <p className="text-xs font-bold text-sac-green uppercase tracking-widest mt-1">Proposal Review</p>
                </div>
                <button onClick={() => setReviewOppId(null)} className="lg:hidden text-gray-400 hover:text-red-500"><X /></button>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Proposal PDF</p>
                  <div className="flex items-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sac-green border"><FileText size={20} /></div>
                      <div><p className="text-sm font-bold text-gray-900">Proposal.pdf</p></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-3xl border shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Goal Amount</p>
                    <p className="text-sm font-black text-sac-green">{selectedOpp.goalAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Expected ROI</p>
                    <p className="text-sm font-black text-gray-900">{selectedOpp.roi || 'TBD'}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Detailed Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">{selectedOpp.description}</p>
                </div>
              </div>
              {selectedOpp.status === 'pending_review' && (
                <div className="space-y-4 pt-4 border-t sticky bottom-0">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Rejection Feedback</label>
                    <textarea className="w-full bg-white border rounded-2xl p-4 text-sm min-h-[100px] outline-none" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleApproveInvestment} className="flex-1 py-4 bg-sac-green text-white font-bold rounded-2xl flex items-center justify-center gap-2"><Check size={20} /> Approve</button>
                    <button onClick={handleRejectInvestment} className="flex-1 py-4 bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2"><X size={20} /> Reject</button>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:w-3/5 flex flex-col h-full bg-white">
              <div className="p-6 border-b flex justify-between h-[89px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sac-beige flex items-center justify-center text-sac-green"><MessageCircle size={24} /></div>
                  <div><h4 className="font-bold text-gray-900">Project Q&A</h4><p className="text-[10px] text-gray-400 uppercase font-bold">Direct channel with submitter</p></div>
                </div>
                <button onClick={() => setReviewOppId(null)} className="hidden lg:block p-2 text-gray-300 hover:text-red-500"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-sac-beige/5">
                {(selectedOpp.discussion || []).map((msg: any, i: number) => {
                  const isMe = msg.userId === 'admin1';
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] space-y-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                        <p className="text-[9px] font-black text-gray-400 px-2 uppercase">{msg.userName || 'User'}</p>
                        <div className={`px-5 py-3.5 rounded-3xl text-sm font-medium ${isMe ? 'bg-sac-green text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border'}`}>{msg.text}</div>
                        <p className="text-[8px] text-gray-400 px-2">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-6 border-t bg-white">
                <div className="flex gap-3 bg-gray-50 p-3 rounded-[1.75rem] border">
                  <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent px-4 py-2 text-sm outline-none" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendDiscussionMessage()} />
                  <button onClick={sendDiscussionMessage} className="bg-sac-green text-white p-3 rounded-2xl"><Send size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsAdmin;