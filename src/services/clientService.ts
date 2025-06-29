
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
    const query = supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data, error } = await withTimeout(query, 10000);

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
    const query = supabase
      .from('clients')
      .insert({
        user_id: userId,
        full_name: clientData.fullName,
        cpf: clientData.cpf,
        phone: clientData.phone,
        address: clientData.address
      });

    const { error } = await withTimeout(query, 10000);

    if (error) {
      console.error('Database error adding client:', error);
      throw error;
    }
  },

  async editClient(userId: string, id: string, clientData: Omit<Client, 'id'>): Promise<void> {
    const query = supabase
      .from('clients')
      .update({
        full_name: clientData.fullName,
        cpf: clientData.cpf,
        phone: clientData.phone,
        address: clientData.address,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);

    const { error } = await withTimeout(query, 10000);

    if (error) {
      console.error('Database error updating client:', error);
      throw error;
    }

    // Update client name in loans table as well
    const loansQuery = supabase
      .from('loans')
      .update({
        client_name: clientData.fullName,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', id)
      .eq('user_id', userId);

    await withTimeout(loansQuery, 10000);
  },

  async deleteClient(userId: string, id: string): Promise<void> {
    // First delete all loans associated with this client
    const loansQuery = supabase
      .from('loans')
      .delete()
      .eq('client_id', id)
      .eq('user_id', userId);

    const { error: loansError } = await withTimeout(loansQuery, 10000);

    if (loansError) {
      console.error('Database error deleting client loans:', loansError);
      throw loansError;
    }

    // Then delete the client
    const clientQuery = supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    const { error: clientError } = await withTimeout(clientQuery, 10000);

    if (clientError) {
      console.error('Database error deleting client:', clientError);
      throw clientError;
    }
  }
};
