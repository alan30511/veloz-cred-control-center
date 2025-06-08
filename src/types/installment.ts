
export interface Installment {
  id: string;
  loanId: string;
  dueDate: Date;
  amount: number;
  paid: boolean;
  status?: 'paid' | 'pending' | 'overdue';
  clientName?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  paidDate?: Date;
  clientWhatsapp?: string;
}
