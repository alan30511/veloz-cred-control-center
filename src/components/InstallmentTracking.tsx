
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, AlertCircle, MessageSquare, DollarSign, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/AppContext";

const InstallmentTracking = () => {
  const { installments, markInstallmentAsPaid } = useAppContext();
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
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

  const sendWhatsAppReminder = (installment: any) => {
    const cleanNumber = installment.clientWhatsapp.replace(/\D/g, '');
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
  };

  const getDaysDifference = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const confirmPayment = (installment: any) => {
    const lateFeeText = installment.lateFee && installment.lateFee > 0 
      ? ` (incluindo R$ ${installment.lateFee.toLocaleString()} de multa por atraso)`
      : '';
    
    const confirmed = window.confirm(
      `Confirmar pagamento da parcela ${installment.installmentNumber}/${installment.totalInstallments} ` +
      `de ${installment.clientName}?\n\n` +
      `Valor: R$ ${(installment.totalAmount || installment.amount).toLocaleString()}${lateFeeText}`
    );
    
    if (confirmed) {
      markInstallmentAsPaid(installment.id);
    }
  };

  const filteredInstallments = installments.filter(installment => {
    if (filter === "all") return true;
    return installment.status === filter;
  });

  const stats = {
    total: installments.length,
    paid: installments.filter(i => i.status === "paid").length,
    pending: installments.filter(i => i.status === "pending").length,
    overdue: installments.filter(i => i.status === "overdue").length,
    totalAmount: installments.reduce((sum, i) => sum + i.amount, 0),
    paidAmount: installments.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0),
    totalLateFees: installments.reduce((sum, i) => sum + (i.lateFee || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Acompanhamento de Parcelas</h2>
          <p className="text-muted-foreground">Gerencie pagamentos e envie lembretes</p>
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Parcelas em atraso têm multa de R$ 10,00 por dia. 
                Use o botão "Confirmar Pagamento" para marcar como pago.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Parcelas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pagas</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Multas Acumuladas</p>
                <p className="text-2xl font-bold text-red-600">R$ {stats.totalLateFees.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              Todas ({stats.total})
            </Button>
            <Button 
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
            >
              Pendentes ({stats.pending})
            </Button>
            <Button 
              variant={filter === "paid" ? "default" : "outline"}
              onClick={() => setFilter("paid")}
            >
              Pagas ({stats.paid})
            </Button>
            <Button 
              variant={filter === "overdue" ? "default" : "outline"}
              onClick={() => setFilter("overdue")}
            >
              Atrasadas ({stats.overdue})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Parcelas */}
      <div className="grid gap-4">
        {filteredInstallments.map((installment) => {
          const daysDiff = getDaysDifference(installment.dueDate);
          
          return (
            <Card key={installment.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(installment.status)}
                      <h3 className="font-semibold text-lg">{installment.clientName}</h3>
                      {getStatusBadge(installment.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Parcela:</p>
                        <p className="font-semibold">
                          {installment.installmentNumber}/{installment.totalInstallments}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor Original:</p>
                        <p className="font-semibold">R$ {installment.amount.toLocaleString()}</p>
                      </div>
                      {installment.lateFee && installment.lateFee > 0 && (
                        <div>
                          <p className="text-muted-foreground">Multa por Atraso:</p>
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
                      <p className={`font-semibold ${
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
                  
                  <div className="flex gap-2">
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
                        Confirmar Pagamento
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInstallments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma parcela encontrada para o filtro selecionado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstallmentTracking;
