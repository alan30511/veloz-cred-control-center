
import { useState, useEffect } from "react";
import { Plan, UserPlan } from "@/types/plan";
import { useOptimizedSubscription } from "@/hooks/useOptimizedSubscription";

export const usePlans = () => {
  const { subscription } = useOptimizedSubscription();
  
  const plans: Plan[] = [
    {
      id: "free",
      name: "Gratuito",
      maxClients: 3,
      price: 0,
      features: [
        "Até 3 clientes",
        "Gerenciamento básico de empréstimos",
        "Suporte por email"
      ]
    },
    {
      id: "silver",
      name: "Silver",
      maxClients: 10,
      price: 29.90,
      features: [
        "Até 10 clientes",
        "Relatórios avançados",
        "Suporte prioritário",
        "Backup automático"
      ]
    },
    {
      id: "gold",
      name: "Gold",
      maxClients: null,
      price: 49.90,
      features: [
        "Clientes ilimitados",
        "Todos os recursos Silver",
        "Suporte 24/7",
        "API personalizada",
        "Integração com bancos"
      ]
    }
  ];

  // Determine current plan based on subscription
  const getCurrentPlan = () => {
    if (subscription.subscribed && subscription.subscription_tier) {
      return plans.find(p => p.id === subscription.subscription_tier) || plans[0];
    }
    return plans[0]; // Free plan
  };

  const currentPlan = getCurrentPlan();
  
  // Remove the internal clientCount state - this will be managed by AppContext
  const [userPlan] = useState<UserPlan>({
    currentPlan,
    clientCount: 0 // This will be overridden by the actual client count
  });

  // Function to check if user can add client based on actual client count
  const canAddClient = (actualClientCount: number) => {
    if (currentPlan.maxClients === null) return true;
    return actualClientCount < currentPlan.maxClients;
  };

  // These functions are no longer needed as client count is managed by AppContext
  const incrementClientCount = () => {
    return true; // Always return true, actual management in AppContext
  };

  const decrementClientCount = () => {
    // No-op, actual management in AppContext
  };

  const changePlan = (planId: string) => {
    const newPlan = plans.find(p => p.id === planId);
    if (newPlan) {
      // Plan change should trigger subscription update
      console.log(`Plan change requested to: ${planId}`);
    }
  };

  return {
    plans,
    userPlan: {
      ...userPlan,
      currentPlan
    },
    canAddClient,
    incrementClientCount,
    decrementClientCount,
    changePlan,
    subscription
  };
};
