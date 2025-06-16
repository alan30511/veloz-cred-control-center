
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Eye, ExternalLink, Clock } from "lucide-react";
import { useOptimizedSubscription } from "@/hooks/useOptimizedSubscription";

const SubscriptionStatus = () => {
  const { 
    subscription, 
    loading, 
    checkSubscription, 
    openCustomerPortal, 
    isDataStale,
    lastChecked 
  } = useOptimizedSubscription();
  const [showDetails, setShowDetails] = useState(false);

  const handleShowDetails = async () => {
    if (!showDetails || isDataStale()) {
      await checkSubscription();
    }
    setShowDetails(!showDetails);
  };

  const handleRefreshSubscription = async () => {
    await checkSubscription(true);
  };

  const formatLastChecked = () => {
    if (lastChecked === 0) return 'Nunca verificado';
    const date = new Date(lastChecked);
    return `Última verificação: ${date.toLocaleString('pt-BR')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Status da Assinatura
          <div className="flex items-center gap-2">
            {isDataStale() && (
              <Badge variant="outline" className="text-yellow-600">
                <Clock className="h-3 w-3 mr-1" />
                Dados desatualizados
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshSubscription}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {formatLastChecked()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <Badge variant={subscription.subscribed ? "default" : "secondary"}>
              {subscription.subscribed ? "Ativa" : "Inativa"}
            </Badge>
          </div>

          {subscription.subscription_tier && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Plano:</span>
              <span className="capitalize">{subscription.subscription_tier}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowDetails}
              disabled={loading}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
            </Button>

            {subscription.subscribed && (
              <Button
                variant="outline"
                size="sm"
                onClick={openCustomerPortal}
                disabled={loading}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Gerenciar
              </Button>
            )}
          </div>

          {showDetails && (
            <div className="border-t pt-4 space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo de assinatura:</span>
                    <span>{subscription.subscription_tier || 'Gratuito'}</span>
                  </div>
                  
                  {subscription.subscription_end && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renova em:</span>
                      <span>{new Date(subscription.subscription_end).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status do pagamento:</span>
                    <span className={subscription.subscribed ? 'text-green-600' : 'text-gray-600'}>
                      {subscription.subscribed ? 'Em dia' : 'Plano gratuito'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
