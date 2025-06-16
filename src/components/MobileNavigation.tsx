import { Button } from "@/components/ui/button";
import { Home, Users, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const MobileNavigation = ({
  activeTab,
  onTabChange
}: MobileNavigationProps) => {
  const navItems = [{
    id: "dashboard",
    label: "Início",
    icon: Home
  }, {
    id: "clients",
    label: "Clientes",
    icon: Users
  }, {
    id: "installments",
    label: "Parcelas",
    icon: MessageSquare
  }, {
    id: "settings",
    label: "Config",
    icon: Settings
  }];
  return <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 px-2 py-1 z-50 safe-area-pb bg-emerald-400">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return <Button key={item.id} variant="ghost" size="sm" onClick={() => onTabChange(item.id)} className={cn("flex flex-col items-center gap-1 p-2 h-auto min-h-[60px] flex-1 rounded-lg transition-all duration-200", isActive ? "text-primary bg-primary/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")}>
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>;
      })}
      </div>
    </div>;
};
export default MobileNavigation;