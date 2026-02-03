import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/services/database';
import { useToast } from '@/hooks/use-toast';
import { PendingConfirmation } from '@/types';
import { addDays } from 'date-fns';

export interface PendingItem {
  id: string;
  type: 'loan_return' | 'loan_renewal' | 'payment' | 'loan_request';
  userId: string;
  userName: string;
  userEmail: string;
  itemId: string;
  itemTitle: string;
  requestedAt: Date;
  justification?: string;
  status: 'pending' | 'approved' | 'rejected';
  // Extra data for processing
  bookId?: string;
  loanId?: string;
  saleId?: string;
  renewalCount?: number;
  dueDate?: Date;
}

export function usePendingConfirmations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pendingItems = [], isLoading, error } = useQuery({
    queryKey: ['pending-confirmations'],
    queryFn: async () => {
      const items: PendingItem[] = [];

      // Get loans with pending statuses
      const loans = await db.getLoans();
      
      // Filter pending loan requests
      loans.filter(l => l.status === 'pending').forEach(loan => {
        items.push({
          id: `loan-request-${loan.id}`,
          type: 'loan_request',
          userId: loan.user_id,
          userName: loan.profiles?.full_name || 'Usuário',
          userEmail: loan.profiles?.email || '',
          itemId: loan.id,
          itemTitle: loan.books?.title || 'Livro',
          requestedAt: new Date(loan.created_at),
          justification: loan.user_notes || undefined,
          status: 'pending',
          bookId: loan.book_id,
          loanId: loan.id,
        });
      });

      // Filter return pending
      loans.filter(l => l.status === 'return_pending').forEach(loan => {
        items.push({
          id: `loan-return-${loan.id}`,
          type: 'loan_return',
          userId: loan.user_id,
          userName: loan.profiles?.full_name || 'Usuário',
          userEmail: loan.profiles?.email || '',
          itemId: loan.id,
          itemTitle: loan.books?.title || 'Livro',
          requestedAt: new Date(loan.updated_at),
          justification: loan.user_notes || undefined,
          status: 'pending',
          bookId: loan.book_id,
          loanId: loan.id,
        });
      });

      // Filter renewal pending
      loans.filter(l => l.status === 'renewal_pending').forEach(loan => {
        items.push({
          id: `loan-renewal-${loan.id}`,
          type: 'loan_renewal',
          userId: loan.user_id,
          userName: loan.profiles?.full_name || 'Usuário',
          userEmail: loan.profiles?.email || '',
          itemId: loan.id,
          itemTitle: loan.books?.title || 'Livro',
          requestedAt: new Date(loan.updated_at),
          justification: loan.user_notes || undefined,
          status: 'pending',
          bookId: loan.book_id,
          loanId: loan.id,
          renewalCount: loan.renewals_count || 0,
          dueDate: loan.due_date ? new Date(loan.due_date) : undefined,
        });
      });

      // Get sales with pending status
      const sales = await db.getSales();
      sales.filter(s => s.status === 'pending').forEach(sale => {
        const totalFormatted = Number(sale.total_price).toFixed(2).replace('.', ',');
        items.push({
          id: `sale-payment-${sale.id}`,
          type: 'payment',
          userId: sale.user_id,
          userName: sale.profiles?.full_name || 'Usuário',
          userEmail: sale.profiles?.email || '',
          itemId: sale.id,
          itemTitle: `${sale.books?.title || 'Livro'} (R$ ${totalFormatted})`,
          requestedAt: new Date(sale.created_at),
          justification: sale.payment_method === 'pix' ? 'Pagamento PIX realizado' : 'Pagamento em dinheiro',
          status: 'pending',
          bookId: sale.book_id,
          saleId: sale.id,
        });
      });

      // Sort by date descending
      items.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());

      return items;
    },
  });

  const approveLoanRequest = useMutation({
    mutationFn: async ({ loanId, adminNotes }: { loanId: string; adminNotes?: string }) => {
      await db.updateLoan(loanId, {
        status: 'active',
        loan_date: new Date().toISOString(),
        admin_notes: adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({ title: 'Empréstimo aprovado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const rejectLoanRequest = useMutation({
    mutationFn: async ({ loanId, adminNotes }: { loanId: string; adminNotes?: string }) => {
      // Just delete the pending loan or mark it somehow
      await db.updateLoan(loanId, {
        status: 'returned', // Mark as returned to remove from active list
        admin_notes: adminNotes || 'Solicitação recusada',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({ title: 'Solicitação recusada' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const approveReturn = useMutation({
    mutationFn: async ({ loanId, adminNotes }: { loanId: string; adminNotes?: string }) => {
      await db.updateLoan(loanId, {
        status: 'returned',
        return_date: new Date().toISOString(),
        admin_notes: adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({ title: 'Devolução aprovada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const rejectReturn = useMutation({
    mutationFn: async ({ loanId, adminNotes }: { loanId: string; adminNotes?: string }) => {
      await db.updateLoan(loanId, {
        status: 'active',
        admin_notes: adminNotes || 'Devolução recusada - continua ativo',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({ title: 'Devolução recusada' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const approveRenewal = useMutation({
    mutationFn: async ({ loanId, currentDueDate, renewalCount, adminNotes }: { 
      loanId: string; 
      currentDueDate: Date;
      renewalCount: number;
      adminNotes?: string 
    }) => {
      const newDueDate = addDays(currentDueDate, 15);
      await db.updateLoan(loanId, {
        status: 'active',
        due_date: newDueDate.toISOString(),
        renewals_count: renewalCount + 1,
        admin_notes: adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({ title: 'Renovação aprovada! Prazo estendido em 15 dias.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const rejectRenewal = useMutation({
    mutationFn: async ({ loanId, adminNotes }: { loanId: string; adminNotes?: string }) => {
      await db.updateLoan(loanId, {
        status: 'active',
        admin_notes: adminNotes || 'Renovação recusada - prazo original mantido',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({ title: 'Renovação recusada' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const approvePayment = useMutation({
    mutationFn: async ({ saleId, adminNotes }: { saleId: string; adminNotes?: string }) => {
      await db.updateSale(saleId, {
        status: 'confirmed',
        admin_notes: adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({ title: 'Pagamento confirmado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const rejectPayment = useMutation({
    mutationFn: async ({ saleId, adminNotes }: { saleId: string; adminNotes?: string }) => {
      await db.updateSale(saleId, {
        status: 'cancelled',
        admin_notes: adminNotes || 'Pagamento não confirmado',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-confirmations'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({ title: 'Venda cancelada' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  return {
    pendingItems,
    isLoading,
    error,
    approveLoanRequest,
    rejectLoanRequest,
    approveReturn,
    rejectReturn,
    approveRenewal,
    rejectRenewal,
    approvePayment,
    rejectPayment,
  };
}
