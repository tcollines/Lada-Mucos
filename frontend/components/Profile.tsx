
import React, { useState } from 'react';
import {
  UserCircle,
  Settings,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  MapPin,
  Globe,
  Camera,
  CheckCircle2,
  Lock,
  Bell,
  FileText,
  HelpCircle,
  X,
  Eye,
  Upload,
  Phone,
  Mail as MailIcon,
  Send,
  Loader2,
  Link2
} from 'lucide-react';
import { supabase, uploadImage } from '../supabase';

interface ProfileProps {
  data: any;
  updateData: (updater: (prev: any) => any) => void;
}

const Profile: React.FC<ProfileProps> = ({ data, updateData }) => {
  const user = data.currentUser;
  const [activeModal, setActiveModal] = useState<'security' | 'notifications' | 'kyc' | 'help' | null>(null);

  // Local state for settings
  const [phone, setPhone] = useState(user.phone);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [notifs, setNotifs] = useState({
    investments: true,
    loans: true,
    withdrawals: true,
    deposits: true
  });
  const [kycFiles, setKycFiles] = useState<{ front: File | null, back: File | null }>({ front: null, back: null });
  const [uploadingCover, setUploadingCover] = useState(false);

  // Referral state
  const referralLink = `https://lada.ug/?ref=${user.affiliateCode}#/signup`;
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const copyAffiliateLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInviteEmail = async () => {
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    setInviteResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(
        'http://localhost:3001/api/send-referral-invite',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: inviteEmail.trim(), referrerCode: user.affiliateCode }),
        }
      );
      const json = await res.json();
      if (!res.ok || json.error) {
        setInviteResult({ type: 'error', message: json.error ?? 'Failed to send invite.' });
      } else {
        setInviteResult({ type: 'success', message: `Invite sent to ${inviteEmail.trim()}!` });
        setInviteEmail('');
      }
    } catch (err: any) {
      setInviteResult({ type: 'error', message: err.message ?? 'Network error.' });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleUpdateSecurity = () => {
    const updatedUser = { ...user, phone };
    updateData(prev => ({
      ...prev,
      users: prev.users.map((u: any) => u.id === user.id ? { ...u, phone } : u),
      currentUser: updatedUser
    }), { table: 'users', data: updatedUser });
    setActiveModal(null);
    alert('Security settings updated successfully!');
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        const updatedUser = { ...user, coverPhoto: url };
        updateData(prev => ({
          ...prev,
          users: prev.users.map((u: any) => u.id === user.id ? { ...u, coverPhoto: url } : u),
          currentUser: updatedUser
        }), { table: 'users', data: updatedUser });
      } else {
        alert("Failed to upload cover photo. Please try again.");
      }
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="relative">
        <div className="h-48 bg-sac-green rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          {user.coverPhoto ? (
            <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-black/10"></div>
          )}
          <div className="absolute bottom-4 right-8 bg-green-900/40 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-green-900/60 transition-all border border-white/20 cursor-pointer flex items-center justify-center z-10 w-12 h-12">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleCoverPhotoUpload}
              disabled={uploadingCover}
            />
            {uploadingCover ? <Loader2 size={20} className="animate-spin text-white" /> : <Camera size={20} className="text-white" />}
          </div>
        </div>
        <div className="absolute -bottom-16 left-12 flex items-end gap-6">
          <div className="w-32 h-32 bg-white rounded-[2rem] p-1.5 shadow-xl">
            <div className="w-full h-full bg-sac-beige rounded-[1.7rem] flex items-center justify-center text-sac-green font-bold text-4xl border-2 border-sac-green/10 uppercase">
              {user.fullName.charAt(0)}
            </div>
          </div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
            <p className="text-sac-green font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">
              Member ID: {user.affiliateCode}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <UserCircle className="text-sac-green" />
                Personal Details
              </h3>
              <button className="text-sac-green font-bold text-sm hover:underline">Edit Info</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Detail icon={<Mail className="text-gray-400" size={18} />} label="Email Address" value={user.email} />
              <Detail icon={<Smartphone className="text-gray-400" size={18} />} label="Phone Number" value={user.phone} />
              <Detail icon={<ShieldCheck className="text-gray-400" size={18} />} label="NIN" value={user.nin} />
              <Detail icon={<MapPin className="text-gray-400" size={18} />} label="Location" value={`${user.city}, ${user.district}`} />
              <Detail icon={<Globe className="text-gray-400" size={18} />} label="Country" value={user.country} />
              <Detail icon={<Settings className="text-gray-400" size={18} />} label="Profession" value={user.profession} />
            </div>
          </div>

          <div className="bg-emerald-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Share2 className="text-emerald-300" />
                    Affiliate Program
                  </h3>
                  <p className="text-emerald-100 text-sm max-w-sm">
                    Invite your friends and earn <span className="text-white font-bold">5,000 UGX</span> for every successful referral membership.
                  </p>
                </div>
              </div>

              {/* Referral Link Box */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2">
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1">
                  <Link2 size={11} /> Your Referral Link
                </p>
                <div className="flex items-center gap-3">
                  <code className="text-sm font-semibold tracking-wide truncate flex-1 text-white/90">{referralLink}</code>
                  <button
                    onClick={copyAffiliateLink}
                    title="Copy referral link"
                    className={`flex-shrink-0 p-2 rounded-xl transition-all duration-300 ${copied
                      ? 'bg-emerald-400 text-white scale-110'
                      : 'bg-white text-sac-green hover:bg-emerald-50'
                      }`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-[11px] text-emerald-300 font-semibold animate-in fade-in duration-200">
                    ✓ Copied to clipboard!
                  </p>
                )}
              </div>

              {/* Email Invite Form */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-3">
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1">
                  <MailIcon size={11} /> Invite via Email
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="friend@email.com"
                    value={inviteEmail}
                    onChange={(e) => { setInviteEmail(e.target.value); setInviteResult(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && sendInviteEmail()}
                    className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-emerald-300 transition-colors"
                  />
                  <button
                    onClick={sendInviteEmail}
                    disabled={sendingInvite || !inviteEmail.trim()}
                    className="flex-shrink-0 bg-white text-sac-green px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingInvite
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Send size={16} />}
                    {sendingInvite ? 'Sending…' : 'Send'}
                  </button>
                </div>
                {inviteResult && (
                  <p className={`text-[11px] font-semibold animate-in fade-in duration-200 ${inviteResult.type === 'success' ? 'text-emerald-300' : 'text-red-300'
                    }`}>
                    {inviteResult.type === 'success' ? '✓ ' : '✗ '}{inviteResult.message}
                  </p>
                )}
              </div>
            </div>
            <Share2 className="absolute -bottom-6 -left-6 text-white/5" size={160} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
            <h4 className="font-bold mb-4">Quick Settings</h4>
            <div className="space-y-2">
              <SettingsLink label="Account Security" icon={<Lock size={16} />} onClick={() => setActiveModal('security')} />
              <SettingsLink label="Notification Preferences" icon={<Bell size={16} />} onClick={() => setActiveModal('notifications')} />
              <SettingsLink label="KYC Documents" icon={<FileText size={16} />} onClick={() => setActiveModal('kyc')} />
              <SettingsLink label="Help & Support" icon={<HelpCircle size={16} />} color="text-sac-green" onClick={() => setActiveModal('help')} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border shadow-sm text-center">
            <p className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-widest">Membership Status</p>
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={32} />
            </div>
            <p className="font-bold text-gray-900">Premium Member</p>
            <p className="text-xs text-gray-400 mt-1">Active since {new Date(user.createdAt).getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Account Security Modal */}
      {activeModal === 'security' && (
        <Modal title="Account Security" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
              <input
                type="text"
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="h-px bg-gray-100" />
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Change Password</label>
              <input
                type="password"
                placeholder="Current Password"
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none text-sm"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none text-sm"
                value={passwords.next}
                onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full bg-gray-50 border p-3 rounded-xl outline-none text-sm"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            <button
              onClick={handleUpdateSecurity}
              className="w-full bg-sac-green text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/10"
            >
              Update Security
            </button>
          </div>
        </Modal>
      )}

      {/* Notification Preferences Modal */}
      {activeModal === 'notifications' && (
        <Modal title="Notification Preferences" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <NotificationToggle
              label="New Investment Opportunities"
              active={notifs.investments}
              onToggle={() => setNotifs({ ...notifs, investments: !notifs.investments })}
            />
            <NotificationToggle
              label="New Loan Offers"
              active={notifs.loans}
              onToggle={() => setNotifs({ ...notifs, loans: !notifs.loans })}
            />
            <NotificationToggle
              label="Withdrawal Status Alerts"
              active={notifs.withdrawals}
              onToggle={() => setNotifs({ ...notifs, withdrawals: !notifs.withdrawals })}
            />
            <NotificationToggle
              label="Deposit Confirmations"
              active={notifs.deposits}
              onToggle={() => setNotifs({ ...notifs, deposits: !notifs.deposits })}
            />
          </div>
        </Modal>
      )}

      {/* KYC Documents Modal */}
      {activeModal === 'kyc' && (
        <Modal title="KYC Verification" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <p className="text-xs text-gray-500 font-medium">Please upload clear photos of your National ID or Passport.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Front Side</label>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl h-32 flex flex-col items-center justify-center relative hover:border-sac-green transition-colors cursor-pointer group">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setKycFiles({ ...kycFiles, front: e.target.files?.[0] || null })}
                  />
                  {kycFiles.front ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 size={24} className="text-sac-green" />
                      <span className="text-[10px] font-bold mt-1 truncate max-w-[120px]">{kycFiles.front.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-300 group-hover:text-sac-green" />
                      <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Upload Front</span>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Back Side</label>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl h-32 flex flex-col items-center justify-center relative hover:border-sac-green transition-colors cursor-pointer group">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setKycFiles({ ...kycFiles, back: e.target.files?.[0] || null })}
                  />
                  {kycFiles.back ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 size={24} className="text-sac-green" />
                      <span className="text-[10px] font-bold mt-1 truncate max-w-[120px]">{kycFiles.back.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-300 group-hover:text-sac-green" />
                      <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Upload Back</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              className="w-full bg-sac-green text-white py-3 rounded-xl font-bold shadow-lg"
              onClick={() => {
                alert('Documents submitted for board review.');
                setActiveModal(null);
              }}
            >
              Submit for Verification
            </button>
          </div>
        </Modal>
      )}

      {/* Help & Support Modal */}
      {activeModal === 'help' && (
        <Modal title="Help & Support" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="p-6 bg-sac-beige/50 rounded-3xl border border-sac-green/10 space-y-4">
              <h4 className="text-sm font-bold text-sac-green">Cooperative Contacts</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sac-green shadow-sm">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Support</p>
                    <p className="text-sm font-bold text-gray-900">+256 414 123 456</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sac-green shadow-sm">
                    <MailIcon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold text-gray-900">info@lada.ug</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Our support team is available Mon-Fri, 9am - 5pm.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// --- Sub-Components ---

const Modal: React.FC<{ title: string, children: React.ReactNode, onClose: () => void }> = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-sac-green">{title}</h3>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
      </div>
      {children}
    </div>
  </div>
);

const NotificationToggle: React.FC<{ label: string, active: boolean, onToggle: () => void }> = ({ label, active, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
    <span className="text-sm font-bold text-gray-700">{label}</span>
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-sac-green' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);

const Detail: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex gap-4">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const SettingsLink: React.FC<{ label: string, icon?: React.ReactNode, onClick: () => void, color?: string }> = ({ label, icon, onClick, color = "text-gray-600" }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 rounded-xl hover:bg-sac-beige transition-all text-sm font-semibold flex items-center justify-between group ${color}`}
  >
    <div className="flex items-center gap-3">
      <span className="text-gray-400 group-hover:text-sac-green transition-colors">{icon}</span>
      {label}
    </div>
    <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
  </button>
);

const Mail: React.FC<any> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);

const ChevronRight: React.FC<any> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);

export default Profile;
