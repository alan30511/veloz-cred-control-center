
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import LoanForm from "./LoanForm";
import LoanCard from "./LoanCard";

const LoanManagement = () => {
  const {
    loans,
    clients,
    createLoan,
    editLoanRate,
    deleteLoan,
    generateReport
  } = useAppContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<string | null>(null);

  // Transform clients to match the expected format for LoanForm
  const transformedClients = clients.map(client => ({
    ...client,
    fullName: client.name
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Empréstimos</h2>
          <p className="text-muted-foreground">Cadastre e acompanhe empréstimos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Empréstimo
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <LoanForm
          clients={transformedClients}
          onSubmit={(formData) => {
            createLoan(formData);
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <div className="grid gap-4">
        {loans.map((loan) => {
          return (
            <LoanCard
              key={loan.id}
              loan={loan}
              editingLoan={editingLoan}
              onEditRate={editLoanRate}
              onStartEdit={setEditingLoan}
              onCancelEdit={() => setEditingLoan(null)}
              onDelete={deleteLoan}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LoanManagement;
