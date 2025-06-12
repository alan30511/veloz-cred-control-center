
-- Add the missing first_payment_date column to the loans table
ALTER TABLE public.loans 
ADD COLUMN first_payment_date date;

-- Set default value for existing records to match loan_date
UPDATE public.loans 
SET first_payment_date = loan_date 
WHERE first_payment_date IS NULL;
