import React, { useState } from 'react';
import { Users, TrendingUp, HandCoins, Wallet, FileText, ArrowUpRight } from 'lucide-react';
import { UserRole } from '../../types';

import InvestmentsAdmin from './InvestmentsAdmin';
import WithdrawalsAdmin from './WithdrawalsAdmin';
import LoansAdmin from './LoansAdmin';
import MembersAdmin from './MembersAdmin';
import LedgerAdmin from './LedgerAdmin';
import FeedAdmin from './FeedAdmin';

interface AdminPanelProps {
  data: any;
  updateData: (updater: (prev: any) => any, persistenceInfo?: { table: string, data: any }) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ data, updateData }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'withdrawals' | 'investments' | 'loans' | 'feed' | 'ledger'>('members');

  const members = data.users.filter((u: any) => u.role === UserRole.MEMBER);
  const activeLoans = data.loans.filter((l: any) => l.status === 'active' || l.status === 'pending');
  const pendingWithdrawals = data.withdrawalRequests?.filter((w: any) => w.status === 'pending') || [];
  const adminWallet = data.wallets.find((w: any) => w.userId === 'admin1');
  const allOpps = data.opportunities;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-500">Manage SACCO operations and members.</p>
        </div>
        <div className="bg-sac-green text-white px-6 py-3 rounded-2xl shadow-sm border border-emerald-900/10">
          <p className="text-xs opacity-70 mb-0.5 font-medium">Cooperative Balance</p>
          <p className="text-lg font-bold">{(adminWallet?.balanceUGX || 0).toLocaleString()} UGX</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard label="Members" value={members.length} icon={<Users size={18} />} />
        <StatCard label="Active Loans" value={activeLoans.length} icon={<HandCoins size={18} />} />
        <StatCard label="Withdrawals" value={pendingWithdrawals.length} icon={<Wallet size={18} />} />
        <StatCard label="Groups" value={data.groups?.length || 0} icon={<Users size={18} />} />
        <StatCard label="Proposals" value={allOpps.filter((o: any) => o.status === 'pending_review').length} icon={<FileText size={18} />} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-2 border-b bg-gray-50/50 flex flex-wrap gap-1">
          {[
            { id: 'members', label: 'Members', icon: <Users size={16} /> },
            { id: 'withdrawals', label: 'Disbursements', icon: <ArrowUpRight size={16} /> },
            { id: 'investments', label: 'Investments', icon: <TrendingUp size={16} /> },
            { id: 'loans', label: 'Loans', icon: <HandCoins size={16} /> },
            { id: 'feed', label: 'Feed', icon: <FileText size={16} /> },
            { id: 'ledger', label: 'Ledger', icon: <Wallet size={16} /> }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-sac-green text-white shadow-sm' : 'text-gray-500 hover:text-sac-green hover:bg-white'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-0">
          {activeTab === 'investments' && <InvestmentsAdmin data={data} updateData={updateData} />}
          {activeTab === 'withdrawals' && <WithdrawalsAdmin data={data} updateData={updateData} />}
          {activeTab === 'loans' && <LoansAdmin data={data} updateData={updateData} />}
          {activeTab === 'members' && <MembersAdmin data={data} updateData={updateData} />}
          {activeTab === 'feed' && <FeedAdmin updateData={updateData} setActiveTab={setActiveTab} />}
          {activeTab === 'ledger' && <LedgerAdmin data={data} />}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:border-emerald-100 transition-colors">
    <div className="w-10 h-10 bg-sac-green/5 text-sac-green rounded-2xl flex items-center justify-center mb-4 border border-emerald-50">{icon}</div>
    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-xl font-black text-gray-900">{value}</h3>
  </div>
);

export default AdminPanel;