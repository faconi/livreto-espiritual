import { useState, useMemo } from 'react';
import { 
  ClipboardList,
  Clock,
  Check,
  X,
  BookOpen,
  RefreshCw,
  RotateCcw,
  CreditCard,
  MessageSquare,
  User,
  Calendar
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PendingConfirmation } from '@/types';

// Mock pending confirmations
const mockPendingConfirmations: PendingConfirmation[] = [
  {
    id: 'pc1',
    type: 'loan_return',
    userId: '2',
    userName: 'João Silva',
    userEmail: 'joao@email.com',
    itemId: 'l2',
    itemTitle: 'O Livro dos Espíritos',
    requestedAt: new Date('2024-01-18T10:30:00'),
    justification: 'Terminei a leitura, livro em ótimo estado.',
    status: 'pending',
  },
  {
    id: 'pc2',
    type: 'loan_renewal',
    userId: '3',
    userName: 'Maria Santos',
    userEmail: 'maria@email.com',
    itemId: 'l3',
    itemTitle: 'Nosso Lar',
    requestedAt: new Date('2024-01-17T14:20:00'),
    justification: 'Estou estudando para um seminário sobre a obra de André Luiz e preciso de mais 15 dias para concluir.',
    status: 'pending',
  },
  {
    id: 'pc3',
    type: 'payment',
    userId: '4',
    userName: 'Pedro Lima',
    userEmail: 'pedro@email.com',
    itemId: 's1',
    itemTitle: 'O Evangelho Segundo o Espiritismo (R$ 42,00)',
    requestedAt: new Date('2024-01-16T09:15:00'),
    justification: 'Pagamento PIX realizado',
    status: 'pending',
  },
  {
    id: 'pc4',
    type: 'loan_request',
    userId: '2',
    userName: 'João Silva',
    userEmail: 'joao@email.com',
    itemId: 'l4',
    itemTitle: 'Paulo e Estêvão',
    requestedAt: new Date('2024-01-15T16:45:00'),
    status: 'pending',
  },
];

const typeConfig: Record<PendingConfirmation['type'], { label: string; icon: any; color: string }> = {
  loan_return: { label: 'Devolução', icon: RotateCcw, color: 'bg-yellow-100 text-yellow-700' },
  loan_renewal: { label: 'Renovação', icon: RefreshCw, color: 'bg-blue-100 text-blue-700' },
  payment: { label: 'Pagamento', icon: CreditCard, color: 'bg-green-100 text-green-700' },
  loan_request: { label: 'Empréstimo', icon: BookOpen, color: 'bg-purple-100 text-purple-700' },
};

