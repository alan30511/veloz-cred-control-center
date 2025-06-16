
import { useState, useEffect } from 'react';
import { Installment } from '@/types/installment';
import { Loan, Client } from '@/types/loan';

export const useInstallments = (loans: Loan[], clients: Client[], paidInstallments: string[] = []) => {
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
        
        const installmentId = `${loan.id}-${i}`;
        
        // Verifica se esta parcela já foi marcada como paga
        const isPaid = paidInstallments.includes(installmentId);
        
        let status: "pending" | "paid" | "overdue" = "pending";
        let lateFee = 0;
        
        if (isPaid) {
          status = "paid";
        } else if (dueDate < today) {
          status = "overdue";
          // Calcula multa: R$ 10,00 por dia de atraso
          const diffTime = today.getTime() - dueDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          lateFee = diffDays * 10;
        }
        
        const totalAmount = loan.monthlyPayment + lateFee;
        
        newInstallments.push({
          id: installmentId,
          loanId: loan.id,
          clientName: loan.clientName,
          clientWhatsapp: client.phone || "(11) 99999-9999",
          installmentNumber: i,
          totalInstallments: loan.installments,
          amount: loan.monthlyPayment,
          dueDate: dueDate.toISOString().split('T')[0],
          status,
          lateFee,
          totalAmount,
          paidDate: isPaid ? new Date().toISOString().split('T')[0] : undefined
        });
      }
    });
    
    setInstallments(newInstallments);
  };

  useEffect(() => {
    generateInstallments();
  }, [loans, clients, paidInstallments]);

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
