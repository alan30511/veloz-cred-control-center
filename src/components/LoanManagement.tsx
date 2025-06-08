
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLoanManagement } from "@/hooks/useLoanManagement";
import LoanForm from "./LoanForm";
import LoanCard from "./LoanCard";

const LoanManagement = () => {
  const {
    loans,
    clients,
    isFormOpen,
    setIsFormOpen,
    editingLoan,
    setEditingLoan,
    createLoan,
    editLoanRate,
    deleteLoan
  } = useLoanManagement();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Empréstimos</h2>
          <p className="text-muted-foreground">Cadastre e acompanhe empréstimos</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Empréstimo
        </Button>
      </div>

      {isFormOpen && (
        <LoanForm
          clients={clients}
          onSubmit={createLoan}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <div className="grid gap-4">
        {loans.map((loan) => (
          <LoanCard
            key={loan.id}
            loan={loan}
            editingLoan={editingLoan}
            onEditRate={editLoanRate}
            onStartEdit={setEditingLoan}
            onCancelEdit={() => setEditingLoan(null)}
            onDelete={deleteLoan}
          />
        ))}
      </div>
    </div>
  );
};

export default LoanManagement;
