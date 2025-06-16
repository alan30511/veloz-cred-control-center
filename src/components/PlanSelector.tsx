
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, RefreshCw } from "lucide-react";
import { Plan } from "@/types/plan";
import { useOptimizedSubscription } from "@/hooks/useOptimizedSubscription";
import SubscriptionStatus from "./SubscriptionStatus";

interface PlanSelectorProps {
  plans: Plan[];
  currentPlanId: string;
  onSelectPlan: (planId: string) => void;
  onClose: () => void;
}

const PlanSelector = ({ plans, currentPlanId, onSelectPlan, onClose }: PlanSelectorProps) => {
  const { createCheckout, openCustomerPortal, loading, subscription, checkSubscription } = useOptimizedSubscription();

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlanId) {
      return;
    }

    if (planId === "free") {
      onSelectPlan(planId);
      return;
    }

    // For paid plans, redirect to Stripe checkout
    await createCheckout(planId);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "silver":
        return <Star className="h-5 w-5 text-gray-500" />;
      case "gold":
        return <Crown className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  // Check subscription status when component mounts or user requests it
  const handleRefreshStatus = async () => {
    await checkSubscription(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Escolha seu Plano</CardTitle>
              <CardDescription>
                Selecione o plano que melhor atende suas necessidades
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Verificar Status
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlanId === plan.id;
              const isActivePaidPlan = subscription.subscribed && subscription.subscription_tier === plan.id;
              
              return (
                <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getPlanIcon(plan.id)}
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                      </div>
                      {isCurrentPlan && (
                        <Badge variant="default">Atual</Badge>
                      )}
                    </div>
                    <CardDescription>
                      <span className="text-2xl font-bold">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                      {plan.price > 0 && <span className="text-sm">/mês</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.id === "free" ? (
                      <Button 
                        className="w-full" 
                        variant={isCurrentPlan ? "outline" : "default"}
                        onClick={() => handlePlanSelect(plan.id)}
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? "Plano Atual" : "Usar Gratuito"}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        {isActivePaidPlan ? (
                          <>
                            <Button 
                              className="w-full" 
                              variant="outline"
                              disabled
                            >
                              Plano Ativo
                            </Button>
                            <Button 
                              className="w-full" 
                              variant="secondary"
                              onClick={openCustomerPortal}
                              disabled={loading}
                            >
                              {loading ? "Carregando..." : "Gerenciar Assinatura"}
                            </Button>
                          </>
                        ) : (
                          <Button 
                            className="w-full" 
                            variant="default"
                            onClick={() => handlePlanSelect(plan.id)}
                            disabled={loading}
                          >
                            {loading ? "Processando..." : `Assinar ${plan.name}`}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>

      <SubscriptionStatus />
    </div>
  );
};

export default PlanSelector;
