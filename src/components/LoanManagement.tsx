
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
            // Transform the form data to match the expected Loan interface
            const loanData = {
              clientId: formData.clientId,
              amount: formData.amount,
              interestRate: formData.interestRate,
              installments: formData.installments
            };
            createLoan(loanData);
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <div className="grid gap-4">
        {loans.map((loan) => {
          const client = clients.find(c => c.id === loan.clientId);
          // Transform loan to match expected format for LoanCard
          const transformedLoan = {
            ...loan,
            clientName: client?.name || 'Cliente não encontrado',
            totalAmount: loan.amount,
            monthlyPayment: loan.amount / loan.installments,
            loanDate: loan.createdAt,
            status: 'active' as const
          };

          return (
            <LoanCard
              key={loan.id}
              loan={transformedLoan}
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
