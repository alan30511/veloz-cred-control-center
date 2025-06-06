
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, Calendar, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Loan {
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

const LoanManagement = () => {
  const [loans, setLoans] = useState<Loan[]>([
    {
      id: "1",
      clientId: "1",
      clientName: "João Silva",
      amount: 5000,
      interestRate: 20,
      installments: 10,
      totalAmount: 6000,
      monthlyPayment: 600,
      loanDate: "2024-01-15",
      status: "active"
    },
    {
      id: "2",
      clientId: "2", 
      clientName: "Maria Santos",
      amount: 3000,
      interestRate: 20,
      installments: 6,
      totalAmount: 3600,
      monthlyPayment: 600,
      loanDate: "2024-02-01",
      status: "active"
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientId: "",
    amount: "",
    interestRate: "20",
    installments: ""
  });

  const { toast } = useToast();

  // Mock clients data
  const clients = [
    { id: "1", fullName: "João Silva" },
    { id: "2", fullName: "Maria Santos" },
    { id: "3", fullName: "Ana Costa" },
    { id: "4", fullName: "Carlos Lima" }
  ];

  const calculateLoanDetails = (amount: number, interestRate: number, installments: number) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    const interestRate = parseFloat(formData.interestRate);
    const installments = parseInt(formData.installments);
    
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return;

    const { totalAmount, monthlyPayment } = calculateLoanDetails(amount, interestRate, installments);

    const newLoan: Loan = {
      id: Date.now().toString(),
      clientId: formData.clientId,
      clientName: client.fullName,
      amount,
      interestRate,
      installments,
      totalAmount,
      monthlyPayment,
      loanDate: new Date().toISOString().split('T')[0],
      status: "active"
    };

    setLoans(prev => [...prev, newLoan]);
    
    toast({
      title: "Empréstimo criado",
      description: `Empréstimo de R$ ${amount.toLocaleString()} criado para ${client.fullName}`
    });

    setFormData({
      clientId: "",
      amount: "",
      interestRate: "20",
      installments: ""
    });
    setIsFormOpen(false);
  };

  const handleEditRate = (loanId: string, newRate: number) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        const { totalAmount, monthlyPayment } = calculateLoanDetails(loan.amount, newRate, loan.installments);
        return {
          ...loan,
          interestRate: newRate,
          totalAmount,
          monthlyPayment
        };
      }
      return loan;
    }));

    toast({
      title: "Taxa atualizada",
      description: `Taxa de juros alterada para ${newRate}% ao mês`
    });

    setEditingLoan(null);
  };

  const previewCalculation = () => {
    if (!formData.amount || !formData.installments) return null;
    
    const amount = parseFloat(formData.amount);
    const interestRate = parseFloat(formData.interestRate);
    const installments = parseInt(formData.installments);
    
    const { totalAmount, monthlyPayment } = calculateLoanDetails(amount, interestRate, installments);
    
    return (
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-2">Preview do Empréstimo:</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Valor Total:</p>
            <p className="font-semibold">R$ {totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Juros Total:</p>
            <p className="font-semibold">R$ {(totalAmount - amount).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Valor da Parcela:</p>
            <p className="font-semibold">R$ {monthlyPayment.toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  };

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
        <Card>
          <CardHeader>
            <CardTitle>Novo Empréstimo</CardTitle>
            <CardDescription>
              Configure os detalhes do empréstimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select value={formData.clientId} onValueChange={(value) => setFormData({...formData, clientId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor do Empréstimo (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="5000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Taxa de Juros Mensal (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                    placeholder="20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <Input
                    id="installments"
                    type="number"
                    value={formData.installments}
                    onChange={(e) => setFormData({...formData, installments: e.target.value})}
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              {previewCalculation()}

              <div className="flex gap-2">
                <Button type="submit">Criar Empréstimo</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setFormData({
                      clientId: "",
                      amount: "",
                      interestRate: "20",
                      installments: ""
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loans.map((loan) => (
          <Card key={loan.id}>
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
                                handleEditRate(loan.id, parseFloat(e.currentTarget.value));
                              }
                              if (e.key === 'Escape') {
                                setEditingLoan(null);
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value !== loan.interestRate.toString()) {
                                handleEditRate(loan.id, parseFloat(e.target.value));
                              } else {
                                setEditingLoan(null);
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
                            onClick={() => setEditingLoan(loan.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LoanManagement;
