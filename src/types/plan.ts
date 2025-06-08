
export interface Plan {
  id: string;
  name: string;
  maxClients: number | null; // null = unlimited
  price: number;
  features: string[];
}

export interface UserPlan {
  currentPlan: Plan;
  clientCount: number;
}
