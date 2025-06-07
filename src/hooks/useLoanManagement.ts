
import { useState } from "react";
import { Loan, Client, LoanFormData } from "@/types/loan";
import { calculateLoanDetails } from "@/utils/loanCalculations";
import { useToast } from "@/hooks/use-toast";

export const useLoanManagement = () => {
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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<string | null>(null);

  const { toast } = useToast();

  // Mock clients data
  const clients: Client[] = [
    { id: "1", fullName: "João Silva" },
    { id: "2", fullName: "Maria Santos" },
    { id: "3", fullName: "Ana Costa" },
    { id: "4", fullName: "Carlos Lima" }
  ];

  const createLoan = (formData: LoanFormData) => {
    const amount = parseFloat(formData.amount);
    const interestRate = parseFloat(formData.interestRate);
    const installments = parseInt(formData.installments);
    
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    const { totalAmount, monthlyPayment } = calculateLoanDetails(amount, interestRate, installments);

    const newLoan: Loan = {
      id: Date.now().toString(),
      clientId: formData.clientId,
      clientName: client.fullName,
      amount,
      interestRate,
      installments,
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

    setIsFormOpen(false);
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

    setEditingLoan(null);
  };

  return {
    loans,
    clients,
    isFormOpen,
    setIsFormOpen,
    editingLoan,
    setEditingLoan,
    createLoan,
    editLoanRate
  };
};
