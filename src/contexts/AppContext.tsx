
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loan, Client, LoanFormData } from '@/types/loan';
import { Installment } from '@/types/installment';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { clientService } from '@/services/clientService';
import { loanService } from '@/services/loanService';
import { useInstallments } from '@/hooks/useInstallments';
import { useStats } from '@/hooks/useStats';
import { generateReport } from '@/services/reportService';

interface AppContextType {
  loans: Loan[];
  clients: Client[];
  installments: Installment[];
  loading: boolean;
  createLoan: (formData: LoanFormData) => Promise<void>;
  editLoanRate: (loanId: string, newRate: number) => Promise<void>;
  deleteLoan: (loanId: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  editClient: (id: string, client: Omit<Client, 'id'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  markInstallmentAsPaid: (id: string) => void;
  calculateStats: () => any;
  generateReport: () => void;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const { installments, markInstallmentAsPaid } = useInstallments(loans, clients);
  const stats = useStats(loans, installments);

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadClients();
      loadLoans();
    } else {
      setClients([]);
      setLoans([]);
      setLoading(false);
    }
  }, [user]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const formattedClients = await clientService.loadClients(user!.id);
      setClients(formattedClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLoans = async () => {
    try {
      const formattedLoans = await loanService.loadLoans(user!.id);
      setLoans(formattedLoans);
    } catch (error) {
      console.error('Error loading loans:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empréstimos",
        variant: "destructive"
      });
    }
  };

  const clearAllData = async () => {
    if (!user) return;

    try {
      await supabase.from('loans').delete().eq('user_id', user.id);
      await supabase.from('clients').delete().eq('user_id', user.id);

      await loadClients();
      await loadLoans();

      toast({
        title: "Dados limpos",
        description: "Todos os dados foram removidos com sucesso"
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar dados",
        variant: "destructive"
      });
    }
  };

  const createLoan = async (formData: LoanFormData) => {
    if (!user) return;

    try {
      const client = clients.find(c => c.id === formData.clientId);
      if (!client) return;

      await loanService.createLoan(user.id, formData, client.fullName);
      await loadLoans();
      
      toast({
        title: "Empréstimo criado",
        description: `Empréstimo de R$ ${parseFloat(formData.amount).toLocaleString()} criado para ${client.fullName}`
      });
    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar empréstimo",
        variant: "destructive"
      });
    }
  };

  const editLoanRate = async (loanId: string, newRate: number) => {
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return;

      await loanService.editLoanRate(user!.id, loanId, loan.amount, newRate, loan.installments);
      await loadLoans();

      toast({
        title: "Taxa atualizada",
        description: `Taxa de juros alterada para ${newRate}% ao mês`
      });
    } catch (error) {
      console.error('Error updating loan rate:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar taxa",
        variant: "destructive"
      });
    }
  };

  const deleteLoan = async (loanId: string) => {
    try {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) return;

      await loanService.deleteLoan(user!.id, loanId);
      await loadLoans();
      
      toast({
        title: "Empréstimo excluído",
        description: `Empréstimo de ${loan.clientName} foi removido`,
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir empréstimo",
        variant: "destructive"
      });
    }
  };

  const addClient = async (clientData: Omit<Client, 'id'>) => {
    if (!user) return;

    try {
      await clientService.addClient(user.id, clientData);
      await loadClients();

      toast({
        title: "Cliente adicionado",
        description: `${clientData.fullName} foi adicionado com sucesso`
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar cliente",
        variant: "destructive"
      });
    }
  };

  const editClient = async (id: string, clientData: Omit<Client, 'id'>) => {
    try {
      await clientService.editClient(user!.id, id, clientData);
      await loadClients();
      await loadLoans();

      toast({
        title: "Cliente atualizado",
        description: `Dados de ${clientData.fullName} foram atualizados`
      });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente",
        variant: "destructive"
      });
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const client = clients.find(c => c.id === id);
      if (!client) return;

      await clientService.deleteClient(user!.id, id);
      await loadClients();
      await loadLoans();

      toast({
        title: "Cliente removido",
        description: `${client.fullName} e todos os empréstimos associados foram removidos`,
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover cliente",
        variant: "destructive"
      });
    }
  };

  const handleMarkInstallmentAsPaid = (id: string) => {
    markInstallmentAsPaid(id);
    toast({
      title: "Parcela marcada como paga",
      description: "A parcela foi atualizada com sucesso."
    });
  };

  const handleGenerateReport = () => {
    try {
      generateReport(clients, loans, installments, stats);
      toast({
        title: "Relatório gerado",
        description: "O arquivo PDF foi baixado com sucesso."
      });
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório PDF",
        variant: "destructive"
      });
    }
  };

  const value = {
    loans,
    clients,
    installments,
    loading,
    createLoan,
    editLoanRate,
    deleteLoan,
    addClient,
    editClient,
    deleteClient,
    markInstallmentAsPaid: handleMarkInstallmentAsPaid,
    calculateStats: () => stats,
    generateReport: handleGenerateReport,
    clearAllData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
