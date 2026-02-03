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
  User,
  Calendar,
  Loader2
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { usePendingConfirmations, PendingItem } from '@/hooks/usePendingConfirmations';

const typeConfig: Record<PendingItem['type'], { label: string; icon: any; color: string }> = {
  loan_return: { label: 'Devolução', icon: RotateCcw, color: 'bg-yellow-100 text-yellow-700' },
  loan_renewal: { label: 'Renovação', icon: RefreshCw, color: 'bg-blue-100 text-blue-700' },
  payment: { label: 'Pagamento', icon: CreditCard, color: 'bg-green-100 text-green-700' },
  loan_request: { label: 'Empréstimo', icon: BookOpen, color: 'bg-purple-100 text-purple-700' },
};

export default function AdminPendingConfirmations() {
  const { 
    pendingItems, 
    isLoading,
    approveLoanRequest,
    rejectLoanRequest,
    approveReturn,
    rejectReturn,
    approveRenewal,
    rejectRenewal,
    approvePayment,
    rejectPayment,
  } = usePendingConfirmations();

  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupedByType = useMemo(() => {
    const groups: Record<string, PendingItem[]> = {};
    pendingItems.forEach(item => {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });
    return groups;
  }, [pendingItems]);

  const handleAction = (item: PendingItem, action: 'approve' | 'reject') => {
    setSelectedItem(item);
    setActionType(action);
    setAdminNotes('');
  };

  const handleConfirmAction = async () => {
    if (!selectedItem || !actionType) return;

    setIsSubmitting(true);

    try {
      if (actionType === 'approve') {
        switch (selectedItem.type) {
          case 'loan_request':
            await approveLoanRequest.mutateAsync({ 
              loanId: selectedItem.loanId!, 
              adminNotes: adminNotes || undefined 
            });
            break;
          case 'loan_return':
            await approveReturn.mutateAsync({ 
              loanId: selectedItem.loanId!, 
              adminNotes: adminNotes || undefined 
            });
            break;
          case 'loan_renewal':
            await approveRenewal.mutateAsync({ 
              loanId: selectedItem.loanId!,
              currentDueDate: selectedItem.dueDate || new Date(),
              renewalCount: selectedItem.renewalCount || 0,
              adminNotes: adminNotes || undefined 
            });
            break;
          case 'payment':
            await approvePayment.mutateAsync({ 
              saleId: selectedItem.saleId!, 
              adminNotes: adminNotes || undefined 
            });
            break;
        }
      } else {
        switch (selectedItem.type) {
          case 'loan_request':
            await rejectLoanRequest.mutateAsync({ 
              loanId: selectedItem.loanId!, 
              adminNotes: adminNotes || undefined 
            });
            break;
          case 'loan_return':
            await rejectReturn.mutateAsync({ 
              loanId: selectedItem.loanId!, 
              adminNotes: adminNotes || undefined 
            });
            break;
          case 'loan_renewal':
            await rejectRenewal.mutateAsync({ 
              loanId: selectedItem.loanId!, 
              adminNotes: adminNotes || undefined 
            });
            break;
          case 'payment':
            await rejectPayment.mutateAsync({ 
              saleId: selectedItem.saleId!, 
              adminNotes: adminNotes || undefined 
            });
            break;
        }
      }
    } finally {
      setSelectedItem(null);
      setActionType(null);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout showFooter={false}>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showFooter={false}>
      <div className="container py-4 sm:py-8 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <ClipboardList className="text-primary" size={24} />
          <div>
            <h1 className="text-xl sm:text-3xl font-serif font-bold">Confirmações Pendentes</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Aprovar ou recusar solicitações de usuários
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {Object.entries(typeConfig).map(([type, config]) => {
            const count = groupedByType[type]?.length || 0;
            const Icon = config.icon;
            return (
              <Card key={type} className={count > 0 ? 'border-primary/30' : ''}>
                <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                  <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${config.color} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className="sm:hidden" />
                    <Icon size={20} className="hidden sm:block" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground truncate">{config.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pending Items */}
        {pendingItems.length > 0 ? (
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock size={18} className="text-yellow-600" />
                {pendingItems.length} Pendência{pendingItems.length > 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <ScrollArea className="max-h-[500px] sm:max-h-[600px]">
                <div className="space-y-3 sm:space-y-4">
                  {pendingItems.map(item => {
                    const config = typeConfig[item.type];
                    const Icon = config.icon;

                    return (
                      <div 
                        key={item.id}
                        className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                          <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${config.color} flex items-center justify-center shrink-0 self-start`}>
                            <Icon size={16} className="sm:hidden" />
                            <Icon size={20} className="hidden sm:block" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`${config.color} text-xs`}>{config.label}</Badge>
                              <span className="font-medium text-sm sm:text-base line-clamp-2">{item.itemTitle}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User size={12} className="sm:hidden" />
                                <User size={14} className="hidden sm:block" />
                                {item.userName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} className="sm:hidden" />
                                <Calendar size={14} className="hidden sm:block" />
                                {format(item.requestedAt, "dd/MM 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>

                            {item.justification && (
                              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-muted rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Justificativa:
                                </p>
                                <p className="text-xs sm:text-sm">{item.justification}</p>
                              </div>
                            )}

                            <div className="flex gap-2 mt-3 sm:mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => handleAction(item, 'reject')}
                              >
                                <X size={14} className="mr-1" />
                                Recusar
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                                onClick={() => handleAction(item, 'approve')}
                              >
                                <Check size={14} className="mr-1" />
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
            <CardContent className="py-8 sm:py-12 text-center">
              <Check size={40} className="mx-auto text-green-500 mb-3 sm:mb-4" />
              <h3 className="font-medium text-base sm:text-lg">Tudo em dia!</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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

              <div>
                <label className="text-sm font-medium">
                  {actionType === 'reject' ? 'Motivo da recusa' : 'Observações'}{' '}
                  <span className="text-muted-foreground">(opcional)</span>
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={actionType === 'reject' ? 'Informe o motivo da recusa...' : 'Adicione uma observação...'}
                  className="mt-1"
                  rows={3}
                />
              </div>

              {actionType === 'approve' && (
                <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                  <p>Esta ação irá:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {selectedItem?.type === 'loan_return' && (
                      <>
                        <li>Marcar o empréstimo como devolvido</li>
                        <li>Liberar o livro para novo empréstimo</li>
                        <li>Atualizar o estoque disponível automaticamente</li>
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
                        <li>Atualizar o status da venda para confirmado</li>
                      </>
                    )}
                    {selectedItem?.type === 'loan_request' && (
                      <>
                        <li>Ativar o empréstimo para o usuário</li>
                        <li>Reduzir o estoque disponível automaticamente</li>
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
