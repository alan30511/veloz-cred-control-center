
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Client } from '@/types/client';
import { Loan } from '@/types/loan';
import { Installment } from '@/types/installment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Stats {
  totalLoaned: number;
  totalReceived: number;
  activeLoans: number;
  overduePayments: number;
}

interface AppContextType {
  clients: Client[];
  loans: Loan[];
  installments: Installment[];
  createClient: (client: Omit<Client, 'id'>) => void;
  editClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  createLoan: (loan: Omit<Loan, 'id'>) => void;
  editLoanRate: (id: string, rate: number) => void;
  deleteLoan: (id: string) => void;
  markInstallmentAsPaid: (id: string) => void;
  calculateStats: () => Stats;
  generateReport: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);

  const createClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = { ...client, id: Math.random().toString(36).substring(2, 15) };
    setClients([...clients, newClient]);
  };

  const editClient = (id: string, client: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...client } : c));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    // Also delete loans and installments related to this client
    const clientLoans = loans.filter(loan => loan.clientId === id);
    setLoans(loans.filter(loan => loan.clientId !== id));
    setInstallments(installments.filter(installment => 
      !clientLoans.some(loan => loan.id === installment.loanId)
    ));
  };

  const createLoan = (loan: Omit<Loan, 'id'>) => {
    const newLoan: Loan = {
      ...loan,
      id: Math.random().toString(36).substring(2, 15),
      startDate: new Date(),
      createdAt: new Date()
    };

    // Generate installments
    const installmentAmount = loan.amount / loan.installments;
    const client = clients.find(c => c.id === loan.clientId);
    
    const newInstallments: Installment[] = Array.from({ length: loan.installments }, (_, i) => {
      const dueDate = new Date(newLoan.createdAt);
      dueDate.setMonth(dueDate.getMonth() + i + 1);

      const installment: Installment = {
        id: Math.random().toString(36).substring(2, 15),
        loanId: newLoan.id,
        dueDate,
        amount: installmentAmount + (loan.amount * loan.interestRate / 100 / loan.installments),
        paid: false,
        status: 'pending',
        clientName: client?.name,
        installmentNumber: i + 1,
        totalInstallments: loan.installments,
        clientWhatsapp: client?.phone
      };

      return installment;
    });

    setLoans([...loans, newLoan]);
    setInstallments([...installments, ...newInstallments]);
  };

  const editLoanRate = (id: string, rate: number) => {
    setLoans(loans.map(loan => loan.id === id ? { ...loan, interestRate: rate } : loan));
  };

  const deleteLoan = (id: string) => {
    setLoans(loans.filter(loan => loan.id !== id));
    setInstallments(installments.filter(installment => installment.loanId !== id));
  };

  const markInstallmentAsPaid = (id: string) => {
    setInstallments(installments.map(installment => 
      installment.id === id ? { 
        ...installment, 
        paid: true, 
        status: 'paid' as const,
        paidDate: new Date()
      } : installment
    ));
  };

  const calculateStats = (): Stats => {
    const totalLoaned = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalReceived = installments
      .filter(installment => installment.paid)
      .reduce((sum, installment) => sum + installment.amount, 0);
    const activeLoans = loans.length;
    const overduePayments = installments.filter(installment => 
      !installment.paid && installment.dueDate < new Date()
    ).length;

    return {
      totalLoaned,
      totalReceived,
      activeLoans,
      overduePayments
    };
  };

  const generateReport = () => {
    const doc = new jsPDF();
    
    // Título do relatório
    doc.setFontSize(20);
    doc.text('Relatório de Clientes e Empréstimos', 20, 20);
    
    // Data do relatório
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Preparar dados para a tabela
    const tableData = clients.map(client => {
      const clientLoans = loans.filter(loan => loan.clientId === client.id);
      
      return clientLoans.map(loan => {
        const loanInstallments = installments.filter(inst => inst.loanId === loan.id);
        const paidInstallments = loanInstallments.filter(inst => inst.paid).length;
        const remainingInstallments = loanInstallments.length - paidInstallments;
        
        return [
          client.name,
          client.email,
          client.phone,
          `R$ ${loan.amount.toLocaleString('pt-BR')}`,
          loan.installments.toString(),
          `${loan.interestRate}%`,
          new Date(loan.createdAt).toLocaleDateString('pt-BR'),
          paidInstallments.toString(),
          remainingInstallments.toString()
        ];
      });
    }).flat();

    // Configurar a tabela
    (doc as any).autoTable({
      head: [['Nome', 'Email', 'Telefone', 'Valor Empréstimo', 'Total Parcelas', 'Taxa Juros', 'Data Empréstimo', 'Parcelas Pagas', 'Parcelas Restantes']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { top: 50 }
    });
    
    // Salvar o arquivo
    doc.save('relatorio-clientes-emprestimos.pdf');
  };

  return (
    <AppContext.Provider value={{
      clients,
      loans,
      installments,
      createClient,
      editClient,
      deleteClient,
      createLoan,
      editLoanRate,
      deleteLoan,
      markInstallmentAsPaid,
      calculateStats,
      generateReport
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
