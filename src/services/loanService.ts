
import { supabase } from '@/integrations/supabase/client';
import { Loan, LoanFormData } from '@/types/loan';
import { calculateLoanDetails } from '@/utils/loanCalculations';

export const loanService = {
  async loadLoans(userId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(loan => ({
      id: loan.id,
      clientId: loan.client_id,
      clientName: loan.client_name,
      amount: Number(loan.amount),
      interestRate: Number(loan.interest_rate),
      installments: loan.installments,
      totalAmount: Number(loan.total_amount),
      monthlyPayment: Number(loan.monthly_payment),
      loanDate: loan.loan_date,
      firstPaymentDate: loan.first_payment_date || loan.loan_date,
      status: loan.status as "active" | "completed"
    })) || [];
  },

  async createLoan(userId: string, formData: LoanFormData, clientName: string): Promise<void> {
    const amount = parseFloat(formData.amount);
    const interestRate = parseFloat(formData.interestRate);
    const installmentsCount = parseInt(formData.installments);

    const { totalAmount, monthlyPayment } = calculateLoanDetails(amount, interestRate, installmentsCount);

    const { error } = await supabase
      .from('loans')
      .insert({
        user_id: userId,
        client_id: formData.clientId,
        client_name: clientName,
        amount,
        interest_rate: interestRate,
        installments: installmentsCount,
        total_amount: totalAmount,
        monthly_payment: monthlyPayment,
        loan_date: formData.loanDate.toISOString().split('T')[0],
        first_payment_date: formData.firstPaymentDate.toISOString().split('T')[0],
        status: 'active'
      });

    if (error) throw error;
  },

  async editLoanRate(userId: string, loanId: string, amount: number, newRate: number, installments: number): Promise<void> {
    const { totalAmount, monthlyPayment } = calculateLoanDetails(amount, newRate, installments);

    const { error } = await supabase
      .from('loans')
      .update({
        interest_rate: newRate,
        total_amount: totalAmount,
        monthly_payment: monthlyPayment
      })
      .eq('id', loanId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async deleteLoan(userId: string, loanId: string): Promise<void> {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', loanId)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
