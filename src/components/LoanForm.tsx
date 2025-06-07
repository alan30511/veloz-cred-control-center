
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, LoanFormData } from "@/types/loan";
import { calculateLoanDetails } from "@/utils/loanCalculations";

interface LoanFormProps {
  clients: Client[];
  onSubmit: (formData: LoanFormData) => void;
  onCancel: () => void;
}

const LoanForm = ({ clients, onSubmit, onCancel }: LoanFormProps) => {
  const [formData, setFormData] = useState<LoanFormData>({
    clientId: "",
    amount: "",
    interestRate: "20",
    installments: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      clientId: "",
      amount: "",
      interestRate: "20",
      installments: ""
    });
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
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoanForm;
