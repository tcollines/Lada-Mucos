require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Supabase. Read from environment variables.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://frhaqssmnzqqvvecnrqe.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaGFxc3NtbnpxcXZ2ZWNucnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMDIwMTQsImV4cCI6MjA4MTc3ODAxNH0.XA_3W32z2bxDKWzdFLOExDa9PvBUFuPF6Jou3zzd9gU';

if (!supabaseUrl) {
  console.warn("WARNING: Supabase URL not configured correctly in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET endpoint to fetch all initial data (mirrors fetchAllData in store.ts)
app.get('/api/data', async (req, res) => {
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

    res.json({
      users,
      wallets,
      transactions,
      opportunities,
      investments,
      loansData,
      groups,
      posts,
      notifications,
      messages,
      withdrawals,
      preRegistrations
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST endpoint to persist data changes
app.post('/api/persist', async (req, res) => {
  const { table, data } = req.body;
  
  if (!table || !data) {
    return res.status(400).json({ error: 'Table and data are required' });
  }

  // Handle table mapping
  let dbTable = table;
  const tableMapping = {
    'opportunities': 'investment_opportunities',
    'posts': 'feed_posts',
    'messages': 'chat_messages',
    'withdrawalRequests': 'withdrawal_requests',
    'loanOffers': 'loans',
    'preRegistrations': 'pre_registrations'
  };

  if (tableMapping[table]) {
    dbTable = tableMapping[table];
  }

  try {
    // The data coming in should already be formatted by the frontend,
    // but we can pass it directly to Supabase since we are just acting as a passthrough API right now.
    const { data: result, error } = await supabase.from(dbTable).upsert(data);
    
    if (error) {
      console.error(`Supabase Upsert Error on ${dbTable}:`, error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(`Failed to persist to ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// POST endpoint to handle email invites locally (Mock)
app.post('/api/send-referral-invite', async (req, res) => {
  const { email, referrerCode } = req.body;
  if (!email || !referrerCode) {
    return res.status(400).json({ error: 'Email and referrerCode are required.' });
  }

  // MOCK: In a real app, integrate Nodemailer, SendGrid, Resend, etc. here.
  console.log(`[MOCK EMAIL] Sending referral invite to: ${email} with code: ${referrerCode}`);
  
  // Add an intentional slight delay to simulate network/email sending
  await new Promise(resolve => setTimeout(resolve, 800));

  res.json({ success: true, message: 'Invite sent successfully.' });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});