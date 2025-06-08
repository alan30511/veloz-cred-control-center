import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ClientManagement from "@/components/ClientManagement";
import LoanManagement from "@/components/LoanManagement";
import InstallmentTracking from "@/components/InstallmentTracking";
import ClientCounter from "@/components/ClientCounter";
import PlanSelector from "@/components/PlanSelector";
import UserSettings from "@/components/UserSettings";
import { usePlans } from "@/hooks/usePlans";
import { useAppContext } from "@/contexts/AppContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { plans, userPlan, changePlan } = usePlans();
  const { calculateStats } = useAppContext();

  // Get real-time stats from app context
  const stats = calculateStats();

  const handlePlanChange = (planId: string) => {
    changePlan(planId);
    setActiveTab("dashboard");
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "clients":
        return <ClientManagement userPlan={userPlan} />;
      case "loans":
        return <LoanManagement />;
      case "installments":
        return <InstallmentTracking />;
      case "settings":
        return <UserSettings />;
      case "plans":
        return (
          <PlanSelector
            plans={plans}
            currentPlanId={userPlan.currentPlan.id}
            onSelectPlan={handlePlanChange}
            onClose={() => setActiveTab("dashboard")}
          />
        );
      default:
        return (
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Emprestado
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.totalLoaned.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total em Juros
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.totalReceived.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Empréstimos Ativos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeLoans}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pagamentos Atrasados
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.overduePayments}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Empréstimos Recentes</CardTitle>
                  <CardDescription>
                    Últimos empréstimos cadastrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">João Silva</p>
                        <p className="text-xs text-muted-foreground">R$ 5.000 - 10x</p>
                      </div>
                      <div className="text-sm text-muted-foreground">Hoje</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Maria Santos</p>
                        <p className="text-xs text-muted-foreground">R$ 3.000 - 6x</p>
                      </div>
                      <div className="text-sm text-muted-foreground">Ontem</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximos Vencimentos</CardTitle>
                  <CardDescription>
                    Parcelas que vencem nos próximos dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ana Costa</p>
                        <p className="text-xs text-muted-foreground">R$ 600 - Parcela 3/8</p>
                      </div>
                      <div className="text-sm text-red-600">Amanhã</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Carlos Lima</p>
                        <p className="text-xs text-muted-foreground">R$ 450 - Parcela 2/5</p>
                      </div>
                      <div className="text-sm text-yellow-600">3 dias</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto">
              <ClientCounter userPlan={userPlan} />
            </div>
          </header>
          <main className="flex-1 space-y-4 p-6">
            {renderActiveComponent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
