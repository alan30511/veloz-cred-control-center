
import { useState, useEffect } from "react";
import { Plan, UserPlan } from "@/types/plan";

export const usePlans = () => {
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

  // Get current plan from localStorage or default to free
  const getCurrentPlan = () => {
    const savedPlanId = localStorage.getItem('currentPlan');
    return plans.find(p => p.id === savedPlanId) || plans[0];
  };

  const [currentPlan, setCurrentPlan] = useState<Plan>(getCurrentPlan());
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
      setCurrentPlan(newPlan);
      localStorage.setItem('currentPlan', planId);
      console.log(`Plano alterado para: ${newPlan.name}`);
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
    // Remove subscription reference
    subscription: {
      subscribed: currentPlan.id !== 'free',
      subscription_tier: currentPlan.id !== 'free' ? currentPlan.id : null,
      subscription_end: null
    }
  };
};
