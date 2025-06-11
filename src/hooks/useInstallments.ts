
import { useState, useEffect } from 'react';
import { Installment } from '@/types/installment';
import { Loan, Client } from '@/types/loan';

export const useInstallments = (loans: Loan[], clients: Client[]) => {
  const [installments, setInstallments] = useState<Installment[]>([]);

  const generateInstallments = () => {
    const newInstallments: Installment[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    loans.forEach(loan => {
      const client = clients.find(c => c.id === loan.clientId);
      if (!client) return;

      const firstPaymentDate = new Date(loan.firstPaymentDate || loan.loanDate);

      for (let i = 1; i <= loan.installments; i++) {
        const dueDate = new Date(firstPaymentDate);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        
        let status: "pending" | "paid" | "overdue" = "pending";
        
        if (i === 1) {
          status = "paid";
        } else if (dueDate < today) {
          status = "overdue";
        }
        
        newInstallments.push({
          id: `${loan.id}-${i}`,
          loanId: loan.id,
          clientName: loan.clientName,
          clientWhatsapp: client.phone || "(11) 99999-9999",
          installmentNumber: i,
          totalInstallments: loan.installments,
          amount: loan.monthlyPayment,
          dueDate: dueDate.toISOString().split('T')[0],
          status,
          paidDate: status === "paid" ? new Date().toISOString().split('T')[0] : undefined
        });
      }
    });
    
    setInstallments(newInstallments);
  };

  useEffect(() => {
    generateInstallments();
  }, [loans, clients]);

  const markInstallmentAsPaid = (id: string) => {
    setInstallments(prev => prev.map(installment => 
      installment.id === id 
        ? { ...installment, status: "paid" as const, paidDate: new Date().toISOString().split('T')[0] }
        : installment
    ));
  };

  return {
    installments,
    markInstallmentAsPaid
  };
};
