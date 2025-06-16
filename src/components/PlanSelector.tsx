
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";
import { Plan } from "@/types/plan";

interface PlanSelectorProps {
  plans: Plan[];
  currentPlanId: string;
  onSelectPlan: (planId: string) => void;
  onClose: () => void;
}

const PlanSelector = ({ plans, currentPlanId, onSelectPlan, onClose }: PlanSelectorProps) => {
  const handlePlanSelect = (planId: string) => {
    console.log(`Selecionando plano: ${planId}`);
    onSelectPlan(planId);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Escolha seu Plano</CardTitle>
          <CardDescription>
            Selecione o plano que melhor atende suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlanId === plan.id;
              
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
                    
                    <Button 
                      className="w-full" 
                      variant={isCurrentPlan ? "outline" : "default"}
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? "Plano Atual" : `Selecionar ${plan.name}`}
                    </Button>
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
    </div>
  );
};

export default PlanSelector;
