
import { useState } from "react";
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

  const [userPlan, setUserPlan] = useState<UserPlan>({
    currentPlan: plans[0], // Starts with free plan
    clientCount: 0
  });

  const canAddClient = () => {
    if (userPlan.currentPlan.maxClients === null) return true;
    return userPlan.clientCount < userPlan.currentPlan.maxClients;
  };

  const incrementClientCount = () => {
    if (canAddClient()) {
      setUserPlan(prev => ({
        ...prev,
        clientCount: prev.clientCount + 1
      }));
      return true;
    }
    return false;
  };

  const decrementClientCount = () => {
    setUserPlan(prev => ({
      ...prev,
      clientCount: Math.max(0, prev.clientCount - 1)
    }));
  };

  const changePlan = (planId: string) => {
    const newPlan = plans.find(p => p.id === planId);
    if (newPlan) {
      setUserPlan(prev => ({
        ...prev,
        currentPlan: newPlan
      }));
    }
  };

  return {
    plans,
    userPlan,
    canAddClient,
    incrementClientCount,
    decrementClientCount,
    changePlan
  };
};
