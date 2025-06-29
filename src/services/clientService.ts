
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/loan';

// Add timeout and retry logic
const withTimeout = <T>(promise: Promise<T>, ms: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    )
  ]);
};

export const clientService = {
  async loadClients(userId: string): Promise<Client[]> {
    const { data, error } = await withTimeout(
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );

    if (error) {
      console.error('Database error loading clients:', error);
      throw error;
    }
    
    return data?.map(client => ({
      id: client.id,
      fullName: client.full_name,
      cpf: client.cpf || '',
      phone: client.phone || '',
      address: client.address || ''
    })) || [];
  },

  async addClient(userId: string, clientData: Omit<Client, 'id'>): Promise<void> {
    const { error } = await withTimeout(
      supabase
        .from('clients')
        .insert({
          user_id: userId,
          full_name: clientData.fullName,
          cpf: clientData.cpf,
          phone: clientData.phone,
          address: clientData.address
        })
    );

    if (error) {
      console.error('Database error adding client:', error);
      throw error;
    }
  },

  async editClient(userId: string, id: string, clientData: Omit<Client, 'id'>): Promise<void> {
    const { error } = await withTimeout(
      supabase
        .from('clients')
        .update({
          full_name: clientData.fullName,
          cpf: clientData.cpf,
          phone: clientData.phone,
          address: clientData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
    );

    if (error) {
      console.error('Database error updating client:', error);
      throw error;
    }

    // Update client name in loans table as well
    await withTimeout(
      supabase
        .from('loans')
        .update({
          client_name: clientData.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('client_id', id)
        .eq('user_id', userId)
    );
  },

  async deleteClient(userId: string, id: string): Promise<void> {
    // First delete all loans associated with this client
    const { error: loansError } = await withTimeout(
      supabase
        .from('loans')
        .delete()
        .eq('client_id', id)
        .eq('user_id', userId)
    );

    if (loansError) {
      console.error('Database error deleting client loans:', loansError);
      throw loansError;
    }

    // Then delete the client
    const { error: clientError } = await withTimeout(
      supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    );

    if (clientError) {
      console.error('Database error deleting client:', clientError);
      throw clientError;
    }
  }
};
