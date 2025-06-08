
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Calendar, Edit, Trash2 } from "lucide-react";
import { Loan } from "@/types/loan";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LoanCardProps {
  loan: Loan;
  editingLoan: string | null;
  onEditRate: (loanId: string, newRate: number) => void;
  onStartEdit: (loanId: string) => void;
  onCancelEdit: () => void;
  onDelete: (loanId: string) => void;
}

const LoanCard = ({ loan, editingLoan, onEditRate, onStartEdit, onCancelEdit, onDelete }: LoanCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{loan.clientName}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${
                loan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {loan.status === 'active' ? 'Ativo' : 'Finalizado'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Valor Emprestado:</p>
                <p className="font-semibold">R$ {loan.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor Total:</p>
                <p className="font-semibold">R$ {loan.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Parcela Mensal:</p>
                <p className="font-semibold">R$ {loan.monthlyPayment.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Parcelas:</p>
                <p className="font-semibold">{loan.installments}x</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Data: {new Date(loan.loanDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {editingLoan === loan.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue={loan.interestRate}
                      className="w-20 h-6 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onEditRate(loan.id, parseFloat(e.currentTarget.value));
                        }
                        if (e.key === 'Escape') {
                          onCancelEdit();
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value !== loan.interestRate.toString()) {
                          onEditRate(loan.id, parseFloat(e.target.value));
                        } else {
                          onCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                    <span>% a.m.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span>Juros: {loan.interestRate}% a.m.</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onStartEdit(loan.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Empréstimo</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o empréstimo de {loan.clientName}? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(loan.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCard;
