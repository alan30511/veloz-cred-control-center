
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserPlan } from "@/types/plan";
import { usePlans } from "@/hooks/usePlans";
import { useAppContext } from "@/contexts/AppContext";

interface ClientManagementProps {
  userPlan: UserPlan;
}

const ClientManagement = ({ userPlan }: ClientManagementProps) => {
  const { 
    clients, 
    addClient, 
    editClient, 
    deleteClient 
  } = useAppContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    cpf: "",
    phone: "",
    address: ""
  });

  const { toast } = useToast();
  const { incrementClientCount, decrementClientCount, canAddClient } = usePlans();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      await editClient(editingClient.id, formData);
      toast({
        title: "Cliente atualizado",
        description: "Os dados do cliente foram atualizados com sucesso."
      });
    } else {
      // Check if can add new client
      if (!canAddClient()) {
        toast({
          title: "Limite atingido",
          description: `Você atingiu o limite de ${userPlan.currentPlan.maxClients} clientes do plano ${userPlan.currentPlan.name}. Faça upgrade para adicionar mais clientes.`,
          variant: "destructive"
        });
        return;
      }

      await addClient(formData);
      incrementClientCount();
    }

    setFormData({ fullName: "", cpf: "", phone: "", address: "" });
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      fullName: client.fullName || "",
      cpf: client.cpf || "",
      phone: client.phone || "",
      address: client.address || ""
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente? Todos os empréstimos associados também serão removidos.")) {
      await deleteClient(id);
      decrementClientCount();
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleanNumber = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanNumber}`, '_blank');
  };

  const handleNewClient = () => {
    if (!canAddClient()) {
      toast({
        title: "Limite atingido",
        description: `Você atingiu o limite de ${userPlan.currentPlan.maxClients} clientes do plano ${userPlan.currentPlan.name}. Faça upgrade para adicionar mais clientes.`,
        variant: "destructive"
      });
      return;
    }
    setIsFormOpen(true);
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Clientes</h2>
          <p className="text-muted-foreground">Cadastre e gerencie seus clientes</p>
        </div>
        <Button onClick={handleNewClient}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
            <CardDescription>
              Preencha os dados do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Rua, número, bairro, cidade"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingClient ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingClient(null);
                    setFormData({ fullName: "", cpf: "", phone: "", address: "" });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{client.fullName}</h3>
                  {client.cpf && (
                    <p className="text-sm text-muted-foreground">CPF: {client.cpf}</p>
                  )}
                  {client.phone && (
                    <p className="text-sm text-muted-foreground">Telefone: {client.phone}</p>
                  )}
                  {client.address && (
                    <p className="text-sm text-muted-foreground">Endereço: {client.address}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {client.phone && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openWhatsApp(client.phone)}
                      title="Abrir WhatsApp"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {clients.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;
