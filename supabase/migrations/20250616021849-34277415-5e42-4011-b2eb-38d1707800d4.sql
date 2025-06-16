
-- First, let's check what policies already exist and drop them to recreate consistently
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view their own loans" ON public.loans;
DROP POLICY IF EXISTS "Users can insert their own loans" ON public.loans;
DROP POLICY IF EXISTS "Users can update their own loans" ON public.loans;
DROP POLICY IF EXISTS "Users can delete their own loans" ON public.loans;

-- Enable Row Level Security on all tables that need it
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients table
CREATE POLICY "Users can view their own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for loans table
CREATE POLICY "Users can view their own loans" ON public.loans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans" ON public.loans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans" ON public.loans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans" ON public.loans
  FOR DELETE USING (auth.uid() = user_id);

-- Add constraints for data validation (with IF NOT EXISTS logic)
DO $$
BEGIN
    -- Add constraint for clients user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'clients' AND constraint_name = 'clients_user_id_not_null'
    ) THEN
        ALTER TABLE public.clients ADD CONSTRAINT clients_user_id_not_null CHECK (user_id IS NOT NULL);
    END IF;

    -- Add constraints for loans
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'loans' AND constraint_name = 'loans_user_id_not_null'
    ) THEN
        ALTER TABLE public.loans ADD CONSTRAINT loans_user_id_not_null CHECK (user_id IS NOT NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'loans' AND constraint_name = 'loans_amount_positive'
    ) THEN
        ALTER TABLE public.loans ADD CONSTRAINT loans_amount_positive CHECK (amount > 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'loans' AND constraint_name = 'loans_interest_rate_valid'
    ) THEN
        ALTER TABLE public.loans ADD CONSTRAINT loans_interest_rate_valid CHECK (interest_rate >= 0 AND interest_rate <= 100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'loans' AND constraint_name = 'loans_installments_positive'
    ) THEN
        ALTER TABLE public.loans ADD CONSTRAINT loans_installments_positive CHECK (installments > 0);
    END IF;
END $$;
