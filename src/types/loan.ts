
export interface Loan {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  interestRate: number;
  installments: number;
  totalAmount: number;
  monthlyPayment: number;
  loanDate: string;
  status: "active" | "completed";
  createdAt: Date;
  startDate: Date;
}

export interface Client {
  id: string;
  fullName: string;
}

export interface LoanFormData {
  clientId: string;
  amount: string;
  interestRate: string;
  installments: string;
}
