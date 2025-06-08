
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  DollarSign, 
  Users, 
  Calculator, 
  Calendar, 
  Settings, 
  Crown,
  User
} from "lucide-react";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const mainMenuItems = [
    {
      title: "Dashboard",
      url: "dashboard",
      icon: DollarSign,
    },
    {
      title: "Clientes",
      url: "clients",
      icon: Users,
    },
    {
      title: "Empréstimos",
      url: "loans", 
      icon: Calculator,
    },
    {
      title: "Parcelas",
      url: "installments",
      icon: Calendar,
    },
  ];

  const configMenuItems = [
    {
      title: "Configurações",
      url: "settings",
      icon: Settings,
    },
    {
      title: "Planos",
      url: "plans",
      icon: Crown,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2 py-4">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Veloz Cred</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeTab === item.url}
                  >
                    <button 
                      onClick={() => onTabChange(item.url)}
                      className="flex items-center w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeTab === item.url}
                  >
                    <button 
                      onClick={() => onTabChange(item.url)}
                      className="flex items-center w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User className="h-4 w-4" />
              <span>Usuário</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
