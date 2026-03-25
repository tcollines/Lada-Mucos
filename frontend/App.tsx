
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
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

import { UserRole } from './types';
import { initialData, fetchAllData, persistToSupabase, PersistenceChange } from './store';

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

const AuthRedirect = () => {
  const hash = window.location.hash;
  const search = window.location.search;

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

  const handleUpdateData = (updater: (prev: any) => any, persistenceInfo?: PersistenceChange | PersistenceChange[]) => {
    setData(prev => {
      const next = updater(prev);
      if (persistenceInfo) {
        persistToSupabase(next, persistenceInfo);
      }
      return { ...next };
    });
  };

  const handleLogout = () => {
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
