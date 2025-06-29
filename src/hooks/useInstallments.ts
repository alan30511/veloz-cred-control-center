
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
        
        // Simplified status logic - only paid or pending
        let status: "pending" | "paid" = "pending";
        
        if (isPaid) {
          status = "paid";
        }
        
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
          lateFee: 0,
          totalAmount: loan.monthlyPayment,
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
