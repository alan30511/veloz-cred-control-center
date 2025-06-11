
export interface Installment {
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
