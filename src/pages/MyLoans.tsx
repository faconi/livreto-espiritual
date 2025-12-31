import { useState } from 'react';
import { BookOpen, Clock, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loan } from '@/types';
import { mockBooks } from '@/data/mockBooks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Mock loans data
const mockLoans: Loan[] = [
  {
    id: '1',
    bookId: '1',
    userId: '2',
    status: 'active',
    borrowedAt: new Date('2024-01-01'),
    dueDate: new Date('2024-02-01'),
  },
  {
    id: '2',
    bookId: '3',
    userId: '2',
    status: 'pending_return',
    borrowedAt: new Date('2024-01-10'),
    dueDate: new Date('2024-02-10'),
  },
  {
    id: '3',
    bookId: '5',
    userId: '2',
    status: 'returned',
    borrowedAt: new Date('2023-11-01'),
    dueDate: new Date('2023-12-01'),
    returnedAt: new Date('2023-11-28'),
  },
];

const statusConfig = {
  active: {
    label: 'Ativo',
    icon: Clock,
    variant: 'default' as const,
    color: 'text-blue-500',
  },
  pending_return: {
    label: 'Devolução Solicitada',
    icon: RotateCcw,
    variant: 'secondary' as const,
    color: 'text-yellow-500',
  },
  returned: {
    label: 'Devolvido',
    icon: CheckCircle,
    variant: 'outline' as const,
    color: 'text-green-500',
  },
  overdue: {
    label: 'Atrasado',
    icon: AlertCircle,
    variant: 'destructive' as const,
    color: 'text-red-500',
  },
};

export default function MyLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loans, setLoans] = useState(mockLoans);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const getBookDetails = (bookId: string) => {
    return mockBooks.find(b => b.id === bookId);
  };

  const handleRequestReturn = (loan: Loan) => {
    setSelectedLoan(loan);
  };

  const confirmReturn = () => {
    if (!selectedLoan) return;
    
    setLoans(prev =>
      prev.map(l =>
        l.id === selectedLoan.id ? { ...l, status: 'pending_return' as const } : l
      )
    );
    
    toast({
      title: 'Devolução solicitada!',
      description: 'O administrador será notificado. Leve o livro à biblioteca.',
    });
    
    setSelectedLoan(null);
  };

  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'pending_return');
  const historyLoans = loans.filter(l => l.status === 'returned');

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-serif font-bold mb-8 flex items-center gap-3">
          <BookOpen className="text-primary" />
          Meus Empréstimos
        </h1>

        {/* Active loans */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Empréstimos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {activeLoans.length > 0 ? (
              <div className="space-y-4">
                {activeLoans.map(loan => {
                  const book = getBookDetails(loan.bookId);
                  const status = statusConfig[loan.status];
                  const StatusIcon = status.icon;
                  const daysLeft = Math.ceil(
                    (loan.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  if (!book) return null;

                  return (
                    <div key={loan.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                      <img
                        src={book.coverUrl || '/placeholder.svg'}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={status.variant}>
                            <StatusIcon size={14} className="mr-1" />
                            {status.label}
                          </Badge>
                          {loan.status === 'active' && (
                            <span className={`text-sm ${daysLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Vence hoje'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Emprestado em: {loan.borrowedAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {loan.status === 'active' && (
                        <Button
                          variant="outline"
                          onClick={() => handleRequestReturn(loan)}
                        >
                          <RotateCcw size={16} className="mr-2" />
                          Solicitar Devolução
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Você não possui empréstimos ativos no momento.
              </p>
            )}
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoans.length > 0 ? (
              <div className="space-y-4">
                {historyLoans.map(loan => {
                  const book = getBookDetails(loan.bookId);
                  const status = statusConfig[loan.status];
                  const StatusIcon = status.icon;

                  if (!book) return null;

                  return (
                    <div key={loan.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg opacity-75">
                      <img
                        src={book.coverUrl || '/placeholder.svg'}
                        alt={book.title}
                        className="w-12 h-18 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={status.variant}>
                            <StatusIcon size={14} className="mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {loan.borrowedAt.toLocaleDateString('pt-BR')} - {loan.returnedAt?.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum histórico de empréstimos.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Return confirmation dialog */}
      <AlertDialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Devolução</AlertDialogTitle>
            <AlertDialogDescription>
              Você está solicitando a devolução do livro. 
              Por favor, leve o livro à biblioteca para finalizar a devolução.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReturn}>
              Confirmar Devolução
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
