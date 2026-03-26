
import { User, UserRole, Wallet, Transaction, TransactionType, InvestmentOpportunity, Investment, Loan, Group, FeedPost, Notification, ChatMessage, WithdrawalRequest, LoanOffer, PreRegistration } from './types';
import { supabase } from './supabase';

export interface AppState {
  currentUser: User | null;
  users: User[];
  wallets: Wallet[];
  transactions: Transaction[];
  opportunities: InvestmentOpportunity[];
  investments: Investment[];
  loanOffers: LoanOffer[];
  loans: Loan[];
  groups: Group[];
  posts: FeedPost[];
  notifications: Notification[];
  messages: ChatMessage[];
  withdrawalRequests: WithdrawalRequest[];
  preRegistrations: PreRegistration[];
}

export const initialData: AppState = {
  currentUser: null,
  users: [],
  wallets: [],
  transactions: [],
  withdrawalRequests: [],
  opportunities: [],
  investments: [],
  loanOffers: [],
  loans: [],
  groups: [],
  posts: [],
  notifications: [],
  messages: [],
  preRegistrations: []
};

export interface PersistenceChange {
  table: string;
  data: any;
}

export const fetchAllData = async (): Promise<Partial<AppState>> => {
  try {
    const [
      { data: users },
      { data: wallets },
      { data: transactions },
      { data: opportunities },
      { data: investments },
      { data: loansData },
      { data: groups },
      { data: posts },
      { data: notifications },
      { data: messages },
      { data: withdrawals },
      { data: preRegistrations }
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('wallets').select('*'),
      supabase.from('transactions').select('*'),
      supabase.from('investment_opportunities').select('*'),
      supabase.from('investments').select('*'),
      supabase.from('loans').select('*'),
      supabase.from('groups').select('*'),
      supabase.from('feed_posts').select('*'),
      supabase.from('notifications').select('*'),
      supabase.from('chat_messages').select('*'),
      supabase.from('withdrawal_requests').select('*'),
      supabase.from('pre_registrations').select('*')
    ]);

    const mappedUsers = (users || []).map(u => ({
      id: u.id,
      role: u.role,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      password: u.password,
      nin: u.nin,
      dob: u.dob,
      nextOfKinName: u.next_of_kin_name,
      nextOfKinContact: u.next_of_kin_contact,
      profession: u.profession,
      employer: u.employer,
      educationLevel: u.education_level,
      monthlyEarningsRange: u.monthly_earnings_range,
      address: u.address,
      city: u.city,
      district: u.district,
      country: u.country,
      membershipPaid: u.membership_paid,
      walletId: u.wallet_id,
      affiliateCode: u.affiliate_code,
      referredBy: u.referred_by,
      groupId: u.group_id,
      creditScore: u.credit_score,
      createdAt: u.created_at,
      coverPhoto: u.cover_photo
    }));

    const mappedLoans: Loan[] = [];
    const mappedOffers: LoanOffer[] = [];

    (loansData || []).forEach(l => {
      if (l.status === 'pending' && l.lender_id && (!l.borrower_id || l.borrower_id === l.lender_id)) {
        mappedOffers.push({
          id: l.id,
          lenderId: l.lender_id,
          minAmount: l.principal / 2,
          maxAmount: l.principal,
          interestPercent: l.interest_rate,
          durationMonths: l.term_months,
          status: 'active',
          createdAt: l.created_at
        });
      } else {
        mappedLoans.push({
          id: l.id,
          borrowerId: l.borrower_id,
          lenderId: l.lender_id,
          principal: l.principal,
          interestRate: l.interest_rate,
          termMonths: l.term_months,
          remainingBalance: l.remaining_balance,
          status: l.status,
          createdAt: l.created_at
        });
      }
    });

    return {
      users: mappedUsers,
      wallets: (wallets || []).map(w => ({
        id: w.id,
        userId: w.user_id,
        balanceUGX: w.balance_ugx
      })),
      transactions: (transactions || []).map(t => ({
        id: t.id,
        walletId: t.wallet_id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        createdAt: t.created_at
      })),
      opportunities: (opportunities || []).map(o => ({
        id: o.id,
        title: o.title,
        description: o.description,
        goalAmount: o.goal_amount,
        raisedAmount: o.raised_amount,
        minInvestment: o.min_investment,
        maxInvestment: o.max_investment,
        status: o.status,
        images: o.images,
        startDate: o.start_date,
        endDate: o.end_date,
        createdBy: o.created_by,
        roi: o.roi,
        type: o.type,
        proposalUrl: o.proposal_url,
        participantCount: o.participant_count,
        rejectionReason: o.rejection_reason,
        discussion: []
      })),
      investments: (investments || []).map(i => ({
        id: i.id,
        userId: i.user_id,
        opportunityId: i.opportunity_id,
        amount: i.amount,
        createdAt: i.created_at
      })),
      loanOffers: mappedOffers,
      loans: mappedLoans,
      groups: (groups || []).map(g => ({
        id: g.id,
        name: g.name,
        memberIds: g.member_ids || [],
        chatId: g.chat_id,
        createdAt: g.created_at
      })),
      posts: (posts || []).map(p => ({
        id: p.id,
        adminId: p.admin_id,
        title: p.title,
        body: p.body,
        images: p.images,
        likes: p.likes || [],
        comments: p.comments || [],
        createdAt: p.created_at
      })),
      notifications: (notifications || []).map(n => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        message: n.message,
        read: n.read,
        createdAt: n.created_at
      })),
      messages: (messages || []).map(m => ({
        id: m.id,
        groupId: m.group_id,
        senderId: m.sender_id,
        text: m.text,
        createdAt: m.created_at
      })),
      withdrawalRequests: (withdrawals || []).map(w => ({
        id: w.id,
        userId: w.user_id,
        amount: w.amount,
        status: w.status,
        createdAt: w.created_at
      })),
      preRegistrations: (preRegistrations || []).map(pr => ({
        id: pr.id,
        name: pr.name,
        email: pr.email,
        phone: pr.phone,
        amountPaid: pr.amount_paid,
        claimed: pr.claimed,
        createdAt: pr.created_at
      }))
    };
  } catch (error) {
    console.error("Error fetching data from Supabase:", error);
    return {};
  }
};

