import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loan, Client, LoanFormData } from '@/types/loan';
import { calculateLoanDetails } from '@/utils/loanCalculations';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadClients();
      loadLoans();
    } else {
      // Clear data when user logs out
      setClients([]);
      setLoans([]);
      setInstallments([]);
      setLoading(false);
    }
  }, [user]);

  // Generate installments when loans change
  useEffect(() => {
    generateInstallments();
  }, [loans, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map Supabase data to Client interface
      const formattedClients = data?.map(client => ({
        id: client.id,
        fullName: client.full_name,
        cpf: client.cpf || '',
        phone: client.phone || '',
        address: client.address || ''
      })) || [];
      
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
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map Supabase data to Loan interface
      const formattedLoans = data?.map(loan => ({
        id: loan.id,
        clientId: loan.client_id,
        clientName: loan.client_name,
        amount: Number(loan.amount),
        interestRate: Number(loan.interest_rate),
        installments: loan.installments,
        totalAmount: Number(loan.total_amount),
        monthlyPayment: Number(loan.monthly_payment),
        loanDate: loan.loan_date,
        status: loan.status as "active" | "completed"
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

  const clearAllData = async () => {
    if (!user) return;

    try {
      // Delete all loans first (due to foreign key constraints)
      await supabase
        .from('loans')
        .delete()
        .eq('user_id', user.id);

      // Then delete all clients
      await supabase
        .from('clients')
        .delete()
        .eq('user_id', user.id);

      // Reload data to update state
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
        .eq('id', loanId)
        .eq('user_id', user?.id);

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
        .eq('id', loanId)
        .eq('user_id', user?.id);

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
          full_name: clientData.fullName,
          cpf: clientData.cpf,
          phone: clientData.phone,
          address: clientData.address
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
          full_name: clientData.fullName,
          cpf: clientData.cpf,
          phone: clientData.phone,
          address: clientData.address
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update client name in loans table as well
      await supabase
        .from('loans')
        .update({
          client_name: clientData.fullName
        })
        .eq('client_id', id)
        .eq('user_id', user?.id);

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

      // First delete all loans associated with this client
      const { error: loansError } = await supabase
        .from('loans')
        .delete()
        .eq('client_id', id)
        .eq('user_id', user?.id);

      if (loansError) throw loansError;

      // Then delete the client
      const { error: clientError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (clientError) throw clientError;

      // Reload both clients and loans to update state immediately
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
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Relatório de Clientes e Empréstimos', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
      
      // Prepare data for the table
      const reportData = clients.map(client => {
        const clientLoans = loans.filter(loan => loan.clientId === client.id);
        const clientInstallments = installments.filter(inst => 
          clientLoans.some(loan => loan.id === inst.loanId)
        );
        
        return clientLoans.map(loan => {
          const loanInstallments = clientInstallments.filter(inst => inst.loanId === loan.id);
          const paidInstallments = loanInstallments.filter(inst => inst.status === "paid").length;
          const remainingInstallments = loan.installments - paidInstallments;

          return [
            client.fullName,
            `R$ ${loan.amount.toLocaleString('pt-BR')}`,
            `${loan.interestRate}%`,
            loan.installments.toString(),
            paidInstallments.toString(),
            remainingInstallments.toString(),
            `R$ ${loan.totalAmount.toLocaleString('pt-BR')}`,
            new Date(loan.loanDate).toLocaleDateString('pt-BR'),
            loan.status === "active" ? "Ativo" : "Finalizado"
          ];
        });
      }).flat();

      // Table headers
      const headers = [
        'Cliente',
        'Valor Empréstimo',
        'Taxa Juros',
        'Total Parcelas',
        'Parcelas Pagas',
        'Parcelas Restantes',
        'Valor Total',
        'Data Empréstimo',
        'Status'
      ];

      // Generate table
      autoTable(doc, {
        head: [headers],
        body: reportData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255
        }
      });

      // Statistics section
      const stats = calculateStats();
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      
      doc.setFontSize(14);
      doc.text('Resumo Estatístico', 20, finalY);
      
      doc.setFontSize(10);
      doc.text(`Total Emprestado: R$ ${stats.totalLoaned.toLocaleString('pt-BR')}`, 20, finalY + 10);
      doc.text(`Total em Juros: R$ ${stats.totalReceived.toLocaleString('pt-BR')}`, 20, finalY + 20);
      doc.text(`Clientes Ativos: ${stats.activeClients}`, 20, finalY + 30);
      doc.text(`Empréstimos Ativos: ${stats.activeLoans}`, 20, finalY + 40);
      doc.text(`Pagamentos Atrasados: ${stats.overduePayments}`, 20, finalY + 50);

      // Save the PDF
      doc.save(`relatorio-clientes-${new Date().toISOString().split('T')[0]}.pdf`);

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
    markInstallmentAsPaid,
    calculateStats,
    generateReport,
    clearAllData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
