
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loan, Client, LoanFormData } from '@/types/loan';
import { calculateLoanDetails } from '@/utils/loanCalculations';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Installment {
  id: string;
  loanId: string;
  clientName: string;
  clientWhatsapp: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  paidDate?: string;
}

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
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadClients();
      loadLoans();
    }
  }, [user]);

  // Generate installments when loans change
  useEffect(() => {
    generateInstallments();
  }, [loans, clients]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setClients(data || []);
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
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedLoans = data?.map(loan => ({
        ...loan,
        amount: Number(loan.amount),
        interestRate: Number(loan.interest_rate),
        totalAmount: Number(loan.total_amount),
        monthlyPayment: Number(loan.monthly_payment),
        loanDate: loan.loan_date
      })) || [];
      
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

  const generateInstallments = () => {
    const newInstallments: Installment[] = [];
    
    loans.forEach(loan => {
      const client = clients.find(c => c.id === loan.clientId);
      if (!client) return;

      for (let i = 1; i <= loan.installments; i++) {
        const dueDate = new Date(loan.loanDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        newInstallments.push({
          id: `${loan.id}-${i}`,
          loanId: loan.id,
          clientName: loan.clientName,
          clientWhatsapp: "(11) 99999-9999", // Mock data
          installmentNumber: i,
          totalInstallments: loan.installments,
          amount: loan.monthlyPayment,
          dueDate: dueDate.toISOString().split('T')[0],
          status: i <= 1 ? "paid" : i === 2 ? "overdue" : "pending",
          paidDate: i <= 1 ? new Date().toISOString().split('T')[0] : undefined
        });
      }
    });
    
    setInstallments(newInstallments);
  };

  const calculateStats = () => {
    const activeLoans = loans.filter(loan => loan.status === "active");
    const totalLoaned = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalReceived = activeLoans.reduce((sum, loan) => sum + (loan.totalAmount - loan.amount), 0);
    const activeClients = new Set(activeLoans.map(loan => loan.clientId)).size;
    const overduePayments = installments.filter(i => i.status === "overdue").length;
    
    return {
      totalLoaned,
      totalReceived,
      activeClients,
      activeLoans: activeLoans.length,
      overduePayments
    };
  };

  const createLoan = async (formData: LoanFormData) => {
    if (!user) return;

    try {
      const amount = parseFloat(formData.amount);
      const interestRate = parseFloat(formData.interestRate);
      const installmentsCount = parseInt(formData.installments);
      
      const client = clients.find(c => c.id === formData.clientId);
      if (!client) return;

      const { totalAmount, monthlyPayment } = calculateLoanDetails(amount, interestRate, installmentsCount);

      const { error } = await supabase
        .from('loans')
        .insert({
          user_id: user.id,
          client_id: formData.clientId,
          client_name: client.fullName,
          amount,
          interest_rate: interestRate,
          installments: installmentsCount,
          total_amount: totalAmount,
          monthly_payment: monthlyPayment,
          status: 'active'
        });

      if (error) throw error;

      await loadLoans();
      
      toast({
        title: "Empréstimo criado",
        description: `Empréstimo de R$ ${amount.toLocaleString()} criado para ${client.fullName}`
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

      const { totalAmount, monthlyPayment } = calculateLoanDetails(loan.amount, newRate, loan.installments);

      const { error } = await supabase
        .from('loans')
        .update({
          interest_rate: newRate,
          total_amount: totalAmount,
          monthly_payment: monthlyPayment
        })
        .eq('id', loanId);

      if (error) throw error;

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

      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', loanId);

      if (error) throw error;

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
      const { error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          full_name: clientData.fullName
        });

      if (error) throw error;

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
      const { error } = await supabase
        .from('clients')
        .update({
          full_name: clientData.fullName
        })
        .eq('id', id);

      if (error) throw error;

      await loadClients();
      await loadLoans(); // Reload loans to update client names

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

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadClients();
      await loadLoans(); // Reload loans to reflect changes

      toast({
        title: "Cliente removido",
        description: `${client.fullName} foi removido com sucesso`,
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

  const markInstallmentAsPaid = (id: string) => {
    setInstallments(prev => prev.map(installment => 
      installment.id === id 
        ? { ...installment, status: "paid" as const, paidDate: new Date().toISOString().split('T')[0] }
        : installment
    ));
    
    toast({
      title: "Parcela marcada como paga",
      description: "A parcela foi atualizada com sucesso."
    });
  };

  const generateReport = () => {
    const reportData = clients.map(client => {
      const clientLoans = loans.filter(loan => loan.clientId === client.id);
      const clientInstallments = installments.filter(inst => 
        clientLoans.some(loan => loan.id === inst.loanId)
      );
      
      return clientLoans.map(loan => {
        const loanInstallments = clientInstallments.filter(inst => inst.loanId === loan.id);
        const paidInstallments = loanInstallments.filter(inst => inst.status === "paid").length;
        const remainingInstallments = loan.installments - paidInstallments;

        return {
          "Nome do Cliente": client.fullName,
          "Valor do Empréstimo": `R$ ${loan.amount.toLocaleString()}`,
          "Taxa de Juros": `${loan.interestRate}%`,
          "Total de Parcelas": loan.installments,
          "Parcelas Pagas": paidInstallments,
          "Parcelas Restantes": remainingInstallments,
          "Valor Total": `R$ ${loan.totalAmount.toLocaleString()}`,
          "Data do Empréstimo": new Date(loan.loanDate).toLocaleDateString(),
          "Status": loan.status === "active" ? "Ativo" : "Finalizado"
        };
      });
    }).flat();

    // Convert to CSV
    const headers = Object.keys(reportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-clientes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Relatório gerado",
      description: "O arquivo CSV foi baixado com sucesso."
    });
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
    markInstallmentAsPaid,
    calculateStats,
    generateReport
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
