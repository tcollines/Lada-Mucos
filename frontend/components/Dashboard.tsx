
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Users, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  data: any;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const user = data.currentUser;
  const wallet = data.wallets.find((w: any) => w.userId === user.id);
  const userTransactions = data.transactions
    .filter((t: any) => t.walletId === user.walletId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = useMemo(() => {
    const totalInvested = data.investments
      .filter((i: any) => i.userId === user.id)
      .reduce((sum: number, i: any) => sum + i.amount, 0);
    
    const activeLoans = data.loans
      .filter((l: any) => l.borrowerId === user.id && l.status === 'active')
      .reduce((sum: number, l: any) => sum + l.remainingBalance, 0);

    return [
      { label: 'Wallet Balance', value: wallet?.balanceUGX.toLocaleString() + ' UGX', icon: <Wallet size={20} />, color: 'bg-blue-50 text-blue-600' },
      { label: 'Total Invested', value: totalInvested.toLocaleString() + ' UGX', icon: <TrendingUp size={20} />, color: 'bg-emerald-50 text-emerald-600' },
      { label: 'Active Loans', value: activeLoans.toLocaleString() + ' UGX', icon: <CreditCard size={20} />, color: 'bg-amber-50 text-amber-600' },
      { label: 'Credit Score', value: user.creditScore, icon: <Users size={20} />, color: 'bg-purple-50 text-purple-600' },
    ];
  }, [user, wallet, data.investments, data.loans]);

  const chartData = [
    { name: 'Jan', balance: 400000 },
    { name: 'Feb', balance: 300000 },
    { name: 'Mar', balance: 600000 },
    { name: 'Apr', balance: 800000 },
    { name: 'May', balance: 500000 },
    { name: 'Jun', balance: wallet?.balanceUGX || 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.fullName}!</h2>
        <p className="text-gray-500">Here's what's happening with your SACCO account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-lg font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Wallet Balance History</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F5D3D" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1F5D3D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value.toLocaleString()} UGX`, 'Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="#1F5D3D" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {userTransactions.slice(0, 5).map((t: any) => (
              <div key={t.id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  t.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {t.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{t.description}</p>
                  <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`text-sm font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}
                </div>
              </div>
            ))}
            {userTransactions.length === 0 && <p className="text-center text-gray-400 py-8 italic text-sm">No transactions yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
