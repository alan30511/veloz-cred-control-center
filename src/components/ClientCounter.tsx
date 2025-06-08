
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { UserPlan } from "@/types/plan";

interface ClientCounterProps {
  userPlan: UserPlan;
}

const ClientCounter = ({ userPlan }: ClientCounterProps) => {
  const { currentPlan, clientCount } = userPlan;
  const maxClients = currentPlan.maxClients;

  return (
    <div className="flex items-center space-x-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Clientes:</span>
      <Badge variant={maxClients && clientCount >= maxClients ? "destructive" : "secondary"}>
        {clientCount}{maxClients ? `/${maxClients}` : ""}
      </Badge>
      <span className="text-xs text-muted-foreground">
        Plano {currentPlan.name}
      </span>
    </div>
  );
};

export default ClientCounter;
