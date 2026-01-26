import { useState } from 'react';
import { BookMarked, Check, X, Clock, AlertTriangle, Eye, RotateCcw, Plus, RefreshCw, Undo2, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, addDays } from 'date-fns';
import { AdminLoanDialog } from '@/components/admin/AdminLoanDialog';
import { AdminReturnDialog } from '@/components/admin/AdminReturnDialog';
import { AdminRenewalDialog } from '@/components/admin/AdminRenewalDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLoansAdmin, LoanWithDetails } from '@/hooks/useLoans';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  active: { label: 'Ativo', variant: 'default' },
  pending_return: { label: 'Devolução Pendente', variant: 'secondary' },
  pending_renewal: { label: 'Renovação Pendente', variant: 'secondary' },
  return_pending: { label: 'Devolução Pendente', variant: 'secondary' },
  renewal_pending: { label: 'Renovação Pendente', variant: 'secondary' },
  returned: { label: 'Devolvido', variant: 'outline' },
  overdue: { label: 'Atrasado', variant: 'destructive' },
};

export default function AdminLoans() {
  const { toast } = useToast();
  const { loans, isLoading, approveReturn, approveRenewal, rejectAction, createLoan } = useLoansAdmin();
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve_return' | 'reject_return' | 'approve_renewal' | 'reject_renewal';
    loan: LoanWithDetails;
  } | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Manual admin dialogs
  const [newLoanOpen, setNewLoanOpen] = useState(false);
  const [manualReturnOpen, setManualReturnOpen] = useState(false);
  const [manualRenewalOpen, setManualRenewalOpen] = useState(false);
  const [selectedLoanForAction, setSelectedLoanForAction] = useState<LoanWithDetails | null>(null);

  const columns: ColumnDef<LoanWithDetails>[] = [
    {
      id: 'bookTitle',
      header: 'Livro',
      accessorKey: 'bookTitle',
      sortable: true,
      filterable: true,
    },
    {
      id: 'userName',
      header: 'Usuário',
      accessorKey: 'userName',
      sortable: true,
      filterable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.userName}</p>
          <p className="text-xs text-muted-foreground">{row.userEmail}</p>
        </div>
      ),
    },
    {
      id: 'borrowedAt',
      header: 'Emprestado em',
      accessorKey: 'borrowedAt',
      sortable: true,
      cell: (row) => format(new Date(row.borrowedAt), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      id: 'dueDate',
      header: 'Devolução',
      accessorKey: 'dueDate',
      sortable: true,
      cell: (row) => {
        const daysLeft = differenceInDays(new Date(row.dueDate), new Date());
        const isOverdue = daysLeft < 0;
        return (
          <div>
            <p>{format(new Date(row.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
            {row.status !== 'returned' && (
              <p className={`text-xs ${isOverdue ? 'text-destructive' : daysLeft <= 3 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                {isOverdue ? `${Math.abs(daysLeft)} dias atrasado` : `${daysLeft} dias restantes`}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: Object.entries(statusConfig).map(([value, { label }]) => ({ label, value })),
      cell: (row) => {
        const config = statusConfig[row.status] || statusConfig.active;
        return (
          <div className="flex items-center gap-2">
            <Badge variant={config.variant}>{config.label}</Badge>
            {row.status === 'pending_return' && <Clock size={14} className="text-yellow-600" />}
            {row.status === 'pending_renewal' && <RotateCcw size={14} className="text-blue-600" />}
            {row.status === 'overdue' && <AlertTriangle size={14} className="text-destructive" />}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLoan(row);
              setAdminNotes(row.adminNotes || '');
              setDetailsOpen(true);
            }}
          >
            <Eye size={16} />
          </Button>
          {row.status === 'pending_return' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmAction({ type: 'approve_return', loan: row });
                }}
              >
                <Check size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmAction({ type: 'reject_return', loan: row });
                }}
              >
                <X size={16} />
              </Button>
            </>
          )}
          {row.status === 'pending_renewal' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmAction({ type: 'approve_renewal', loan: row });
                }}
              >
                <Check size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmAction({ type: 'reject_renewal', loan: row });
                }}
              >
                <X size={16} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleRowClick = (loan: LoanWithDetails) => {
    setSelectedLoan(loan);
    setAdminNotes(loan.adminNotes || '');
    setDetailsOpen(true);
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    const { type, loan } = confirmAction;

    switch (type) {
      case 'approve_return':
        approveReturn.mutate({ loanId: loan.id, adminNotes });
        break;
      case 'reject_return':
      case 'reject_renewal':
        rejectAction.mutate({ loanId: loan.id, adminNotes });
        break;
      case 'approve_renewal':
        approveRenewal.mutate({ 
          loanId: loan.id, 
          newDueDate: addDays(new Date(loan.dueDate), 15),
          adminNotes 
        });
        break;
    }

    setConfirmAction(null);
    setAdminNotes('');
  };

  const getConfirmDialogContent = () => {
    if (!confirmAction) return { title: '', description: '' };

    const { type, loan } = confirmAction;
    switch (type) {
      case 'approve_return':
        return {
          title: 'Aprovar Devolução',
          description: `Confirmar devolução do livro "${loan.bookTitle}" por ${loan.userName}? Esta ação atualizará o estoque do livro.`,
        };
      case 'reject_return':
        return {
          title: 'Recusar Devolução',
          description: `Recusar devolução do livro "${loan.bookTitle}"? O empréstimo continuará ativo.`,
        };
      case 'approve_renewal':
        return {
          title: 'Aprovar Renovação',
          description: `Aprovar renovação do empréstimo de "${loan.bookTitle}"? O prazo será estendido por mais 15 dias.`,
        };
      case 'reject_renewal':
        return {
          title: 'Recusar Renovação',
          description: `Recusar renovação do empréstimo de "${loan.bookTitle}"? O prazo original será mantido.`,
        };
    }
  };

  const dialogContent = getConfirmDialogContent();

  // Summary stats
  const activeLoans = loans.filter(l => l.status === 'active').length;
  const pendingReturns = loans.filter(l => l.status === 'pending_return').length;
  const pendingRenewals = loans.filter(l => l.status === 'pending_renewal').length;
  const overdueLoans = loans.filter(l => l.status === 'overdue').length;

  // Handle manual admin actions
  const handleNewLoan = (data: {
    userId: string;
    userName: string;
    userEmail: string;
    bookId: string;
    bookTitle: string;
    durationDays: number;
    adminNotes?: string;
  }) => {
    createLoan.mutate({
      userId: data.userId,
      bookId: data.bookId,
      dueDate: addDays(new Date(), data.durationDays),
      adminNotes: data.adminNotes ? `[MANUAL] ${data.adminNotes}` : '[MANUAL] Empréstimo registrado pelo administrador',
    });
  };

  const handleManualReturn = (loanId: string, adminNotes?: string) => {
    approveReturn.mutate({
      loanId,
      adminNotes: adminNotes ? `[MANUAL] ${adminNotes}` : '[MANUAL] Devolução registrada pelo administrador',
    });
  };

  const handleManualRenewal = (loanId: string, extraDays: number, adminNotes?: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
      approveRenewal.mutate({
        loanId,
        newDueDate: addDays(new Date(loan.dueDate), extraDays),
        adminNotes: adminNotes ? `[MANUAL] ${adminNotes}` : '[MANUAL] Renovação registrada pelo administrador',
      });
    }
  };

  // Get active loans for return/renewal actions
  const activeLoansForAction = loans.filter(l => 
    l.status === 'active' || l.status === 'overdue'
  );

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <BookMarked className="text-primary" size={28} />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold">Gerenciar Empréstimos</h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Ação Manual
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setNewLoanOpen(true)}>
                <BookMarked size={16} className="mr-2" />
                Novo Empréstimo
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  if (activeLoansForAction.length > 0) {
                    setSelectedLoanForAction(activeLoansForAction[0]);
                    setManualReturnOpen(true);
                  } else {
                    toast({
                      title: 'Sem empréstimos ativos',
                      description: 'Não há empréstimos ativos para devolver.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <Undo2 size={16} className="mr-2" />
                Registrar Devolução
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (activeLoansForAction.length > 0) {
                    setSelectedLoanForAction(activeLoansForAction[0]);
                    setManualRenewalOpen(true);
                  } else {
                    toast({
                      title: 'Sem empréstimos ativos',
                      description: 'Não há empréstimos ativos para renovar.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <RefreshCw size={16} className="mr-2" />
                Registrar Renovação
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{activeLoans}</p>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-yellow-600">{pendingReturns}</p>
              <p className="text-sm text-muted-foreground">Devoluções Pendentes</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">{pendingRenewals}</p>
              <p className="text-sm text-muted-foreground">Renovações Pendentes</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-destructive">{overdueLoans}</p>
              <p className="text-sm text-muted-foreground">Atrasados</p>
            </CardContent>
          </Card>
        </div>

        <DataTable
          data={loans}
          columns={columns}
          searchPlaceholder="Buscar empréstimos..."
          searchableFields={['bookTitle', 'userName', 'userEmail']}
          onRowClick={handleRowClick}
          isAdmin
          onExport={() => console.log('Export loans')}
          idField="id"
          showViewToggle
          defaultView="table"
        />

        {/* Loan Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Detalhes do Empréstimo</DialogTitle>
              <DialogDescription>
                Informações completas sobre o empréstimo
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 py-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Livro</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{selectedLoan?.bookTitle}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Usuário</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{selectedLoan?.userName}</p>
                      <p className="text-sm text-muted-foreground">{selectedLoan?.userEmail}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={selectedLoan ? statusConfig[selectedLoan.status].variant : 'outline'}>
                        {selectedLoan ? statusConfig[selectedLoan.status].label : ''}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Emprestado em:</span>
                      <span>{selectedLoan && format(new Date(selectedLoan.borrowedAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Devolução prevista:</span>
                      <span>{selectedLoan && format(new Date(selectedLoan.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                    {selectedLoan?.returnedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Devolvido em:</span>
                        <span>{format(new Date(selectedLoan.returnedAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                    )}
                    {selectedLoan?.renewalCount !== undefined && selectedLoan.renewalCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Renovações:</span>
                        <span>{selectedLoan.renewalCount}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedLoan?.returnJustification && (
                  <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Justificativa de Devolução</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedLoan.returnJustification}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedLoan?.renewalJustification && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Justificativa de Renovação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedLoan.renewalJustification}</p>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Notas do Administrador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Adicione observações sobre este empréstimo..."
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            <DialogFooter>
              {selectedLoan?.status === 'pending_return' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmAction({ type: 'reject_return', loan: selectedLoan })}
                  >
                    <X size={16} className="mr-2" />
                    Recusar
                  </Button>
                  <Button
                    onClick={() => setConfirmAction({ type: 'approve_return', loan: selectedLoan })}
                  >
                    <Check size={16} className="mr-2" />
                    Aprovar Devolução
                  </Button>
                </div>
              )}
              {selectedLoan?.status === 'pending_renewal' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmAction({ type: 'reject_renewal', loan: selectedLoan })}
                  >
                    <X size={16} className="mr-2" />
                    Recusar
                  </Button>
                  <Button
                    onClick={() => setConfirmAction({ type: 'approve_renewal', loan: selectedLoan })}
                  >
                    <Check size={16} className="mr-2" />
                    Aprovar Renovação
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {dialogContent.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmAction}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Admin Manual Action Dialogs */}
        <AdminLoanDialog
          open={newLoanOpen}
          onOpenChange={setNewLoanOpen}
          onConfirm={handleNewLoan}
        />

        <AdminReturnDialog
          open={manualReturnOpen}
          onOpenChange={setManualReturnOpen}
          loan={selectedLoanForAction}
          onConfirm={handleManualReturn}
        />

        <AdminRenewalDialog
          open={manualRenewalOpen}
          onOpenChange={setManualRenewalOpen}
          loan={selectedLoanForAction}
          onConfirm={handleManualRenewal}
        />
      </div>
    </MainLayout>
  );
}
