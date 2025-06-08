
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loan, Client, LoanFormData } from '@/types/loan';
import { calculateLoanDetails } from '@/utils/loanCalculations';
import { useToast } from '@/hooks/use-toast';

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
  createLoan: (formData: LoanFormData) => void;
  editLoanRate: (loanId: string, newRate: number) => void;
  deleteLoan: (loanId: string) => void;
  addClient: (client: Omit<Client, 'id'>) => void;
  editClient: (id: string, client: Omit<Client, 'id'>) => void;
  deleteClient: (id: string) => void;
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

  const [clients, setClients] = useState<Client[]>([
    { id: "1", fullName: "João Silva" },
    { id: "2", fullName: "Maria Santos" },
    { id: "3", fullName: "Ana Costa" },
    { id: "4", fullName: "Carlos Lima" }
  ]);

  const [loans, setLoans] = useState<Loan[]>([
    {
      id: "1",
      clientId: "1",
      clientName: "João Silva",
      amount: 5000,
      interestRate: 20,
      installments: 10,
      totalAmount: 6000,
      monthlyPayment: 600,
      loanDate: "2024-01-15",
      status: "active"
    },
    {
      id: "2",
      clientId: "2", 
      clientName: "Maria Santos",
      amount: 3000,
      interestRate: 20,
      installments: 6,
      totalAmount: 3600,
      monthlyPayment: 600,
      loanDate: "2024-02-01",
      status: "active"
    }
  ]);

  const [installments, setInstallments] = useState<Installment[]>([]);

  // Generate installments when loans change
  useEffect(() => {
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

    generateInstallments();
  }, [loans, clients]);

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

  const createLoan = (formData: LoanFormData) => {
    const amount = parseFloat(formData.amount);
    const interestRate = parseFloat(formData.interestRate);
    const installmentsCount = parseInt(formData.installments);
    
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    const { totalAmount, monthlyPayment } = calculateLoanDetails(amount, interestRate, installmentsCount);

    const newLoan: Loan = {
      id: Date.now().toString(),
      clientId: formData.clientId,
      clientName: client.fullName,
      amount,
      interestRate,
      installments: installmentsCount,
      totalAmount,
      monthlyPayment,
      loanDate: new Date().toISOString().split('T')[0],
      status: "active"
    };

    setLoans(prev => [...prev, newLoan]);
    
    toast({
      title: "Empréstimo criado",
      description: `Empréstimo de R$ ${amount.toLocaleString()} criado para ${client.fullName}`
    });
  };

  const editLoanRate = (loanId: string, newRate: number) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        const { totalAmount, monthlyPayment } = calculateLoanDetails(loan.amount, newRate, loan.installments);
        return {
          ...loan,
          interestRate: newRate,
          totalAmount,
          monthlyPayment
        };
      }
      return loan;
    }));

    toast({
      title: "Taxa atualizada",
      description: `Taxa de juros alterada para ${newRate}% ao mês`
    });
  };

  const deleteLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    setLoans(prev => prev.filter(l => l.id !== loanId));
    
    toast({
      title: "Empréstimo excluído",
      description: `Empréstimo de ${loan.clientName} foi removido`,
      variant: "destructive"
    });
  };

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      id: Date.now().toString(),
      ...clientData
    };
    setClients(prev => [...prev, newClient]);
  };

  const editClient = (id: string, clientData: Omit<Client, 'id'>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...clientData } : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    // Also remove loans for this client
    setLoans(prev => prev.filter(loan => loan.clientId !== id));
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
