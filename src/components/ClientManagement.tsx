
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  fullName: string;
  cpf: string;
  phone: string;
  whatsapp: string;
  address: string;
}

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      fullName: "João Silva",
      cpf: "123.456.789-00",
      phone: "(11) 99999-9999",
      whatsapp: "(11) 99999-9999",
      address: "Rua das Flores, 123"
    },
    {
      id: "2", 
      fullName: "Maria Santos",
      cpf: "987.654.321-00",
      phone: "(11) 88888-8888",
      whatsapp: "(11) 88888-8888",
      address: "Av. Principal, 456"
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    cpf: "",
    phone: "",
    whatsapp: "",
    address: ""
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      setClients(prev => prev.map(client => 
        client.id === editingClient.id 
          ? { ...editingClient, ...formData }
          : client
      ));
      toast({
        title: "Cliente atualizado",
        description: "Os dados do cliente foram atualizados com sucesso."
      });
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        ...formData
      };
      setClients(prev => [...prev, newClient]);
      toast({
        title: "Cliente adicionado",
        description: "Novo cliente foi cadastrado com sucesso."
      });
    }

    setFormData({
      fullName: "",
      cpf: "",
      phone: "",
      whatsapp: "",
      address: ""
    });
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      fullName: client.fullName,
      cpf: client.cpf,
      phone: client.phone,
      whatsapp: client.whatsapp,
      address: client.address
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido com sucesso."
    });
  };

  const openWhatsApp = (whatsapp: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanNumber}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Clientes</h2>
          <p className="text-muted-foreground">Cadastre e gerencie seus clientes</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
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
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>

              <div className="flex gap-2 md:col-span-2">
                <Button type="submit">
                  {editingClient ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingClient(null);
                    setFormData({
                      fullName: "",
                      cpf: "",
                      phone: "",
                      whatsapp: "",
                      address: ""
                    });
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
                  <p className="text-sm text-muted-foreground">CPF: {client.cpf}</p>
                  <p className="text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 inline mr-1" />
                    {client.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">{client.address}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openWhatsApp(client.whatsapp)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
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
      </div>
    </div>
  );
};

export default ClientManagement;
