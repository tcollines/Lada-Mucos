
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  INVEST = 'invest',
  PAYOUT = 'payout',
  LOAN_SENT = 'loan_sent',
  LOAN_RECEIVED = 'loan_received',
  FEE = 'fee',
  AFFILIATE_REWARD = 'affiliate_reward',
  MEMBERSHIP_FEE = 'membership_fee'
}

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  nin: string;
  dob: string;
  nextOfKinName: string;
  nextOfKinContact: string;
  profession: string;
  employer: string;
  educationLevel: string;
  monthlyEarningsRange: string;
  address: string;
  city: string;
  district: string;
  country: string;
  membershipPaid: boolean;
  walletId: string;
  affiliateCode: string;
  referredBy?: string;
  groupId?: string;
  creditScore: number;
  createdAt: string;
  coverPhoto?: string;
  meta?: any;
}

export interface Wallet {
  id: string;
  userId: string;
  balanceUGX: number;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  description: string;
  createdAt: string;
  meta?: any;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  meta?: any;
}

export interface InvestmentOpportunity {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  minInvestment: number;
  maxInvestment: number;
  status: 'open' | 'closed' | 'pending_review' | 'rejected';
  images: string[];
  startDate: string;
  endDate: string;
  createdBy: string;
  roi?: string;
  type?: 'open' | 'closed';
  proposalUrl?: string;
  participantCount?: number;
  rejectionReason?: string;
  discussion?: Array<{
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
  }>;
  meta?: any;
}

export interface Investment {
  id: string;
  userId: string;
  opportunityId: string;
  amount: number;
  createdAt: string;
}

export interface LoanOffer {
  id: string;
  lenderId: string;
  minAmount: number;
  maxAmount: number;
  interestPercent: number;
  durationMonths: number;
  status: 'active' | 'closed' | 'offer';
  createdAt: string;
  meta?: any;
}

export interface Loan {
  id: string;
  borrowerId: string;
  lenderId: string | null;
  principal: number;
  interestRate: number;
  termMonths: number;
  remainingBalance: number;
  status: 'pending' | 'approved' | 'active' | 'repaid' | 'defaulted';
  createdAt: string;
  meta?: any;
}

export interface Group {
  id: string;
  name: string;
  memberIds: string[];
  chatId: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  adminId: string;
  title: string;
  body: string;
  images: string[];
  likes: string[];
  comments: Array<{ userId: string; text: string; createdAt: string }>;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface PreRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  amountPaid: number;
  claimed: boolean;
  createdAt: string;
}