export const persistToSupabase = async (state: AppState, lastChange?: PersistenceChange | PersistenceChange[]) => {
  if (!lastChange) return;

  const changes = Array.isArray(lastChange) ? lastChange : [lastChange];

  for (const change of changes) {
    const { table, data } = change;
    try {
      const mappedData: any = {};

      for (const [key, value] of Object.entries(data)) {
        if (key === 'meta' || key === 'discussion') continue;


        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (value instanceof File) continue;

        if (key === 'images' && Array.isArray(value)) {
          mappedData[snakeKey] = value.map(img =>
            typeof img === 'string' && img.startsWith('blob:')
              ? `https://picsum.photos/seed/lada-${Math.random()}/800/400`
              : img
          );
          continue;
        }

        mappedData[snakeKey] = value === undefined ? null : value;
      }

      const tableMapping: Record<string, string> = {
        'opportunities': 'investment_opportunities',
        'posts': 'feed_posts',
        'messages': 'chat_messages',
        'withdrawalRequests': 'withdrawal_requests',
        'users': 'users',
        'wallets': 'wallets',
        'transactions': 'transactions',
        'investments': 'investments',
        'loans': 'loans',
        'loanOffers': 'loans',
        'groups': 'groups',
        'notifications': 'notifications',
        'preRegistrations': 'pre_registrations'
      };

      const dbTable = tableMapping[table] || table;

      // Handle the loanOffers special mapping to 'loans' table
      if (table === 'loanOffers') {
        mappedData.status = 'pending';
        mappedData.lender_id = data.lenderId;
        mappedData.borrower_id = data.lenderId;
        mappedData.interest_rate = data.interestPercent;
        mappedData.term_months = data.durationMonths;
        mappedData.principal = data.maxAmount;
        mappedData.remaining_balance = data.maxAmount;

        delete mappedData.interest_percent;
        delete mappedData.duration_months;
        delete mappedData.min_amount;
        delete mappedData.max_amount;
      }

      const { data: result, error } = await supabase.from(dbTable).upsert(mappedData);
      if (error) throw new Error(error.message);

    } catch (err: any) {
      console.error(`Failed to persist to ${table}:`, err?.message || err);
    }
  }
};
