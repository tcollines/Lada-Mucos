
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Wallet, Users, Info, TrendingUp, Lock, Search, Loader2 } from 'lucide-react';
import { UserRole, TransactionType, PreRegistration } from '../types';
import { MEMBERSHIP_FEE_UGX, AFFILIATE_REWARD_UGX } from '../constants';
import { PersistenceChange } from '../store';

interface SignupProps {
  data: any;
  updateData: (updater: (prev: any) => any, persistenceInfo?: PersistenceChange | PersistenceChange[]) => void;
}

const Signup: React.FC<SignupProps> = ({ data, updateData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '',
    nin: '', dob: '', nextOfKinName: '', nextOfKinContact: '',
    profession: '', employer: '', educationLevel: '', monthlyEarningsRange: '',
    address: '', city: '', district: '', country: 'Uganda',
    referralCode: ''
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { url: '/images/slide1.jpg', note: 'Empowering your financial future through sustainable agriculture and forestry' },
    { url: '/images/slide2.jpg', note: 'Join our community of prosperous members farming for a better tomorrow' },
    { url: '/images/slide3.jpg', note: 'Demonstrating our investment in the transportation app called Lift', scaleX: -1 }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [claimedPreReg, setClaimedPreReg] = useState<PreRegistration | null>(null);
  const [isCheckingPreReg, setIsCheckingPreReg] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check URL for referral code parameter on mount
  useEffect(() => {
    // 1. Check React Router search (e.g. #/signup?ref=LADA...)
    const params = new URLSearchParams(location.search);
    let refCode = params.get('ref') || params.get('referrer_code');

    // 2. Fall back to global window search (e.g. ?ref=LADA...#/signup)
    if (!refCode) {
      const windowParams = new URLSearchParams(window.location.search);
      refCode = windowParams.get('ref') || windowParams.get('referrer_code');
    }

    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
  }, [location.search]);

  const handleNext = () => {
    if (step === 1) {
      const emailMatch = formData.email?.toLowerCase().trim() || '';
      const phoneMatch = formData.phone?.trim() || '';
      const ninMatch = formData.nin?.trim() || '';

      const userExists = data.users?.find((u: any) => {
        const uEmail = u.email?.toLowerCase().trim() || '';
        const uPhone = u.phone?.trim() || '';
        const uNin = u.nin?.trim() || '';

        return (
          (emailMatch && uEmail === emailMatch) ||
          (phoneMatch && uPhone === phoneMatch) ||
          (ninMatch && uNin === ninMatch)
        );
      });

      if (userExists) {
        alert("You already exist in the system. Please log in instead.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };
  const handlePrev = () => setStep(prev => prev - 1);

  const checkPreRegistration = () => {
    setIsCheckingPreReg(true);
    setTimeout(() => {
      const emailMatch = formData.email?.toLowerCase().trim() || '';
      const phoneMatch = formData.phone?.trim() || '';
      const nameMatch = formData.fullName?.toLowerCase().trim() || '';

      const found = data.preRegistrations?.find((pr: PreRegistration) => {
        if (pr.claimed) return false;

        const prEmail = pr.email?.toLowerCase().trim() || '';
        const prPhone = pr.phone?.trim() || '';
        const prName = pr.name?.toLowerCase().trim() || '';

        const isEmailMatch = emailMatch && prEmail === emailMatch;
        const isPhoneMatch = phoneMatch && prPhone === phoneMatch;
        const isNameMatch = nameMatch && prName === nameMatch;

        return isEmailMatch || isPhoneMatch || isNameMatch;
      });

      if (found) {
        setClaimedPreReg(found);
      } else {
        alert("We couldn't find a pre-paid record matching your Name, Email, or Phone. Please check your spelling or continue to pay normally.");
        setClaimedPreReg(null);
      }
      setIsCheckingPreReg(false);
    }, 600);
  };

  const handleFinalize = (isPayingNow: boolean = false) => {
    const userId = 'u-' + Date.now();
    const walletId = 'w-' + Date.now();

    // If they chose Pay Later, and they don't have a claimed pre-reg that covers it, they are unpaid
    const isFullyPaid = isPayingNow || (claimedPreReg && claimedPreReg.amountPaid >= MEMBERSHIP_FEE_UGX);

    const { referralCode, ...restFormData } = formData;
    const newUser = {
      ...restFormData,
      id: userId,
      role: UserRole.MEMBER,
      membershipPaid: isFullyPaid,
      walletId: walletId,
      affiliateCode: 'LADA-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      referredBy: referralCode,
      creditScore: 50,
      createdAt: new Date().toISOString()
    };

    let initialBalance = isPayingNow ? 0 : -MEMBERSHIP_FEE_UGX; // If paying now, balance is 0 until payment succeeds. If paying later, debt.
    let membershipTxAmount = -MEMBERSHIP_FEE_UGX;

    const persistenceTasks: PersistenceChange[] = [
      { table: 'users', data: newUser }
    ];

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

    updateData(prev => {
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

      if (formData.referralCode) {
        const referrer = prev.users.find((u: any) => u.affiliateCode === formData.referralCode);
        if (referrer) {
          const rewardTx = {
            id: 'tx-aff-' + Date.now(),
            walletId: referrer.walletId,
            amount: AFFILIATE_REWARD_UGX,
            type: TransactionType.AFFILIATE_REWARD,
            description: `Referral Reward for ${formData.fullName}`,
            createdAt: new Date().toISOString()
          };
          const rewardNotif = {
            id: 'not-aff-' + Date.now(),
            userId: referrer.id,
            type: 'referral',
            message: `You earned ${AFFILIATE_REWARD_UGX.toLocaleString()} UGX for referring ${formData.fullName}!`,
            read: false,
            createdAt: new Date().toISOString()
          };

          nextWallets = nextWallets.map((w: any) => {
            if (w.userId === referrer.id) {
              const updatedWallet = { ...w, balanceUGX: w.balanceUGX + AFFILIATE_REWARD_UGX };
              persistenceTasks.push({ table: 'wallets', data: updatedWallet });
              return updatedWallet;
            }
            return w;
          });

          nextTransactions.push(rewardTx);
          nextNotifications.push(rewardNotif);
          persistenceTasks.push({ table: 'transactions', data: rewardTx });
          persistenceTasks.push({ table: 'notifications', data: rewardNotif });
        }
      }

      return {
        ...prev,
        users: [...prev.users, newUser],
        wallets: nextWallets,
        transactions: nextTransactions,
        notifications: nextNotifications,
        currentUser: newUser,
        preRegistrations: prev.preRegistrations?.map((pr: PreRegistration) =>
          pr.id === claimedPreReg?.id ? { ...pr, claimed: true } : pr
        ) || []
      };
    }, persistenceTasks);

    if (isPayingNow) {
      // Pass the necessary payment details via state to the payment gateway
      navigate('/payment', { 
        state: { 
          amount: MEMBERSHIP_FEE_UGX,
          userId: userId,
          walletId: walletId,
          paymentReason: 'Membership Fee'
        } 
      });
    } else {
      navigate('/');
    }
  };

  const handleConfirmClick = () => {
    // If they have claimed a pre-reg and it covers the full fee, skip modal
    if (claimedPreReg && claimedPreReg.amountPaid >= MEMBERSHIP_FEE_UGX) {
      handleFinalize(false);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-screen w-full relative flex overflow-hidden bg-black">
      {/* Background Slideshow */}
      {slides.map((slide, index) => (
        <div
          key={slide.url}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${slide.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: slide.scaleX ? `scaleX(${slide.scaleX})` : 'none'
            }}
          />
          {/* Dark overlay for better text readability and aesthetics */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      {/* Slide Note (Bottom Left) */}
      <div className="absolute bottom-12 left-12 text-white z-10 max-w-2xl hidden lg:block">
        <h2 className="text-4xl font-bold leading-tight drop-shadow-lg text-white/90">
          {slides[currentSlide].note}
        </h2>
        <div className="w-16 h-1 bg-sac-green mt-6 rounded-full opacity-80" />
      </div>

      {/* Form Area on the right */}
      <div className="relative z-10 w-full lg:w-[750px] ml-auto h-full overflow-y-auto flex flex-col sm:flex-row bg-black/40 backdrop-blur-md border-l border-white/10 shadow-2xl text-white">
        
        {/* Progress Sidebar */}
        <div className="sm:w-1/3 p-8 border-b sm:border-b-0 sm:border-r border-white/10 flex flex-col justify-center">
          <div className="mb-10 flex items-center gap-3">
            <ShieldCheck size={32} className="text-sac-green" />
            <h2 className="font-bold text-2xl leading-tight">Join Lada</h2>
          </div>
          <div className="space-y-6">
            {[
              { s: 1, label: 'Personal', icon: <Users size={18} /> },
              { s: 2, label: 'Employment', icon: <TrendingUp size={18} /> },
              { s: 3, label: 'Address', icon: <Info size={18} /> },
              { s: 4, label: 'Membership', icon: <Wallet size={18} /> },
            ].map((stepItem) => (
              <div key={stepItem.s} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= stepItem.s ? 'bg-sac-green text-white border-sac-green shadow-[0_0_15px_rgba(22,101,52,0.6)]' : 'border-white/20 text-white/40'
                  }`}>
                  {step > stepItem.s ? <CheckCircle2 size={20} /> : stepItem.s}
                </div>
                <span className={`text-sm font-bold tracking-wide ${step >= stepItem.s ? 'text-white' : 'text-white/40'}`}>{stepItem.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-1 p-8 sm:p-12 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h3 className="text-3xl font-bold tracking-tight">Personal Details</h3>
              <div className="space-y-4">
                <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="NIN" name="nin" value={formData.nin} onChange={handleChange} />
                  <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                </div>
                <Input label="Create Password" name="password" type="password" value={formData.password} onChange={handleChange} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h3 className="text-3xl font-bold tracking-tight">Professional Information</h3>
              <div className="space-y-4">
                <Input label="Profession" name="profession" value={formData.profession} onChange={handleChange} />
                <Input label="Employer / Business Name" name="employer" value={formData.employer} onChange={handleChange} />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Monthly Earnings Range</label>
                  <select name="monthlyEarningsRange" value={formData.monthlyEarningsRange} onChange={handleChange} className="w-full bg-white/10 border border-white/20 p-4 rounded-xl outline-none focus:ring-2 focus:ring-sac-green text-white font-medium backdrop-blur-sm transition-all appearance-none">
                    <option value="" className="text-gray-900">Select range...</option>
                    <option value="0-1M" className="text-gray-900">0 - 1M UGX</option>
                    <option value="1M-3M" className="text-gray-900">1M - 3M UGX</option>
                    <option value="3M-5M" className="text-gray-900">3M - 5M UGX</option>
                    <option value="5M+" className="text-gray-900">5M+ UGX</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h3 className="text-3xl font-bold tracking-tight">Address & Referrals</h3>
              <div className="space-y-4">
                <Input label="Residence Address" name="address" value={formData.address} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="District" name="district" value={formData.district} onChange={handleChange} />
                  <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                </div>
                <Input label="Referral Code (Optional)" name="referralCode" value={formData.referralCode} onChange={handleChange} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-sac-green/20 border border-sac-green/30 text-sac-green rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Wallet size={40} />
                </div>
                <h3 className="text-3xl font-bold tracking-tight">Complete Membership</h3>
                <p className="text-gray-300 mt-2">A one-time membership fee is required to activate your account.</p>
              </div>

              <div className="bg-white/5 p-7 rounded-[2rem] border border-dashed border-white/20 shadow-sm relative overflow-hidden backdrop-blur-md">
                <div className="flex justify-between items-start mb-6 gap-4">
                  <span className="text-gray-300 font-medium text-[17px] leading-snug w-1/2">Lada Membership Fee</span>
                  <div className="text-left w-1/2 pl-2">
                    <span className="block text-[28px] font-extrabold text-[#4ade80] leading-none mb-1.5">{MEMBERSHIP_FEE_UGX.toLocaleString()}</span>
                    <span className="block text-[22px] font-extrabold text-[#4ade80]">UGX</span>
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  <p className="text-[14px] text-gray-300 flex gap-3 items-start leading-relaxed pr-4">
                    <CheckCircle2 size={18} className="text-[#4ade80] flex-shrink-0 mt-0.5" />
                    Grants full access to Sacco lending services.
                  </p>
                  <p className="text-[14px] text-gray-300 flex gap-3 items-start leading-relaxed pr-4">
                    <CheckCircle2 size={18} className="text-[#4ade80] flex-shrink-0 mt-0.5" />
                    Eligible for community investments and dividends.
                  </p>
                </div>
              </div>

              {!claimedPreReg ? (
                <div className="pt-6 border-t border-white/10">
                  <p className="text-[15px] font-extrabold mb-4">Did you already pay through an Admin?</p>
                  <button
                    onClick={checkPreRegistration}
                    disabled={isCheckingPreReg}
                    className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-[1.25rem] font-bold text-[14px] flex items-center hover:bg-white/20 transition-all shadow-lg backdrop-blur-sm"
                  >
                    <div className="pl-5 text-gray-300">
                      {isCheckingPreReg ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </div>
                    <span className="flex-1 text-center pr-10">{isCheckingPreReg ? 'Checking Records...' : 'Check Pre-paid Membership using my Email / Phone'}</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-900/40 border border-[#4ade80]/30 p-6 rounded-[2rem] space-y-4 animate-in fade-in duration-300 backdrop-blur-md">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-[#4ade80] flex items-center gap-2"><CheckCircle2 size={18} /> Record Found!</h4>
                    <button onClick={() => setClaimedPreReg(null)} className="text-[13px] text-gray-400 hover:text-white transition-colors underline decoration-white/30 underline-offset-2">Dismiss</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl shadow-sm border border-white/5">
                      <p className="text-[11px] text-gray-300 font-extrabold uppercase tracking-widest mb-1.5">Amount Paid</p>
                      <p className="text-[15px] font-black text-white">{claimedPreReg.amountPaid.toLocaleString()} UGX</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl shadow-sm border border-white/5">
                      <p className="text-[11px] text-gray-300 font-extrabold uppercase tracking-widest mb-1.5">Status</p>
                      {claimedPreReg.amountPaid >= MEMBERSHIP_FEE_UGX ? (
                        <p className="text-[15px] font-black text-[#4ade80]">Fully Cleared</p>
                      ) : (
                        <p className="text-[15px] font-black text-amber-400">Partial Payment</p>
                      )}
                    </div>
                  </div>

                  {claimedPreReg.amountPaid > MEMBERSHIP_FEE_UGX && (
                    <p className="text-[11px] text-[#4ade80] font-bold text-center pt-2">
                      * Note: A surplus of {(claimedPreReg.amountPaid - MEMBERSHIP_FEE_UGX).toLocaleString()} UGX will be carried back to your Wallet.
                    </p>
                  )}
                  {claimedPreReg.amountPaid < MEMBERSHIP_FEE_UGX && (
                    <p className="text-[11px] text-[#4ade80] font-bold text-center pt-2">
                      * Note: Your remaining balance of {(MEMBERSHIP_FEE_UGX - claimedPreReg.amountPaid).toLocaleString()} UGX will be recorded as a pending fee on your account.
                    </p>
                  )}
                </div>
              )}

              <div className="p-4 bg-sac-green/20 text-[#4ade80] text-xs rounded-xl border border-sac-green/30 font-medium text-center">
                By clicking below, you authorize the membership fee deduction.
              </div>
            </div>
          )}

          <div className="mt-12 flex gap-4">
            {step > 1 && (
               <button
                 onClick={handlePrev}
                 className="flex-1 py-4 text-gray-300 font-bold hover:bg-white/10 hover:text-white rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/10"
               >
                 <ArrowLeft size={18} />
                 Back
               </button>
            )}
            <button
              onClick={step === 4 ? handleConfirmClick : handleNext}
              className="flex-[2] bg-sac-green text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-[0_8px_20px_rgba(22,101,52,0.4)] hover:shadow-[0_12px_25px_rgba(22,101,52,0.6)] hover:-translate-y-1"
            >
              {step === 4 ? 'Confirm & Finalize' : 'Continue'}
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">Already have an account? <Link to="/login" className="text-white hover:text-sac-green transition-colors font-bold underline decoration-sac-green decoration-2 underline-offset-4">Sign In</Link></p>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        onPayNow={() => {
          setShowPaymentModal(false);
          handleFinalize(true);
        }}
        onPayLater={() => {
          setShowPaymentModal(false);
          handleFinalize(false);
        }}
      />
    </div>
  );
};

const Input: React.FC<{ label: string, name: string, type?: string, value: string, onChange: any }> = ({ label, name, type = 'text', value, onChange }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 focus:ring-2 focus:ring-sac-green focus:border-transparent outline-none transition-all text-white placeholder-gray-400 font-medium backdrop-blur-sm"
      style={{ colorScheme: 'dark' }}
    />
  </div>
);

const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onPayNow: () => void;
  onPayLater: () => void;
}> = ({ isOpen, onClose, onPayNow, onPayLater }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sac-green/10 text-sac-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Finalize Membership</h2>
          <p className="text-gray-500">Would you like to pay your membership fee now or later?</p>
        </div>

        <div className="space-y-4">
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 p-4 rounded-2xl font-bold flex items-center justify-between cursor-not-allowed transition-all"
            title="Payment Gateway is currently unavailable"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-400/20 rounded-full flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div className="text-left">
                <div className="text-lg">Pay Now (Unavailable)</div>
                <div className="text-xs text-gray-500 font-normal">Payment Gateway currently down</div>
              </div>
            </div>
          </button>

          <button
            onClick={onPayLater}
            className="w-full bg-gray-50 border-2 border-gray-100 text-gray-700 p-4 rounded-2xl font-bold flex items-center justify-between hover:border-sac-green/30 hover:bg-sac-green/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center group-hover:bg-sac-green/20 group-hover:text-sac-green transition-colors">
                <ArrowRight size={20} />
              </div>
              <div className="text-left">
                <div className="text-lg">Pay Later</div>
                <div className="text-xs text-gray-500 font-normal">Fee will be deducted from your wallet</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
