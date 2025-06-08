
import { useAppContext } from "@/contexts/AppContext";

export const useLoanManagement = () => {
  const {
    loans,
    clients,
    createLoan,
    editLoanRate,
    deleteLoan,
    calculateStats
  } = useAppContext();

  return {
    loans,
    clients,
    isFormOpen: false,
    setIsFormOpen: () => {},
    editingLoan: null,
    setEditingLoan: () => {},
    createLoan,
    editLoanRate,
    deleteLoan,
    calculateStats
  };
};
