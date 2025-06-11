
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/loan';

export const clientService = {
  async loadClients(userId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(client => ({
      id: client.id,
      fullName: client.full_name,
      cpf: client.cpf || '',
      phone: client.phone || '',
      address: client.address || ''
    })) || [];
  },

  async addClient(userId: string, clientData: Omit<Client, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        full_name: clientData.fullName,
        cpf: clientData.cpf,
        phone: clientData.phone,
        address: clientData.address
      });

    if (error) throw error;
  },

  async editClient(userId: string, id: string, clientData: Omit<Client, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .update({
        full_name: clientData.fullName,
        cpf: clientData.cpf,
        phone: clientData.phone,
        address: clientData.address
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    // Update client name in loans table as well
    await supabase
      .from('loans')
      .update({
        client_name: clientData.fullName
      })
      .eq('client_id', id)
      .eq('user_id', userId);
  },

  async deleteClient(userId: string, id: string): Promise<void> {
    // First delete all loans associated with this client
    const { error: loansError } = await supabase
      .from('loans')
      .delete()
      .eq('client_id', id)
      .eq('user_id', userId);

    if (loansError) throw loansError;

    // Then delete the client
    const { error: clientError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (clientError) throw clientError;
  }
};
