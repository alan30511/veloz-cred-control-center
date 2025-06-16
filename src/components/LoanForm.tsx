
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Client, LoanFormData } from "@/types/loan";
import { calculateLoanDetails } from "@/utils/loanCalculations";
import { validateLoanAmount, validateInterestRate, validateInstallments } from "@/utils/inputValidation";
import { ValidationMessage } from "@/components/InputValidation";

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
    installments: "",
    loanDate: new Date(),
    firstPaymentDate: new Date()
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = "Selecione um cliente";
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || !validateLoanAmount(amount)) {
      newErrors.amount = "Digite um valor entre R$ 0,01 e R$ 1.000.000";
    }

    const interestRate = parseFloat(formData.interestRate);
    if (!formData.interestRate || isNaN(interestRate) || !validateInterestRate(interestRate)) {
      newErrors.interestRate = "Digite uma taxa entre 0% e 100%";
    }

    const installments = parseInt(formData.installments);
    if (!formData.installments || isNaN(installments) || !validateInstallments(installments)) {
      newErrors.installments = "Digite um número entre 1 e 60 parcelas";
    }

    if (formData.firstPaymentDate < formData.loanDate) {
      newErrors.firstPaymentDate = "Data do primeiro vencimento não pode ser anterior à data do empréstimo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
    setFormData({
      clientId: "",
      amount: "",
      interestRate: "20",
      installments: "",
      loanDate: new Date(),
      firstPaymentDate: new Date()
    });
    setErrors({});
  };

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setFormData({...formData, amount: cleanValue});
    
    if (errors.amount) {
      const amount = parseFloat(cleanValue);
      if (!isNaN(amount) && validateLoanAmount(amount)) {
        const { amount: _, ...restErrors } = errors;
        setErrors(restErrors);
      }
    }
  };

  const handleInterestRateChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setFormData({...formData, interestRate: cleanValue});
    
    if (errors.interestRate) {
      const rate = parseFloat(cleanValue);
      if (!isNaN(rate) && validateInterestRate(rate)) {
        const { interestRate: _, ...restErrors } = errors;
        setErrors(restErrors);
      }
    }
  };

  const handleInstallmentsChange = (value: string) => {
    // Only allow integers
    const cleanValue = value.replace(/[^0-9]/g, '');
    setFormData({...formData, installments: cleanValue});
    
    if (errors.installments) {
      const installments = parseInt(cleanValue);
      if (!isNaN(installments) && validateInstallments(installments)) {
        const { installments: _, ...restErrors } = errors;
        setErrors(restErrors);
      }
    }
  };

  const previewCalculation = () => {
    if (!formData.amount || !formData.installments) return null;
    
    const amount = parseFloat(formData.amount);
    const interestRate = parseFloat(formData.interestRate);
    const installments = parseInt(formData.installments);
    
    if (isNaN(amount) || isNaN(interestRate) || isNaN(installments)) return null;
    
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
              <Select value={formData.clientId} onValueChange={(value) => {
                setFormData({...formData, clientId: value});
                if (errors.clientId) {
                  const { clientId: _, ...restErrors } = errors;
                  setErrors(restErrors);
                }
              }}>
                <SelectTrigger className={errors.clientId ? 'border-red-500' : ''}>
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
              {errors.clientId && <ValidationMessage message={errors.clientId} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor do Empréstimo (R$)</Label>
              <Input
                id="amount"
                type="text"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="5000"
                className={errors.amount ? 'border-red-500' : ''}
                required
              />
              {errors.amount && <ValidationMessage message={errors.amount} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Taxa de Juros Mensal (%)</Label>
              <Input
                id="interestRate"
                type="text"
                value={formData.interestRate}
                onChange={(e) => handleInterestRateChange(e.target.value)}
                placeholder="20"
                className={errors.interestRate ? 'border-red-500' : ''}
                required
              />
              {errors.interestRate && <ValidationMessage message={errors.interestRate} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments">Número de Parcelas</Label>
              <Input
                id="installments"
                type="text"
                value={formData.installments}
                onChange={(e) => handleInstallmentsChange(e.target.value)}
                placeholder="10"
                className={errors.installments ? 'border-red-500' : ''}
                required
              />
              {errors.installments && <ValidationMessage message={errors.installments} />}
            </div>

            <div className="space-y-2">
              <Label>Data da Solicitação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.loanDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.loanDate ? format(formData.loanDate, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.loanDate}
                    onSelect={(date) => setFormData({...formData, loanDate: date || new Date()})}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data do Primeiro Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.firstPaymentDate && "text-muted-foreground",
                      errors.firstPaymentDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.firstPaymentDate ? format(formData.firstPaymentDate, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.firstPaymentDate}
                    onSelect={(date) => {
                      setFormData({...formData, firstPaymentDate: date || new Date()});
                      if (errors.firstPaymentDate) {
                        const { firstPaymentDate: _, ...restErrors } = errors;
                        setErrors(restErrors);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.firstPaymentDate && <ValidationMessage message={errors.firstPaymentDate} />}
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
