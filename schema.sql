-- Enable UUID extension (optional now, but good to have)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'MEMBER',
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  password TEXT, -- Dedicated password column
  nin TEXT,
  dob TEXT,
  next_of_kin_name TEXT,
  next_of_kin_contact TEXT,
  profession TEXT,
  employer TEXT,
  education_level TEXT,
  monthly_earnings_range TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  country TEXT,
  membership_paid BOOLEAN DEFAULT FALSE,
  wallet_id TEXT,
  affiliate_code TEXT,
  referred_by TEXT,
  group_id TEXT,
  credit_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WALLETS TABLE
CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  balance_ugx NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  wallet_id TEXT REFERENCES wallets(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INVESTMENT OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS investment_opportunities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount NUMERIC NOT NULL DEFAULT 0,
  raised_amount NUMERIC DEFAULT 0,
  min_investment NUMERIC DEFAULT 0,
  max_investment NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open',
  images TEXT[] DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by TEXT REFERENCES users(id),
  roi TEXT,
  type TEXT,
  proposal_url TEXT,
  participant_count INTEGER DEFAULT 0,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INVESTMENTS TABLE
CREATE TABLE IF NOT EXISTS investments (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  opportunity_id TEXT REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LOANS TABLE (Handles both Loans and Loan Offers)
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  borrower_id TEXT REFERENCES users(id),
  lender_id TEXT REFERENCES users(id),
  principal NUMERIC NOT NULL DEFAULT 0,
  interest_rate NUMERIC NOT NULL DEFAULT 0,
  term_months INTEGER NOT NULL DEFAULT 0,
  remaining_balance NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GROUPS TABLE
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  member_ids TEXT[] DEFAULT '{}',
  chat_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FEED POSTS TABLE
CREATE TABLE IF NOT EXISTS feed_posts (
  id TEXT PRIMARY KEY,
  admin_id TEXT REFERENCES users(id),
  title TEXT,
  body TEXT,
  images TEXT[] DEFAULT '{}',
  likes TEXT[] DEFAULT '{}',
  comments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  group_id TEXT REFERENCES groups(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WITHDRAWAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRE-REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS pre_registrations (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  amount_paid NUMERIC DEFAULT 0,
  claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
