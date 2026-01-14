import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Book, Loan, Activity as ActivityType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useActivity } from '@/contexts/ActivityContext';

// Loan limits from settings
const MAX_ACTIVE_LOANS = 3;
const LOAN_DURATION_DAYS = 15;
const MAX_RENEWALS = 2;

const STORAGE_KEY_LOANS = 'biblioluz_loans';
const STORAGE_KEY_STOCK = 'biblioluz_stock';

interface LoanContextType {
  loans: Loan[];
  activeLoans: Loan[];
  canBorrow: (bookId: string) => { allowed: boolean; reason?: string };
  requestLoan: (book: Book) => Promise<boolean>;
  requestReturn: (loanId: string, justification?: string) => void;
  requestRenewal: (loanId: string, justification: string) => void;
  getBookLoan: (bookId: string) => Loan | undefined;
  availableStock: Map<string, { forLoan: number; forSale: number }>;
  updateStock: (bookId: string, type: 'loan' | 'sale', quantity: number, action: 'reserve' | 'release') => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

// Mock initial loans (simulating data for user id '2')
const defaultLoans: Loan[] = [
  {
    id: '1',
    bookId: '1',
    userId: '2',
    status: 'active',
    borrowedAt: new Date('2024-01-01'),
    dueDate: new Date('2024-02-01'),
    renewalCount: 0,
  },
  {
    id: '2',
    bookId: '3',
    userId: '2',
    status: 'pending_return',
    borrowedAt: new Date('2024-01-10'),
    dueDate: new Date('2024-02-10'),
    returnJustification: 'Livro em bom estado',
  },
];

// Initial stock based on mockBooks
const defaultStock: [string, { forLoan: number; forSale: number }][] = [
  ['1', { forLoan: 3, forSale: 8 }],
  ['2', { forLoan: 6, forSale: 12 }],
  ['3', { forLoan: 2, forSale: 6 }],
  ['4', { forLoan: 3, forSale: 4 }],
  ['5', { forLoan: 5, forSale: 10 }],
  ['6', { forLoan: 4, forSale: 5 }],
  ['7', { forLoan: 2, forSale: 4 }],
  ['8', { forLoan: 4, forSale: 7 }],
];

// Helpers for localStorage with dates
function loadLoans(): Loan[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LOANS);
    if (!stored) return defaultLoans;
    
    const parsed = JSON.parse(stored);
    return parsed.map((loan: Record<string, unknown>) => ({
      ...loan,
      borrowedAt: new Date(loan.borrowedAt as string),
      dueDate: new Date(loan.dueDate as string),
      returnedAt: loan.returnedAt ? new Date(loan.returnedAt as string) : undefined,
    }));
  } catch {
    return defaultLoans;
  }
}

function saveLoans(loans: Loan[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(loans));
  } catch (error) {
    console.warn('Error saving loans to localStorage:', error);
  }
}

function loadStock(): Map<string, { forLoan: number; forSale: number }> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_STOCK);
    if (!stored) return new Map(defaultStock);
    return new Map(JSON.parse(stored));
  } catch {
    return new Map(defaultStock);
  }
}

function saveStock(stock: Map<string, { forLoan: number; forSale: number }>) {
  try {
    localStorage.setItem(STORAGE_KEY_STOCK, JSON.stringify([...stock.entries()]));
  } catch (error) {
    console.warn('Error saving stock to localStorage:', error);
  }
}

