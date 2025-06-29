
import { useMemo } from 'react';
import { Loan } from '@/types/loan';
import { Installment } from '@/types/installment';

export const useStats = (loans: Loan[], installments: Installment[]) => {
  return useMemo(() => {
    const activeLoans = loans.filter(loan => loan.status === "active");
    const totalLoaned = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalReceived = activeLoans.reduce((sum, loan) => sum + (loan.totalAmount - loan.amount), 0);
    const activeClients = new Set(activeLoans.map(loan => loan.clientId)).size;
    const overduePayments = installments.filter(i => i.status === "pending").length; // Changed from "overdue" to "pending"
    
    return {
      totalLoaned,
      totalReceived,
      activeClients,
      activeLoans: activeLoans.length,
      overduePayments
    };
  }, [loans, installments]);
};
