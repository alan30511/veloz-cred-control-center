
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, AlertCircle, MessageSquare, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/AppContext";

const InstallmentTracking = () => {
  const { installments, markInstallmentAsPaid, clients, loans } = useAppContext();
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const { toast } = useToast();

  const getInstallmentStatus = (installment: any) => {
    if (installment.paid) return 'paid';
    if (installment.dueDate < new Date()) return 'overdue';
    return 'pending';
  };

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
    const loan = loans.find(l => l.id === installment.loanId);
    const client = clients.find(c => c.id === loan?.clientId);
    
    if (!client) return;
    
    const cleanNumber = client.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${client.name}! 📅\n\n` +
      `Lembrete: Sua parcela ${installment.installmentNumber || 1}/${installment.totalInstallments || 1} ` +
      `no valor de R$ ${installment.amount.toLocaleString()} ` +
      `vence em ${new Date(installment.dueDate).toLocaleDateString()}.\n\n` +
      `Por favor, entre em contato para confirmar o pagamento.\n\n` +
      `Obrigado!\nVeloz Cred`
    );
    
    window.open(`https://wa.me/55${cleanNumber}?text=${message}`, '_blank');
    
    toast({
      title: "WhatsApp aberto",
      description: "Mensagem de lembrete preparada para envio."
    });
  };

  const getDaysDifference = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const enrichedInstallments = installments.map(installment => {
    const loan = loans.find(l => l.id === installment.loanId);
    const client = clients.find(c => c.id === loan?.clientId);
    const status = getInstallmentStatus(installment);
    
    return {
      ...installment,
      status,
      clientName: client?.name,
      clientWhatsapp: client?.phone,
      installmentNumber: installment.installmentNumber || 1,
      totalInstallments: installment.totalInstallments || loan?.installments || 1
    };
  });

  const filteredInstallments = enrichedInstallments.filter(installment => {
    if (filter === "all") return true;
    return installment.status === filter;
  });

  const stats = {
    total: enrichedInstallments.length,
    paid: enrichedInstallments.filter(i => i.status === "paid").length,
    pending: enrichedInstallments.filter(i => i.status === "pending").length,
    overdue: enrichedInstallments.filter(i => i.status === "overdue").length,
    totalAmount: enrichedInstallments.reduce((sum, i) => sum + i.amount, 0),
    paidAmount: enrichedInstallments.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Acompanhamento de Parcelas</h2>
          <p className="text-muted-foreground">Gerencie pagamentos e envie lembretes</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Parcela:</p>
                        <p className="font-semibold">
                          {installment.installmentNumber}/{installment.totalInstallments}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor:</p>
                        <p className="font-semibold">R$ {installment.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Vencimento:</p>
                        <p className="font-semibold">
                          {new Date(installment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status:</p>
                        <p className={`font-semibold ${
                          installment.status === 'overdue' ? 'text-red-600' : 
                          installment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {installment.status === 'overdue' 
                            ? `${Math.abs(daysDiff)} dias atrasado`
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
                        onClick={() => markInstallmentAsPaid(installment.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Marcar como Pago
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
