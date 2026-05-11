
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Rss,
  TrendingUp,
  HandCoins,
  Wallet,
  Users,
  Bell,
  UserCircle,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Loader2
} from 'lucide-react';

import { UserRole, TransactionType, PreRegistration } from './types';
import { initialData, fetchAllData, persistToSupabase, PersistenceChange } from './store';
import { supabase } from './supabase';
import { MEMBERSHIP_FEE_UGX, AFFILIATE_REWARD_UGX } from './constants';

// --- Components ---
import Dashboard from './components/Dashboard';
import Feed from './components/Feed';
import Investments from './components/Investments';
import Loans from './components/Loans';
import WalletView from './components/WalletView';
import Groups from './components/Groups';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Signup from './components/Signup';
import PaymentScreen from './components/PaymentScreen';
import ResetPassword from './components/ResetPassword';

const AuthRedirect = () => {
  const hash = window.location.hash;
  const search = window.location.search;

  // Password recovery link — redirect to reset-password page
  if (hash.includes('type=recovery')) {
    return <Navigate to={`/reset-password${hash}`} replace />;
  }

  if (hash.includes('type=invite') || hash.includes('access_token=')) {
    const hashParams = new URLSearchParams(hash.replace('#', '?').replace('?', '&'));
    const searchParams = new URLSearchParams(search);
    const refCode = searchParams.get('ref') || hashParams.get('referrer_code') || hashParams.get('ref');
    return <Navigate to={`/signup${refCode ? `?ref=${refCode}` : ''}`} replace />;
  }

  const params = new URLSearchParams(search);
  if (params.has('ref')) {
    return <Navigate to={`/signup?ref=${params.get('ref')}`} replace />;
  }

  return <Navigate to="/login" replace />;
};

