import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, ArrowLeft, CheckCircle2, ShieldCheck, UploadCloud, Building } from 'lucide-react';
import { TransactionType } from '../types';
import { PersistenceChange } from '../store';

interface PaymentScreenProps {
  updateData: (updater: (prev: any) => any, persistenceInfo?: PersistenceChange | PersistenceChange[]) => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ updateData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'mtn' | 'airtel' | 'bank' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fallback to 250k if no state is passed
  const { amount = 250000, userId, walletId, paymentReason = 'Fee' } = location.state || {};

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing delay (1.5 seconds)
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      
      if (userId && walletId) {
        // Record the physical deposit
        const depositTx = {
            id: 'tx-d-' + Date.now(),
            walletId: walletId,
            amount: amount,
            type: TransactionType.DEPOSIT,
            description: `${paymentReason} Payment via ${method?.toUpperCase()}`,
            createdAt: new Date().toISOString()
        };

        const persistenceTasks: PersistenceChange[] = [
            { table: 'transactions', data: depositTx }
        ];

        updateData(prev => {
            // Find wallet and add the balance
            const nextWallets = prev.wallets.map((w: any) => {
                if (w.id === walletId) {
                    const newWallet = { ...w, balanceUGX: w.balanceUGX + amount };
                    persistenceTasks.push({ table: 'wallets', data: newWallet });
                    return newWallet;
                }
                return w;
            });

            return {
                ...prev,
                wallets: nextWallets,
                transactions: [...prev.transactions, depositTx]
            };
        }, persistenceTasks);
      }

      // Automatically go to dashboard after success
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-sac-beige flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl text-center max-w-sm w-full animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
          <p className="text-gray-500 mb-6">Your payment of {amount.toLocaleString()} UGX has been received.</p>
          <div className="animate-pulse bg-gray-100 h-2 rounded-full w-full overflow-hidden">
             <div className="bg-emerald-500 h-full w-2/3"></div>
          </div>
          <p className="text-sm text-gray-400 mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sac-beige flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-xl">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="bg-sac-green p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
            <ShieldCheck size={40} className="mx-auto mb-4 text-emerald-300" />
            <h2 className="text-2xl font-bold">Secure Checkout</h2>
            <p className="text-white/80 mt-1">Complete your {paymentReason.toLowerCase()} payment</p>
          </div>

          <div className="p-8 pb-10">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
              <span className="text-gray-500 font-medium text-lg">Amount to Pay</span>
              <div className="text-right">
                <span className="text-3xl font-black text-gray-900">{amount.toLocaleString()}</span>
                <span className="text-lg font-bold text-gray-400 ml-1">UGX</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Select Payment Method</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setMethod('mtn')}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${
                  method === 'mtn' ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-gray-100 hover:border-yellow-200 hover:bg-yellow-50/50 text-gray-500'
                }`}
              >
                <Smartphone size={28} className={method === 'mtn' ? 'text-yellow-600' : ''} />
                <span className="font-bold">MTN Mobile Money</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('airtel')}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${
                  method === 'airtel' ? 'border-red-500 bg-red-50 text-red-800' : 'border-gray-100 hover:border-red-200 hover:bg-red-50/50 text-gray-500'
                }`}
              >
                <Smartphone size={28} className={method === 'airtel' ? 'text-red-600' : ''} />
                <span className="font-bold">Airtel Money</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`col-span-2 p-4 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all ${
                  method === 'bank' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 text-gray-500'
                }`}
              >
                <Building size={24} className={method === 'bank' ? 'text-blue-600' : ''} />
                <span className="font-bold">Bank Transfer / Upload Receipt</span>
              </button>
            </div>

            {method && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                {(method === 'mtn' || method === 'airtel') ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">{method.toUpperCase()} Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+256</span>
                      <input
                        type="tel"
                        required
                        placeholder="7XX XXX XXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-16 pr-4 py-4 focus:ring-2 focus:ring-sac-green outline-none transition-all text-lg font-medium"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">A prompt will automatically be sent to this number to complete the payment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed mb-4">
                      <p className="font-bold mb-1">Bank Instructions:</p>
                      <p>Transfer the exact amount to standard Chartered Bank, Account No: <strong>010XXXXXXXX</strong> (Lada Cooperative). Upload your receipt below.</p>
                    </div>
                    
                    <label className="text-xs font-bold text-gray-500 uppercase">Upload Payment Proof</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          required
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                          accept="image/*,.pdf"
                        />
                        <UploadCloud size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm font-bold text-gray-600">
                          {proofFile ? proofFile.name : 'Click to browse or drag file here'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">JPEG, PNG or PDF up to 5MB</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || (method !== 'bank' && phoneNumber.length < 9) || (method === 'bank' && !proofFile)}
                  className="w-full bg-sac-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/10 mt-4"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin border-t-2" />
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Pay {amount.toLocaleString()} UGX
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
