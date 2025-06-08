
export interface Loan {
  id: string;
  clientId: string;
  amount: number;
  interestRate: number;
  installments: number;
  startDate: Date;
  createdAt: Date;
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
