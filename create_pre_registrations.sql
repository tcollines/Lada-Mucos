-- Run this SQL in your Supabase SQL Editor to create the pre_registrations table.

CREATE TABLE if not exists public.pre_registrations (
    id text primary key,
    name text,
    email text,
    phone text,
    amount_paid numeric,
    claimed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS and allow anonymous access (matching the rest of the app's setup)
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for anon" 
ON public.pre_registrations 
FOR ALL USING (true) WITH CHECK (true);
