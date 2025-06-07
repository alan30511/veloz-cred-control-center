
export const calculateLoanDetails = (amount: number, interestRate: number, installments: number) => {
  // Aplica a taxa de juros de forma cumulativa mensal
  const totalInterestRate = interestRate * installments;
  const totalInterest = (amount * totalInterestRate) / 100;
  const totalAmount = amount + totalInterest;
  const monthlyPayment = totalAmount / installments;
  
  return {
    totalAmount,
    monthlyPayment
  };
};
