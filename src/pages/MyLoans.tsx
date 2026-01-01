import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
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
import { Card, CardContent } from '@/components/ui/card';

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

interface LoanWithBook extends Loan {
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  daysLeft: number;
}

export default function MyLoans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loans, setLoans] = useState(mockLoans);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const getBookDetails = (bookId: string) => {
    return mockBooks.find(b => b.id === bookId);
  };

  const loansWithBooks: LoanWithBook[] = useMemo(() => {
    return loans.map(loan => {
      const book = getBookDetails(loan.bookId);
      const daysLeft = Math.ceil(
        (loan.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return {
        ...loan,
        bookTitle: book?.title || 'Livro não encontrado',
        bookAuthor: book?.author || '',
        bookCover: book?.coverUrl || '/placeholder.svg',
        daysLeft,
      };
    });
  }, [loans]);

  const handleRequestReturn = (loan: LoanWithBook) => {
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

  const columns: ColumnDef<LoanWithBook>[] = useMemo(() => [
    {
      id: 'bookTitle',
      header: 'Livro',
      accessorKey: 'bookTitle',
      sortable: true,
      filterable: true,
      filterType: 'text',
      cell: (loan) => (
        <div className="flex items-center gap-3">
          <img
            src={loan.bookCover}
            alt={loan.bookTitle}
            className="w-10 h-14 object-cover rounded"
          />
          <div>
            <span 
              className="font-medium hover:text-primary cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/livro/${loan.bookId}`);
              }}
            >
              {loan.bookTitle}
            </span>
            <p className="text-sm text-muted-foreground">{loan.bookAuthor}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Ativo', value: 'active' },
        { label: 'Devolução Solicitada', value: 'pending_return' },
        { label: 'Devolvido', value: 'returned' },
        { label: 'Atrasado', value: 'overdue' },
      ],
      cell: (loan) => {
        const config = statusConfig[loan.status];
        const StatusIcon = config.icon;
        return (
          <Badge variant={config.variant}>
            <StatusIcon size={14} className="mr-1" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'borrowedAt',
      header: 'Data Empréstimo',
      accessorFn: (loan) => loan.borrowedAt.toISOString(),
      sortable: true,
      cell: (loan) => loan.borrowedAt.toLocaleDateString('pt-BR'),
    },
    {
      id: 'dueDate',
      header: 'Vencimento',
      accessorFn: (loan) => loan.dueDate.toISOString(),
      sortable: true,
      cell: (loan) => (
        <div>
          <span>{loan.dueDate.toLocaleDateString('pt-BR')}</span>
          {loan.status === 'active' && (
            <p className={`text-xs ${loan.daysLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {loan.daysLeft > 0 ? `${loan.daysLeft} dias restantes` : 'Vence hoje'}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'returnedAt',
      header: 'Devolvido em',
      accessorFn: (loan) => loan.returnedAt?.toISOString() || '',
      sortable: true,
      cell: (loan) => loan.returnedAt 
        ? loan.returnedAt.toLocaleDateString('pt-BR') 
        : '-',
    },
    {
      id: 'actions',
      header: '',
      cell: (loan) => loan.status === 'active' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleRequestReturn(loan);
          }}
        >
          <RotateCcw size={14} className="mr-1" />
          Devolver
        </Button>
      ) : null,
    },
  ], [navigate]);

  const renderCard = (loan: LoanWithBook) => {
    const config = statusConfig[loan.status];
    const StatusIcon = config.icon;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <img
              src={loan.bookCover}
              alt={loan.bookTitle}
              className="w-16 h-24 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 
                className="font-semibold line-clamp-2 hover:text-primary cursor-pointer transition-colors"
                onClick={() => navigate(`/livro/${loan.bookId}`)}
              >
                {loan.bookTitle}
              </h3>
              <p className="text-sm text-muted-foreground">{loan.bookAuthor}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={config.variant}>
                  <StatusIcon size={14} className="mr-1" />
                  {config.label}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Emprestado: {loan.borrowedAt.toLocaleDateString('pt-BR')}
              </p>

              {loan.status === 'active' && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestReturn(loan);
                    }}
                  >
                    <RotateCcw size={14} className="mr-1" />
                    Solicitar Devolução
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListItem = (loan: LoanWithBook) => {
    const config = statusConfig[loan.status];
    const StatusIcon = config.icon;

    return (
      <div className="flex gap-4 p-4 bg-card border rounded-lg hover:shadow-md transition-shadow">
        <img
          src={loan.bookCover}
          alt={loan.bookTitle}
          className="w-12 h-18 object-cover rounded"
        />
        <div className="flex-1 flex items-center justify-between gap-4">
          <div>
            <h3 
              className="font-medium hover:text-primary cursor-pointer transition-colors"
              onClick={() => navigate(`/livro/${loan.bookId}`)}
            >
              {loan.bookTitle}
            </h3>
            <p className="text-sm text-muted-foreground">{loan.bookAuthor}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {loan.borrowedAt.toLocaleDateString('pt-BR')} - {loan.returnedAt?.toLocaleDateString('pt-BR') || loan.dueDate.toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={config.variant}>
              <StatusIcon size={14} className="mr-1" />
              {config.label}
            </Badge>

            {loan.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequestReturn(loan);
                }}
              >
                <RotateCcw size={14} className="mr-1" />
                Devolver
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
              <BookOpen className="text-primary" />
              Meus Empréstimos
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe seus empréstimos e devoluções
            </p>
          </div>

          <DataTable
            data={loansWithBooks}
            columns={columns}
            searchPlaceholder="Buscar por título do livro..."
            searchableFields={['bookTitle', 'bookAuthor']}
            onRowClick={(loan) => navigate(`/livro/${loan.bookId}`)}
            renderCard={renderCard}
            renderListItem={renderListItem}
            emptyMessage="Você não possui empréstimos"
            emptyIcon={<BookOpen size={48} className="text-muted-foreground/50" />}
            defaultView="list"
          />
        </div>
      </div>

      {/* Return confirmation dialog */}
      <AlertDialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Devolução</AlertDialogTitle>
            <AlertDialogDescription>
              Você está solicitando a devolução do livro{' '}
              <strong>{(selectedLoan as LoanWithBook)?.bookTitle}</strong>.
              <br /><br />
              Por favor, leve o livro à biblioteca para finalizar a devolução.
              O administrador irá confirmar o recebimento.
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
