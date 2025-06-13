-- Enable Row Level Security
-- USERS table is managed by Supabase Auth

-- PROFILES table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  avatar_url TEXT,
  age INTEGER,
  income NUMERIC,
  monthly_expenses NUMERIC,
  risk_tolerance TEXT, -- 'low', 'medium', 'high'
  onboarded BOOLEAN DEFAULT FALSE,
  plaid_access_token TEXT,
  plaid_item_id TEXT,
  CONSTRAINT age_check CHECK (age >= 0 AND age <= 120),
  CONSTRAINT income_check CHECK (income >= 0),
  CONSTRAINT monthly_expenses_check CHECK (monthly_expenses >= 0)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- DEBTS table
CREATE TABLE public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL, -- e.g., 'Credit Card', 'Student Loan', 'Mortgage'
  amount NUMERIC NOT NULL,
  interest_rate NUMERIC, -- Annual percentage rate
  CONSTRAINT amount_positive CHECK (amount > 0),
  CONSTRAINT interest_rate_range CHECK (interest_rate IS NULL OR (interest_rate >= 0 AND interest_rate <= 100))
);

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own debts." ON public.debts FOR ALL USING (auth.uid() = user_id);

-- GOALS table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL, -- e.g., 'Retire by 60', 'Buy a house in 5 years'
  target_age INTEGER,
  target_amount NUMERIC,
  priority INTEGER -- Optional, for ranking goals
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals." ON public.goals FOR ALL USING (auth.uid() = user_id);


-- CALL TRANSCRIPTS table
CREATE TABLE public.call_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  transcript_text TEXT NOT NULL,
  summary TEXT -- For active memory
);

ALTER TABLE public.call_transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own call transcripts." ON public.call_transcripts FOR ALL USING (auth.uid() = user_id);


-- ADVICE HISTORY table
CREATE TABLE public.advice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  prompt_text TEXT,
  advice_payload JSONB -- { savings_rate: "...", investment_allocation: "...", debt_strategy: "..." }
);

ALTER TABLE public.advice_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own advice history." ON public.advice_history FOR ALL USING (auth.uid() = user_id);

-- Function to automatically update profiles.updated_at
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_profile_update();
