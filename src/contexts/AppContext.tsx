import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  const [paidInstallments, setPaidInstallments] = useState<string[]>([]);

  const { installments, markInstallmentAsPaid: updateInstallmentStatus } = useInstallments(loans, clients, paidInstallments);
  const stats = useStats(loans, installments);

  // Memoize storage key to avoid recalculation
  const storageKey = useMemo(() => 
    user ? `paidInstallments_${user.id}` : null, 
    [user?.id]
  );

  // Load paid installments from localStorage
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setPaidInstallments(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading paid installments:', error);
          setPaidInstallments([]);
        }
      }
    }
  }, [storageKey]);

  // Memoize save function to avoid recreation
  const savePaidInstallments = useCallback((installmentIds: string[]) => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(installmentIds));
    }
  }, [storageKey]);

  // Optimized data loading functions
  const loadClients = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const formattedClients = await clientService.loadClients(user.id);
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
  }, [user?.id, toast]);

  const loadLoans = useCallback(async () => {
    if (!user) return;
    
    try {
      const formattedLoans = await loanService.loadLoans(user.id);
      setLoans(formattedLoans);
    } catch (error) {
      console.error('Error loading loans:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empréstimos",
        variant: "destructive"
      });
    }
  }, [user?.id, toast]);

  // Load data from Supabase only when user changes
  useEffect(() => {
    if (user) {
      loadClients();
      loadLoans();
    } else {
      setClients([]);
      setLoans([]);
      setPaidInstallments([]);
      setLoading(false);
    }
  }, [user, loadClients, loadLoans]);

  const clearAllData = async () => {
    if (!user) return;

    try {
      await supabase.from('loans').delete().eq('user_id', user.id);
      await supabase.from('clients').delete().eq('user_id', user.id);

      setPaidInstallments([]);
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }

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
      
      const updatedPaidInstallments = paidInstallments.filter(id => !id.startsWith(loanId));
      setPaidInstallments(updatedPaidInstallments);
      savePaidInstallments(updatedPaidInstallments);
      
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

      const clientLoans = loans.filter(l => l.clientId === id);
      const loanIds = clientLoans.map(l => l.id);
      const updatedPaidInstallments = paidInstallments.filter(installmentId => {
        const loanId = installmentId.split('-')[0];
        return !loanIds.includes(loanId);
      });
      setPaidInstallments(updatedPaidInstallments);
      savePaidInstallments(updatedPaidInstallments);

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

  const handleMarkInstallmentAsPaid = useCallback((id: string) => {
    updateInstallmentStatus(id);
    
    const newPaidInstallments = [...paidInstallments, id];
    setPaidInstallments(newPaidInstallments);
    savePaidInstallments(newPaidInstallments);
    
    toast({
      title: "Parcela marcada como paga",
      description: "A parcela foi atualizada com sucesso."
    });
  }, [updateInstallmentStatus, paidInstallments, savePaidInstallments, toast]);

  const handleGenerateReport = useCallback(() => {
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
  }, [clients, loans, installments, stats, toast]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
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
  }), [
    loans,
    clients,
    installments,
    loading,
    stats,
    handleMarkInstallmentAsPaid,
    handleGenerateReport
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