export default function AdminPendingConfirmations() {
  const { toast } = useToast();
  const [confirmations, setConfirmations] = useState(mockPendingConfirmations);
  const [selectedItem, setSelectedItem] = useState<PendingConfirmation | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingItems = confirmations.filter(c => c.status === 'pending');

  const groupedByType = useMemo(() => {
    const groups: Record<string, PendingConfirmation[]> = {};
    pendingItems.forEach(item => {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });
    return groups;
  }, [pendingItems]);

  const handleAction = (item: PendingConfirmation, action: 'approve' | 'reject') => {
    setSelectedItem(item);
    setActionType(action);
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    if (!selectedItem || !actionType) return;
    
    if (actionType === 'reject' && !rejectionReason.trim()) {
      toast({
        title: 'Justificativa obrigatória',
        description: 'Por favor, informe o motivo da recusa.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setConfirmations(prev => prev.map(c => 
      c.id === selectedItem.id 
        ? { 
            ...c, 
            status: actionType === 'approve' ? 'approved' : 'rejected',
            resolvedAt: new Date(),
            rejectionReason: actionType === 'reject' ? rejectionReason : undefined,
          } 
        : c
    ));

    toast({
      title: actionType === 'approve' ? 'Aprovado!' : 'Recusado',
      description: actionType === 'approve'
        ? `${typeConfig[selectedItem.type].label} de "${selectedItem.itemTitle}" foi aprovado(a).`
        : `${typeConfig[selectedItem.type].label} de "${selectedItem.itemTitle}" foi recusado(a).`,
    });

    setSelectedItem(null);
    setActionType(null);
    setIsSubmitting(false);
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="text-primary" size={28} />
          <div>
            <h1 className="text-3xl font-serif font-bold">Confirmações Pendentes</h1>
            <p className="text-muted-foreground">
              Aprovar ou recusar solicitações de usuários
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Object.entries(typeConfig).map(([type, config]) => {
            const count = groupedByType[type]?.length || 0;
            const Icon = config.icon;
            return (
              <Card key={type} className={count > 0 ? 'border-primary/30' : ''}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${config.color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pending Items */}
        {pendingItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-yellow-600" />
                {pendingItems.length} Pendência{pendingItems.length > 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-4">
                  {pendingItems.map(item => {
                    const config = typeConfig[item.type];
                    const Icon = config.icon;

                    return (
                      <div 
                        key={item.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`h-10 w-10 rounded-full ${config.color} flex items-center justify-center shrink-0`}>
                            <Icon size={20} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={config.color}>{config.label}</Badge>
                              <span className="font-medium">{item.itemTitle}</span>
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {item.userName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {format(item.requestedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>

                            {item.justification && (
                              <div className="mt-3 p-3 bg-muted rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Justificativa do usuário:
                                </p>
                                <p className="text-sm">{item.justification}</p>
                              </div>
                            )}

                            <div className="flex gap-2 mt-4">
                              <Button
                                variant="outline"
                                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => handleAction(item, 'reject')}
                              >
                                <X size={16} className="mr-1" />
                                Recusar
                              </Button>
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleAction(item, 'approve')}
                              >
                                <Check size={16} className="mr-1" />
                                Aprovar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Check size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="font-medium text-lg">Tudo em dia!</h3>
              <p className="text-muted-foreground mt-1">
                Não há confirmações pendentes no momento.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={!!selectedItem && !!actionType} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Recusa'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve' 
                  ? `Você está aprovando ${typeConfig[selectedItem?.type || 'loan_return'].label.toLowerCase()} de "${selectedItem?.itemTitle}".`
                  : `Você está recusando ${typeConfig[selectedItem?.type || 'loan_return'].label.toLowerCase()} de "${selectedItem?.itemTitle}".`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Item details */}
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <p><span className="text-muted-foreground">Usuário:</span> {selectedItem?.userName}</p>
                <p><span className="text-muted-foreground">Email:</span> {selectedItem?.userEmail}</p>
                <p><span className="text-muted-foreground">Solicitado em:</span> {selectedItem && format(selectedItem.requestedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>

              {selectedItem?.justification && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-600 mb-1">Justificativa do usuário:</p>
                  <p className="text-sm">{selectedItem.justification}</p>
                </div>
              )}

              {actionType === 'reject' && (
                <div>
                  <label className="text-sm font-medium">
                    Motivo da recusa <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Informe o motivo da recusa..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}

              {actionType === 'approve' && (
                <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                  <p>Esta ação irá:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {selectedItem?.type === 'loan_return' && (
                      <>
                        <li>Marcar o empréstimo como devolvido</li>
                        <li>Liberar o livro para novo empréstimo</li>
                        <li>Atualizar o estoque disponível</li>
                      </>
                    )}
                    {selectedItem?.type === 'loan_renewal' && (
                      <>
                        <li>Estender o prazo de devolução em 15 dias</li>
                        <li>Registrar a renovação no histórico</li>
                      </>
                    )}
                    {selectedItem?.type === 'payment' && (
                      <>
                        <li>Confirmar o pagamento da compra</li>
                        <li>Atualizar o status da venda</li>
                      </>
                    )}
                    {selectedItem?.type === 'loan_request' && (
                      <>
                        <li>Confirmar o empréstimo para o usuário</li>
                        <li>Reduzir o estoque disponível</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Cancelar
              </Button>
              <Button
                variant={actionType === 'approve' ? 'default' : 'destructive'}
                onClick={handleConfirmAction}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : (actionType === 'approve' ? 'Aprovar' : 'Recusar')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
