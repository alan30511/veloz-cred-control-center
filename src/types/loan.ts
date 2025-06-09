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
}

export interface Client {
  id: string;
  fullName: string;
  cpf?: string;
  phone?: string;
  address?: string;
}

export interface LoanFormData {
  clientId: string;
  amount: string;
  interestRate: string;
  installments: string;
}
