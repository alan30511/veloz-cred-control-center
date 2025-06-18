
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Installment {
  id: string;
  clientName: string;
  clientWhatsapp: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  lateFee?: number;
  totalAmount?: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
}

interface ClientInstallmentGroupProps {
  clientName: string;
  installments: Installment[];
  onMarkAsPaid: (installmentId: string) => void;
}

const ClientInstallmentGroup = ({ clientName, installments, onMarkAsPaid }: ClientInstallmentGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Pago</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Atrasado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pendente</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const sendWhatsAppReminder = (installment: Installment) => {
    try {
      const cleanNumber = installment.clientWhatsapp?.replace(/\D/g, '') || '';
      if (!cleanNumber) {
        toast({
          title: "Erro",
          description: "Número de WhatsApp não encontrado para este cliente.",
          variant: "destructive"
        });
        return;
      }

      const lateFeeText = installment.lateFee && installment.lateFee > 0 
        ? `\n⚠️ Multa por atraso: R$ ${installment.lateFee.toLocaleString()}\n` 
        : '';
      
      const message = encodeURIComponent(
        `Olá ${installment.clientName}! 📅\n\n` +
        `Lembrete: Sua parcela ${installment.installmentNumber}/${installment.totalInstallments} ` +
        `no valor de R$ ${installment.amount.toLocaleString()} ` +
        `vence em ${new Date(installment.dueDate).toLocaleDateString()}.\n` +
        lateFeeText +
        `Valor total: R$ ${(installment.totalAmount || installment.amount).toLocaleString()}\n\n` +
        `Por favor, entre em contato para confirmar o pagamento.\n\n` +
        `Obrigado!\nVeloz Cred`
      );
      
      window.open(`https://wa.me/55${cleanNumber}?text=${message}`, '_blank');
      
      toast({
        title: "WhatsApp aberto",
        description: "Mensagem de lembrete preparada para envio."
      });
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir WhatsApp. Verifique o número do cliente.",
        variant: "destructive"
      });
    }
  };

  const getDaysDifference = (dueDate: string) => {
    try {
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Erro ao calcular diferença de dias:', error);
      return 0;
    }
  };

  const confirmPayment = (installment: Installment) => {
    try {
      const lateFeeText = installment.lateFee && installment.lateFee > 0 
        ? ` (incluindo R$ ${installment.lateFee.toLocaleString()} de multa por atraso)`
        : '';
      
      const confirmed = window.confirm(
        `Confirmar pagamento da parcela ${installment.installmentNumber}/${installment.totalInstallments} ` +
        `de ${installment.clientName}?\n\n` +
        `Valor: R$ ${(installment.totalAmount || installment.amount).toLocaleString()}${lateFeeText}`
      );
      
      if (confirmed) {
        onMarkAsPaid(installment.id);
        toast({
          title: "Pagamento confirmado",
          description: `Parcela ${installment.installmentNumber} de ${installment.clientName} marcada como paga.`
        });
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao confirmar pagamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const clientStats = {
    total: installments.length,
    paid: installments.filter(i => i.status === "paid").length,
    pending: installments.filter(i => i.status === "pending").length,
    overdue: installments.filter(i => i.status === "overdue").length,
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{clientName}</CardTitle>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="outline">{clientStats.total} parcelas</Badge>
                {clientStats.paid > 0 && <Badge className="bg-green-100 text-green-700">{clientStats.paid} pagas</Badge>}
                {clientStats.pending > 0 && <Badge className="bg-yellow-100 text-yellow-700">{clientStats.pending} pendentes</Badge>}
                {clientStats.overdue > 0 && <Badge className="bg-red-100 text-red-700">{clientStats.overdue} atrasadas</Badge>}
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="ml-2">{isExpanded ? 'Recolher' : 'Expandir'}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-3">
              {installments.map((installment) => {
                const daysDiff = getDaysDifference(installment.dueDate);
                
                return (
                  <div key={installment.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusIcon(installment.status)}
                          <span className="font-medium">
                            Parcela {installment.installmentNumber}/{installment.totalInstallments}
                          </span>
                          {getStatusBadge(installment.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Valor Original:</p>
                            <p className="font-semibold">R$ {installment.amount.toLocaleString()}</p>
                          </div>
                          {installment.lateFee && installment.lateFee > 0 && (
                            <div>
                              <p className="text-muted-foreground">Multa:</p>
                              <p className="font-semibold text-red-600">R$ {installment.lateFee.toLocaleString()}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Valor Total:</p>
                            <p className="font-semibold text-lg">
                              R$ {(installment.totalAmount || installment.amount).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Vencimento:</p>
                            <p className="font-semibold">
                              {new Date(installment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Status:</p>
                          <p className={`font-semibold text-sm ${
                            installment.status === 'overdue' ? 'text-red-600' : 
                            installment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {installment.status === 'overdue' 
                              ? `${Math.abs(daysDiff)} dias atrasado (R$ 10/dia)`
                              : installment.status === 'paid'
                              ? `Pago em ${installment.paidDate ? new Date(installment.paidDate).toLocaleDateString() : ''}`
                              : daysDiff > 0 
                              ? `${daysDiff} dias restantes`
                              : daysDiff === 0
                              ? 'Vence hoje'
                              : `${Math.abs(daysDiff)} dias atrasado`
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendWhatsAppReminder(installment)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        {installment.status !== "paid" && (
                          <Button 
                            size="sm"
                            onClick={() => confirmPayment(installment)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default ClientInstallmentGroup;
