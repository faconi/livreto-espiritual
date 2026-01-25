import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { Book, Loan } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useActivity } from '@/contexts/ActivityContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, mapDbLoanToLoan } from '@/services/database';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface LoanContextType {
  loans: Loan[];
  activeLoans: Loan[];
  isLoading: boolean;
  canBorrow: (bookId: string) => { allowed: boolean; reason?: string };
  requestLoan: (book: Book) => Promise<boolean>;
  requestReturn: (loanId: string, justification?: string) => void;
  requestRenewal: (loanId: string, justification: string) => void;
  getBookLoan: (bookId: string) => Loan | undefined;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { addActivity } = useActivity();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { businessRules } = useSystemSettings();

  const { data: loansData = [], isLoading } = useQuery({
    queryKey: ['loans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const dbLoans = await db.getLoans(user.id);
      return dbLoans.map(mapDbLoanToLoan);
    },
    enabled: !!user,
  });

  const activeLoans = useMemo(() => {
    return loansData.filter(l => 
      l.status === 'active' || 
      l.status === 'pending_return' || 
      l.status === 'pending_renewal' ||
      l.status === 'overdue'
    );
  }, [loansData]);

  const createLoanMutation = useMutation({
    mutationFn: async (book: Book) => {
      if (!user) throw new Error('User not authenticated');
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + businessRules.maxLoanDays);

      await db.createLoan({
        user_id: user.id,
        book_id: book.id,
        status: 'active',
        loan_date: new Date().toISOString(),
        due_date: dueDate.toISOString(),
        renewals_count: 0,
      });

      return { book, dueDate };
    },
    onSuccess: ({ book, dueDate }) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      
      addActivity({
        userId: user!.id,
        type: 'loan_confirmed',
        title: 'Empréstimo confirmado',
        description: `Você solicitou o empréstimo de "${book.title}"`,
        itemId: book.id,
        itemTitle: book.title,
        actionUrl: '/meus-livros',
      });

      toast({
        title: 'Empréstimo confirmado!',
        description: `Retire "${book.title}" na biblioteca. Prazo: ${businessRules.maxLoanDays} dias.`,
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao solicitar empréstimo', description: error.message, variant: 'destructive' });
    },
  });

  const updateLoanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { status: string; user_notes?: string } }) => {
      await db.updateLoan(id, updates as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });

  const canBorrow = useCallback((bookId: string): { allowed: boolean; reason?: string } => {
    if (!user) return { allowed: false, reason: 'Faça login para solicitar empréstimos.' };
    
    const existingLoan = activeLoans.find(l => l.bookId === bookId);
    if (existingLoan) return { allowed: false, reason: 'Você já possui este livro emprestado.' };

    if (activeLoans.length >= businessRules.maxSimultaneousLoans) {
      return { allowed: false, reason: `Você atingiu o limite de ${businessRules.maxSimultaneousLoans} empréstimos ativos.` };
    }

    return { allowed: true };
  }, [user, activeLoans, businessRules]);

  const requestLoan = useCallback(async (book: Book): Promise<boolean> => {
    const { allowed, reason } = canBorrow(book.id);
    if (!allowed) {
      toast({ title: 'Empréstimo não permitido', description: reason, variant: 'destructive' });
      return false;
    }
    await createLoanMutation.mutateAsync(book);
    return true;
  }, [canBorrow, createLoanMutation, toast]);

  const requestReturn = useCallback((loanId: string, justification?: string) => {
    updateLoanMutation.mutate({ id: loanId, updates: { status: 'return_pending', user_notes: justification } });
  }, [updateLoanMutation]);

  const requestRenewal = useCallback((loanId: string, justification: string) => {
    const loan = loansData.find(l => l.id === loanId);
    if (loan && (loan.renewalCount || 0) >= businessRules.maxRenewals) {
      toast({ title: 'Limite de renovações atingido', variant: 'destructive' });
      return;
    }
    updateLoanMutation.mutate({ id: loanId, updates: { status: 'renewal_pending', user_notes: justification } });
  }, [loansData, businessRules, updateLoanMutation, toast]);

  const getBookLoan = useCallback((bookId: string) => activeLoans.find(l => l.bookId === bookId), [activeLoans]);

  return (
    <LoanContext.Provider value={{ loans: loansData, activeLoans, isLoading, canBorrow, requestLoan, requestReturn, requestRenewal, getBookLoan }}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoan() {
  const context = useContext(LoanContext);
  if (!context) throw new Error('useLoan must be used within a LoanProvider');
  return context;
}
