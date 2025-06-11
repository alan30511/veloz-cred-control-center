
-- Add new columns to the clients table
ALTER TABLE public.clients 
ADD COLUMN cpf TEXT,
ADD COLUMN phone TEXT, 
ADD COLUMN address TEXT;
