import { Button } from "@/components/ui/button";
import { DollarSign, LogOut, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlans } from "@/hooks/usePlans";
import ClientCounter from "@/components/ClientCounter";
interface MobileHeaderProps {
  onPlanClick: () => void;
}
const MobileHeader = ({
  onPlanClick
}: MobileHeaderProps) => {
  const {
    signOut
  } = useAuth();
  const {
    userPlan
  } = usePlans();
  const handleSignOut = async () => {
    await signOut();
  };
  return <div className="sticky top-0 border-b border-gray-200 px-4 py-3 z-40 bg-emerald-400">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Veloz Cred</h1>
            <p className="text-xs text-gray-500">Controle de Empréstimos</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ClientCounter userPlan={userPlan} />
          <Button variant="outline" size="sm" onClick={onPlanClick} className="hidden xs:flex">
            <Crown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>;
};
export default MobileHeader;