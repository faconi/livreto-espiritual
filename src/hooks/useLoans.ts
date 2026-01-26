import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/services/database';
import { Loan } from '@/types';
import { useToast } from '@/hooks/use-toast';

export interface LoanWithDetails {
  id: string;
  bookId: string;
  userId: string;
  status: Loan['status'];
  borrowedAt: Date;
  dueDate: Date;
  returnedAt?: Date;
  renewalCount: number;
  returnJustification?: string;
  renewalJustification?: string;
  adminNotes?: string;
  bookTitle: string;
  bookCover: string;
  userName: string;
  userEmail: string;
}

function mapDbLoanToLoan(dbLoan: any): LoanWithDetails {
  return {
    id: dbLoan.id,
    bookId: dbLoan.book_id,
    userId: dbLoan.user_id,
    status: dbLoan.status,
    borrowedAt: dbLoan.loan_date ? new Date(dbLoan.loan_date) : new Date(dbLoan.created_at),
    dueDate: dbLoan.due_date ? new Date(dbLoan.due_date) : new Date(),
    returnedAt: dbLoan.return_date ? new Date(dbLoan.return_date) : undefined,
    renewalCount: dbLoan.renewals_count || 0,
    returnJustification: dbLoan.user_notes || undefined,
    adminNotes: dbLoan.admin_notes || undefined,
    bookTitle: dbLoan.books?.title || 'Livro não encontrado',
    bookCover: dbLoan.books?.cover_url || '/placeholder.svg',
    userName: dbLoan.profiles?.full_name || 'Usuário',
    userEmail: dbLoan.profiles?.email || '',
  };
}

export function useLoansAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: loans = [], isLoading, error } = useQuery({
    queryKey: ['loans', 'admin'],
    queryFn: async () => {
      const dbLoans = await db.getLoans();
      return dbLoans.map(mapDbLoanToLoan);
    },
  });

  const updateLoan = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<any> }) => {
      await db.updateLoan(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar empréstimo', description: error.message, variant: 'destructive' });
    },
  });

  const createLoan = useMutation({
    mutationFn: async (loan: {
      userId: string;
      bookId: string;
      dueDate: Date;
      adminNotes?: string;
    }) => {
      await db.createLoan({
        user_id: loan.userId,
        book_id: loan.bookId,
        status: 'active',
        loan_date: new Date().toISOString(),
        due_date: loan.dueDate.toISOString(),
        admin_notes: loan.adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({ title: 'Empréstimo registrado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar empréstimo', description: error.message, variant: 'destructive' });
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
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({ title: 'Devolução aprovada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const approveRenewal = useMutation({
    mutationFn: async ({ loanId, newDueDate, adminNotes }: { loanId: string; newDueDate: Date; adminNotes?: string }) => {
      const loan = loans.find(l => l.id === loanId);
      await db.updateLoan(loanId, {
        status: 'active',
        due_date: newDueDate.toISOString(),
        renewals_count: (loan?.renewalCount || 0) + 1,
        admin_notes: adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({ title: 'Renovação aprovada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const rejectAction = useMutation({
    mutationFn: async ({ loanId, adminNotes }: { loanId: string; adminNotes?: string }) => {
      await db.updateLoan(loanId, {
        status: 'active',
        admin_notes: adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({ title: 'Solicitação recusada.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  return {
    loans,
    isLoading,
    error,
    updateLoan,
    createLoan,
    approveReturn,
    approveRenewal,
    rejectAction,
  };
}