export function LoanProvider({ children }: { children: ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>(() => loadLoans());
  const [stock, setStock] = useState<Map<string, { forLoan: number; forSale: number }>>(() => loadStock());
  const { toast } = useToast();
  const { addActivity } = useActivity();

  // Persist loans when they change
  useEffect(() => {
    saveLoans(loans);
  }, [loans]);

  // Persist stock when it changes
  useEffect(() => {
    saveStock(stock);
  }, [stock]);

  // Get only active loans (not returned)
  const activeLoans = useMemo(() => {
    return loans.filter(l => 
      l.status === 'active' || 
      l.status === 'pending_return' || 
      l.status === 'pending_renewal' ||
      l.status === 'overdue'
    );
  }, [loans]);

  // Check if user can borrow a specific book
  const canBorrow = useCallback((bookId: string): { allowed: boolean; reason?: string } => {
    // Check if user already has this book on loan
    const existingLoan = activeLoans.find(l => l.bookId === bookId);
    if (existingLoan) {
      return { allowed: false, reason: 'Você já possui este livro emprestado.' };
    }

    // Check if user has reached max loans
    if (activeLoans.length >= MAX_ACTIVE_LOANS) {
      return { 
        allowed: false, 
        reason: `Você atingiu o limite de ${MAX_ACTIVE_LOANS} empréstimos ativos. Devolva um livro para solicitar outro.` 
      };
    }

    // Check stock availability
    const bookStock = stock.get(bookId);
    if (!bookStock || bookStock.forLoan <= 0) {
      return { allowed: false, reason: 'Não há exemplares disponíveis para empréstimo.' };
    }

    return { allowed: true };
  }, [activeLoans, stock]);

  // Request a new loan
  const requestLoan = useCallback(async (book: Book): Promise<boolean> => {
    const { allowed, reason } = canBorrow(book.id);
    
    if (!allowed) {
      toast({
        title: 'Empréstimo não permitido',
        description: reason,
        variant: 'destructive',
      });
      return false;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_DURATION_DAYS);

    const newLoan: Loan = {
      id: `loan_${Date.now()}`,
      bookId: book.id,
      userId: '2', // Current user - would come from auth context
      status: 'active',
      borrowedAt: new Date(),
      dueDate,
      renewalCount: 0,
    };

    // Update stock
    setStock(prev => {
      const newStock = new Map(prev);
      const current = newStock.get(book.id);
      if (current) {
        newStock.set(book.id, { ...current, forLoan: current.forLoan - 1 });
      }
      return newStock;
    });

    // Add loan
    setLoans(prev => [...prev, newLoan]);

    // Record activity
    addActivity({
      userId: '2',
      type: 'loan_confirmed',
      title: 'Empréstimo confirmado',
      description: `Você solicitou o empréstimo de "${book.title}"`,
      itemId: book.id,
      itemTitle: book.title,
      actionUrl: '/meus-livros',
      metadata: { 
        dueDate: dueDate.toISOString(),
        stockAfter: (stock.get(book.id)?.forLoan || 1) - 1 
      },
    });

    toast({
      title: 'Empréstimo confirmado!',
      description: `Retire "${book.title}" na biblioteca. Prazo: ${LOAN_DURATION_DAYS} dias.`,
    });

    return true;
  }, [canBorrow, stock, addActivity, toast]);

  // Request return of a book
  const requestReturn = useCallback((loanId: string, justification?: string) => {
    setLoans(prev => {
      const loan = prev.find(l => l.id === loanId);
      if (!loan) return prev;

      // Record activity
      addActivity({
        userId: '2',
        type: 'loan_return_requested',
        title: 'Devolução solicitada',
        description: `Você solicitou a devolução do livro`,
        itemId: loan.bookId,
        actionUrl: '/meus-livros',
        metadata: { justification, loanId },
      });

      return prev.map(l =>
        l.id === loanId 
          ? { ...l, status: 'pending_return' as const, returnJustification: justification } 
          : l
      );
    });
  }, [addActivity]);

  // Request renewal of a loan
  const requestRenewal = useCallback((loanId: string, justification: string) => {
    setLoans(prev => {
      const loan = prev.find(l => l.id === loanId);
      if (!loan) return prev;

      const renewalCount = (loan.renewalCount || 0);
      if (renewalCount >= MAX_RENEWALS) {
        toast({
          title: 'Limite de renovações atingido',
          description: `Este livro já foi renovado ${MAX_RENEWALS} vezes.`,
          variant: 'destructive',
        });
        return prev;
      }

      // Record activity
      addActivity({
        userId: '2',
        type: 'loan_renewal_requested',
        title: 'Renovação solicitada',
        description: `Você solicitou a renovação do empréstimo`,
        itemId: loan.bookId,
        actionUrl: '/meus-livros',
        metadata: { justification, loanId, renewalCount: renewalCount + 1 },
      });

      return prev.map(l =>
        l.id === loanId 
          ? { ...l, status: 'pending_renewal' as const, renewalJustification: justification } 
          : l
      );
    });
  }, [addActivity, toast]);

  // Get loan for a specific book
  const getBookLoan = useCallback((bookId: string): Loan | undefined => {
    return activeLoans.find(l => l.bookId === bookId);
  }, [activeLoans]);

  // Update stock for a book
  const updateStock = useCallback((
    bookId: string, 
    type: 'loan' | 'sale', 
    quantity: number, 
    action: 'reserve' | 'release'
  ) => {
    setStock(prev => {
      const newStock = new Map(prev);
      const current = newStock.get(bookId);
      if (current) {
        const delta = action === 'reserve' ? -quantity : quantity;
        if (type === 'loan') {
          newStock.set(bookId, { ...current, forLoan: Math.max(0, current.forLoan + delta) });
        } else {
          newStock.set(bookId, { ...current, forSale: Math.max(0, current.forSale + delta) });
        }
      }
      return newStock;
    });
  }, []);

  return (
    <LoanContext.Provider
      value={{
        loans,
        activeLoans,
        canBorrow,
        requestLoan,
        requestReturn,
        requestRenewal,
        getBookLoan,
        availableStock: stock,
        updateStock,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
}

export function useLoan() {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
}

export { MAX_ACTIVE_LOANS, LOAN_DURATION_DAYS, MAX_RENEWALS };
