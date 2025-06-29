
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import InstallmentStats from "./InstallmentStats";
import InstallmentFilters from "./InstallmentFilters";
import ClientInstallmentGroup from "./ClientInstallmentGroup";

const InstallmentTracking = () => {
  const { installments, markInstallmentAsPaid } = useAppContext();
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");

  const filteredInstallments = installments.filter(installment => {
    if (filter === "all") return true;
    return installment.status === filter;
  });

  // Group installments by client
  const installmentsByClient = filteredInstallments.reduce((acc, installment) => {
    const clientName = installment.clientName;
    if (!acc[clientName]) {
      acc[clientName] = [];
    }
    acc[clientName].push(installment);
    return acc;
  }, {} as Record<string, typeof installments>);

  // Sort clients by name
  const sortedClientNames = Object.keys(installmentsByClient).sort();

  const stats = {
    total: installments.length,
    paid: installments.filter(i => i.status === "paid").length,
    pending: installments.filter(i => i.status === "pending").length,
    overdue: installments.filter(i => i.status === "overdue").length,
    totalAmount: installments.reduce((sum, i) => sum + i.amount, 0),
    paidAmount: installments.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0),
    totalLateFees: installments.filter(i => i.status === "overdue").reduce((sum, i) => sum + (i.lateFee || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Acompanhamento de Parcelas</h2>
          <p className="text-muted-foreground">Gerencie pagamentos organizados por cliente</p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                <strong>Informação:</strong> Use o botão "Confirmar Pagamento" para marcar parcelas como pagas. 
                Parcelas em atraso têm multa de R$ 10 por dia.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <InstallmentStats stats={stats} />

      {/* Filtros */}
      <InstallmentFilters 
        filter={filter} 
        onFilterChange={setFilter} 
        stats={stats} 
      />

      {/* Lista de Parcelas Agrupadas por Cliente */}
      <div className="space-y-4">
        {sortedClientNames.length > 0 ? (
          sortedClientNames.map((clientName) => (
            <ClientInstallmentGroup
              key={clientName}
              clientName={clientName}
              installments={installmentsByClient[clientName]}
              onMarkAsPaid={markInstallmentAsPaid}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma parcela encontrada para o filtro selecionado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InstallmentTracking;
