import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileCard, MobileCardContent, MobileCardDescription, MobileCardHeader, MobileCardTitle } from "@/components/ui/mobile-card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Calendar, TrendingUp, Crown, LogOut, Trash2, User, Settings, Download } from "lucide-react";
import ClientManagement from "@/components/ClientManagement";
import LoanManagement from "@/components/LoanManagement";
import InstallmentTracking from "@/components/InstallmentTracking";
import ClientCounter from "@/components/ClientCounter";
import PlanSelector from "@/components/PlanSelector";
import UserSettings from "@/components/UserSettings";
import MobileNavigation from "@/components/MobileNavigation";
import MobileHeader from "@/components/MobileHeader";
import { usePlans } from "@/hooks/usePlans";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const {
    plans,
    userPlan,
    changePlan
  } = usePlans();
  const {
    calculateStats,
    loading,
    clearAllData,
    generateReport
  } = useAppContext();
  const {
    signOut,
    user
  } = useAuth();
  const isMobile = useIsMobile();

  // Get real-time stats from app context
  const stats = calculateStats();
  const handlePlanChange = (planId: string) => {
    changePlan(planId);
    setActiveTab("dashboard");
  };
  const handleSignOut = async () => {
    await signOut();
  };
  const handleClearData = async () => {
    if (window.confirm("Tem certeza que deseja remover todos os dados? Esta ação não pode ser desfeita.")) {
      await clearAllData();
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>;
  }
  const renderMobileDashboard = () => <div className="space-y-4 pb-20">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MobileCard>
          <MobileCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <MobileCardTitle className="text-sm">Total Emprestado</MobileCardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </MobileCardHeader>
          <MobileCardContent>
            <div className="text-xl font-bold text-primary">R$ {stats.totalLoaned.toLocaleString()}</div>
          </MobileCardContent>
        </MobileCard>

        <MobileCard>
          <MobileCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <MobileCardTitle className="text-sm">Total Juros</MobileCardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </MobileCardHeader>
          <MobileCardContent>
            <div className="text-xl font-bold text-green-600">R$ {stats.totalReceived.toLocaleString()}</div>
          </MobileCardContent>
        </MobileCard>

        <MobileCard>
          <MobileCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <MobileCardTitle className="text-sm">Empréstimos</MobileCardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </MobileCardHeader>
          <MobileCardContent>
            <div className="text-xl font-bold text-blue-600">{stats.activeLoans}</div>
          </MobileCardContent>
        </MobileCard>

        <MobileCard>
          <MobileCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <MobileCardTitle className="text-sm">Atrasados</MobileCardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </div>
          </MobileCardHeader>
          <MobileCardContent>
            <div className="text-xl font-bold text-red-600">{stats.overduePayments}</div>
          </MobileCardContent>
        </MobileCard>
      </div>

      {/* Quick Actions */}
      <MobileCard>
        <MobileCardHeader>
          <MobileCardTitle>Ações Rápidas</MobileCardTitle>
          <MobileCardDescription>Acesso rápido às funções principais</MobileCardDescription>
        </MobileCardHeader>
        <MobileCardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => setActiveTab("clients")}>
              <Users className="h-5 w-5" />
              <span className="text-sm">Clientes</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => setActiveTab("installments")}>
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Parcelas</span>
            </Button>
          </div>
        </MobileCardContent>
      </MobileCard>

      {/* Plan Status */}
      <MobileCard>
        <MobileCardHeader>
          <MobileCardTitle>Seu Plano</MobileCardTitle>
          <MobileCardDescription>{userPlan.currentPlan.name}</MobileCardDescription>
        </MobileCardHeader>
        <MobileCardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {userPlan.currentPlan.maxClients === null ? "Clientes ilimitados" : `${userPlan.clientCount}/${userPlan.currentPlan.maxClients} clientes`}
              </p>
              <p className="text-lg font-semibold text-primary">
                {userPlan.currentPlan.price === 0 ? "Gratuito" : `R$ ${userPlan.currentPlan.price.toFixed(2)}/mês`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab("plans")}>
              <Crown className="h-4 w-4 mr-1" />
              Upgrade
            </Button>
          </div>
        </MobileCardContent>
      </MobileCard>

      {/* Admin Actions */}
      <MobileCard>
        <MobileCardHeader>
          <MobileCardTitle>Administração</MobileCardTitle>
          <MobileCardDescription>Configurações e relatórios</MobileCardDescription>
        </MobileCardHeader>
        <MobileCardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório PDF
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("settings")}>
              <User className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={handleClearData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </div>
        </MobileCardContent>
      </MobileCard>
    </div>;
  const renderDesktopDashboard = () => <div className="grid gap-6">
      {/* ... keep existing code (desktop dashboard layout) */}
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
            <CardTitle>Clientes Ativos</CardTitle>
            <CardDescription>
              Total de clientes com empréstimos ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.activeClients}</div>
              <p className="text-sm text-muted-foreground mt-2">clientes ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administração</CardTitle>
            <CardDescription>
              Ferramentas de administração e configuração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")} className="w-full">
                <User className="h-4 w-4 mr-2" />
                Configurações do Usuário
              </Button>
              <Button variant="destructive" size="sm" onClick={handleClearData} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Todos os Dados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "clients":
        return <ClientManagement userPlan={userPlan} />;
      case "loans":
        return <LoanManagement />;
      case "installments":
        return <InstallmentTracking />;
      case "plans":
        return <PlanSelector plans={plans} currentPlanId={userPlan.currentPlan.id} onSelectPlan={handlePlanChange} onClose={() => setActiveTab("dashboard")} />;
      case "settings":
        return <UserSettings />;
      default:
        return isMobile ? renderMobileDashboard() : renderDesktopDashboard();
    }
  };
  return <div className="min-h-screen bg-gray-50">
      {isMobile ? <>
          <MobileHeader onPlanClick={() => setActiveTab("plans")} />
          <main className="p-4">
            {renderActiveComponent()}
          </main>
          <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </> : <>
          {/* Desktop Header */}
          <div className="border-b bg-white">
            <div className="flex h-16 items-center px-4 bg-emerald-400">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Veloz Cred</h1>
              </div>
              <nav className="flex items-center space-x-4 lg:space-x-6 ml-6">
                <Button variant={activeTab === "dashboard" ? "default" : "ghost"} onClick={() => setActiveTab("dashboard")}>
                  Dashboard
                </Button>
                <Button variant={activeTab === "clients" ? "default" : "ghost"} onClick={() => setActiveTab("clients")}>
                  Clientes
                </Button>
                <Button variant={activeTab === "loans" ? "default" : "ghost"} onClick={() => setActiveTab("loans")}>Lançamentos</Button>
                <Button variant={activeTab === "installments" ? "default" : "ghost"} onClick={() => setActiveTab("installments")}>Empréstimos</Button>
              </nav>
              
              <div className="ml-auto flex items-center space-x-4">
                <ClientCounter userPlan={userPlan} />
                <Button variant="outline" size="sm" onClick={() => setActiveTab("plans")}>
                  <Crown className="h-4 w-4 mr-2" />
                  Planos
                </Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>

          <main className="flex-1 space-y-4 p-8 pt-6">
            {renderActiveComponent()}
          </main>
        </>}
    </div>;
};
export default Index;