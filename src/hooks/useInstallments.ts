
import { useState, useEffect, useMemo } from 'react';
import { Installment } from '@/types/installment';
import { Loan, Client } from '@/types/loan';

export const useInstallments = (loans: Loan[], clients: Client[], paidInstallments: string[] = []) => {
  const [installments, setInstallments] = useState<Installment[]>([]);

  // Memoize clients lookup for better performance
  const clientsMap = useMemo(() => {
    return clients.reduce((acc, client) => {
      acc[client.id] = client;
      return acc;
    }, {} as Record<string, Client>);
  }, [clients]);

  // Memoize paid installments set for faster lookup
  const paidInstallmentsSet = useMemo(() => {
    return new Set(paidInstallments);
  }, [paidInstallments]);

  const generateInstallments = useMemo(() => {
    const newInstallments: Installment[] = [];
    
    loans.forEach(loan => {
      const client = clientsMap[loan.clientId];
      if (!client) return;

      const firstPaymentDate = new Date(loan.firstPaymentDate || loan.loanDate);

      for (let i = 1; i <= loan.installments; i++) {
        const dueDate = new Date(firstPaymentDate);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        
        const installmentId = `${loan.id}-${i}`;
        
        // Use Set for faster lookup
        const isPaid = paidInstallmentsSet.has(installmentId);
        
        // Check if installment is overdue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDateOnly = new Date(dueDate);
        dueDateOnly.setHours(0, 0, 0, 0);
        
        let status: "pending" | "paid" | "overdue" = "pending";
        
        if (isPaid) {
          status = "paid";
        } else if (dueDateOnly < today) {
          status = "overdue";
        }

        // Calculate late fee for overdue installments (R$ 10 per day)
        const daysDiff = Math.ceil((today.getTime() - dueDateOnly.getTime()) / (1000 * 60 * 60 * 24));
        const lateFee = status === "overdue" ? daysDiff * 10 : 0;
        
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
          totalAmount: loan.monthlyPayment + lateFee,
          paidDate: isPaid ? new Date().toISOString().split('T')[0] : undefined
        });
      }
    });
    
    return newInstallments;
  }, [loans, clientsMap, paidInstallmentsSet]);

  useEffect(() => {
    setInstallments(generateInstallments);
  }, [generateInstallments]);

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
