
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { UserPlan } from "@/types/plan";
import { useAppContext } from "@/contexts/AppContext";

interface ClientCounterProps {
  userPlan: UserPlan;
}

const ClientCounter = ({ userPlan }: ClientCounterProps) => {
  const { clients } = useAppContext();
  
  const currentCount = clients.length;
  const maxClients = userPlan.currentPlan.maxClients;
  
  const isNearLimit = maxClients && currentCount >= maxClients * 0.8;
  const isAtLimit = maxClients && currentCount >= maxClients;

  return (
    <Badge 
      variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
      className="flex items-center gap-1"
    >
      <Users className="h-3 w-3" />
      {currentCount}/{maxClients || "∞"}
    </Badge>
  );
};

export default ClientCounter;