const AppContent: React.FC<{
  data: any,
  isLoading: boolean,
  isSidebarOpen: boolean,
  setIsSidebarOpen: (val: boolean) => void,
  handleUpdateData: any,
  handleLogout: () => void
}> = ({ data, isLoading, isSidebarOpen, setIsSidebarOpen, handleUpdateData, handleLogout }) => {
  const currentUser = data.currentUser;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sac-beige flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-sac-green animate-spin" size={48} />
        <p className="text-sac-green font-bold animate-pulse">Connecting to Lada Network...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login data={data} updateData={handleUpdateData} />} />
        <Route path="/signup" element={<Signup data={data} updateData={handleUpdateData} />} />
        <Route path="/payment" element={<PaymentScreen updateData={handleUpdateData} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<AuthRedirect />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-sac-beige">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sac-green text-white transition-all duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 shadow-lg
      `}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} className="text-white" />
            <h1 className="text-lg font-bold">Lada Sacco</h1>
          </div>
          <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          <SidebarItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/feed" icon={<Rss size={18} />} label="Feed" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/investments" icon={<TrendingUp size={18} />} label="Investments" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/loans" icon={<HandCoins size={18} />} label="Loans" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/wallet" icon={<Wallet size={18} />} label="Wallet" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/groups" icon={<Users size={18} />} label="Groups" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/notifications" icon={<Bell size={18} />} label="Notifications" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/profile" icon={<UserCircle size={18} />} label="Profile" onClick={() => setIsSidebarOpen(false)} />

          {currentUser.role === UserRole.ADMIN && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <SidebarItem to="/admin" icon={<ShieldCheck size={18} />} label="Admin Panel" onClick={() => setIsSidebarOpen(false)} />
            </div>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white/70 transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between lg:justify-end border-b">
          <button className="lg:hidden p-2 text-sac-green" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{currentUser.fullName}</p>
              <p className="text-xs text-sac-green font-medium">{currentUser.role}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sac-green flex items-center justify-center text-white font-bold">
              {currentUser.fullName.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-10 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard data={data} />} />
            <Route path="/payment" element={<PaymentScreen updateData={handleUpdateData} />} />
            <Route path="/feed" element={<Feed data={data} updateData={handleUpdateData} />} />
            <Route path="/investments" element={<Investments data={data} updateData={handleUpdateData} />} />
            <Route path="/loans" element={<Loans data={data} updateData={handleUpdateData} />} />
            <Route path="/wallet" element={<WalletView data={data} updateData={handleUpdateData} />} />
            <Route path="/groups" element={<Groups data={data} updateData={handleUpdateData} />} />
            <Route path="/notifications" element={<Notifications data={data} updateData={handleUpdateData} />} />
            <Route path="/profile" element={<Profile data={data} updateData={handleUpdateData} />} />
            {currentUser.role === UserRole.ADMIN && (
              <Route path="/admin" element={<AdminPanel data={data} updateData={handleUpdateData} />} />
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const remoteData = await fetchAllData();
      setData(prev => ({
        ...prev,
        ...remoteData
      }));
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Wait for initial data load

    const initAuth = async () => {
      // ── Guard: never auto-login during a password recovery flow ──
      // The recovery link puts #type=recovery in the URL hash.
      // If we detect it here (before onAuthStateChange fires), bail out immediately.
      const urlHash = window.location.hash;
      const isRecoveryFlow =
        urlHash.includes('type=recovery') ||
        window.location.pathname === '/reset-password';
      if (isRecoveryFlow) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const existingUser = data.users.find((u: any) => u.email === session.user.email);
        
        if (!existingUser) {
           const meta = session.user.user_metadata;
           if (!meta || !meta.fullName) return; // Not signed up through our form

           const userId = 'u-' + Date.now();
           const walletId = 'w-' + Date.now();
           const isFullyPaid = meta.isFullyPaid;
           
           const newUser = {
             id: userId,
             fullName: meta.fullName,
             email: meta.email,
             phone: meta.phone,
             nin: meta.nin,
             dob: meta.dob,
             nextOfKinName: meta.nextOfKinName,
             nextOfKinContact: meta.nextOfKinContact,
             profession: meta.profession,
             employer: meta.employer,
             educationLevel: meta.educationLevel,
             monthlyEarningsRange: meta.monthlyEarningsRange,
             address: meta.address,
             city: meta.city,
             district: meta.district,
             country: meta.country,
             role: UserRole.MEMBER,
             membershipPaid: isFullyPaid,
             walletId: walletId,
             affiliateCode: 'LADA-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
             referredBy: meta.referralCode,
             creditScore: 50,
             createdAt: new Date().toISOString()
           };

           let initialBalance = meta.isPayingNow ? 0 : -MEMBERSHIP_FEE_UGX; 
           let membershipTxAmount = -MEMBERSHIP_FEE_UGX;
           
           const persistenceTasks: PersistenceChange[] = [
             { table: 'users', data: newUser }
           ];

           const prevPreRegistrations = data.preRegistrations || [];
           const claimedPreReg = meta.claimedPreRegId 
              ? prevPreRegistrations.find((pr: any) => pr.id === meta.claimedPreRegId) 
              : null;

           if (claimedPreReg) {
             const surplus = claimedPreReg.amountPaid - MEMBERSHIP_FEE_UGX;
             initialBalance = surplus;

             const depositTx = {
               id: 'tx-d-' + Date.now(),
               walletId: walletId,
               amount: claimedPreReg.amountPaid,
               type: TransactionType.DEPOSIT,
               description: 'Pre-registered External Payment',
               createdAt: new Date(Date.now() - 1000).toISOString()
             };

             persistenceTasks.push({ table: 'transactions', data: depositTx });
             persistenceTasks.push({ table: 'preRegistrations', data: { ...claimedPreReg, claimed: true } });
           }

           const newWallet = { id: walletId, userId: userId, balanceUGX: initialBalance };
           persistenceTasks.push({ table: 'wallets', data: newWallet });

           const membershipTx = {
             id: 'tx-m-' + Date.now(),
             walletId: walletId,
             amount: membershipTxAmount,
             type: TransactionType.MEMBERSHIP_FEE,
             description: 'Membership Fee Payment',
             createdAt: new Date().toISOString()
           };
           persistenceTasks.push({ table: 'transactions', data: membershipTx });

           const referrer = meta.referralCode ? data.users.find((u: any) => u.affiliateCode === meta.referralCode) : null;
           
           if (referrer) {
               const rewardTx = {
                 id: 'tx-aff-' + Date.now(),
                 walletId: referrer.walletId,
                 amount: AFFILIATE_REWARD_UGX,
                 type: TransactionType.AFFILIATE_REWARD,
                 description: `Referral Reward for ${meta.fullName}`,
                 createdAt: new Date().toISOString()
               };
               const rewardNotif = {
                 id: 'not-aff-' + Date.now(),
                 userId: referrer.id,
                 type: 'referral',
                 message: `You earned ${AFFILIATE_REWARD_UGX.toLocaleString()} UGX for referring ${meta.fullName}!`,
                 read: false,
                 createdAt: new Date().toISOString()
               };
               const updatedWallet = { ...data.wallets.find((w:any) => w.userId === referrer.id) };
               updatedWallet.balanceUGX += AFFILIATE_REWARD_UGX;
               persistenceTasks.push({ table: 'wallets', data: updatedWallet });
               persistenceTasks.push({ table: 'transactions', data: rewardTx });
               persistenceTasks.push({ table: 'notifications', data: rewardNotif });
           }

           handleUpdateData((prev: any) => {
              let nextWallets = [...prev.wallets, newWallet];
              let nextTransactions = [...prev.transactions, membershipTx];
              let nextNotifications = [...prev.notifications];

              if (claimedPreReg) {
                 nextTransactions.push({
                   id: 'tx-d-' + Date.now(),
                   walletId: walletId,
                   amount: claimedPreReg.amountPaid,
                   type: TransactionType.DEPOSIT,
                   description: 'Pre-registered External Payment',
                   createdAt: new Date(Date.now() - 1000).toISOString()
                 } as any);
              }

              if (referrer) {
                  nextWallets = nextWallets.map((w: any) => {
                    if (w.userId === referrer.id) {
                      return { ...w, balanceUGX: w.balanceUGX + AFFILIATE_REWARD_UGX };
                    }
                    return w;
                  });
                  nextTransactions.push({
                     id: 'tx-aff-' + Date.now(),
                     walletId: referrer.walletId,
                     amount: AFFILIATE_REWARD_UGX,
                     type: TransactionType.AFFILIATE_REWARD,
                     description: `Referral Reward for ${meta.fullName}`,
                     createdAt: new Date().toISOString()
                  } as any);
                  nextNotifications.push({
                     id: 'not-aff-' + Date.now(),
                     userId: referrer.id,
                     type: 'referral',
                     message: `You earned ${AFFILIATE_REWARD_UGX.toLocaleString()} UGX for referring ${meta.fullName}!`,
                     read: false,
                     createdAt: new Date().toISOString()
                  } as any);
              }

              return {
                 ...prev,
                 users: [...prev.users, newUser],
                 wallets: nextWallets,
                 transactions: nextTransactions,
                 notifications: nextNotifications,
                 currentUser: newUser,
                 preRegistrations: prev.preRegistrations?.map((pr: any) =>
                    pr.id === claimedPreReg?.id ? { ...pr, claimed: true } : pr
                 ) || []
              };
           }, persistenceTasks);
        } else if (!data.currentUser || data.currentUser.id !== existingUser.id) {
           handleUpdateData((prev: any) => ({
              ...prev,
              currentUser: existingUser
           }));
        }
      }
    };

    initAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
       if (event === 'PASSWORD_RECOVERY') {
           // User clicked the reset link — redirect to reset page, do NOT log them in
           window.location.href = '/reset-password';
           return;
       }
       if (event === 'SIGNED_IN') {
           // Skip login if this SIGNED_IN was triggered by a recovery token
           const hash = window.location.hash;
           if (hash.includes('type=recovery') || window.location.pathname === '/reset-password') return;
           initAuth();
       } else if (event === 'SIGNED_OUT') {
           handleUpdateData((prev: any) => ({ ...prev, currentUser: null }));
       }
    });

    return () => authListener.subscription.unsubscribe();
  }, [isLoading]);

  const handleUpdateData = (updater: (prev: any) => any, persistenceInfo?: PersistenceChange | PersistenceChange[]) => {
    setData(prev => {
      const next = updater(prev);
      if (persistenceInfo) {
        persistToSupabase(next, persistenceInfo);
      }
      return { ...next };
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setData(prev => ({ ...prev, currentUser: null }));
  };

  return (
    <Router>
      <AppContent 
        data={data} 
        isLoading={isLoading}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleUpdateData={handleUpdateData}
        handleLogout={handleLogout}
      />
    </Router>
  );
};

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${isActive ? 'bg-white text-sac-green shadow-sm font-bold' : 'hover:bg-white/5 text-white/70 hover:text-white'}
      `}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
};

export default App;
