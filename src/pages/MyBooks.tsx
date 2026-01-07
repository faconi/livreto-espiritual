import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  RefreshCw,
  ShoppingBag,
  History,
  Heart,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { useAuth } from '@/contexts/AuthContext';
import { Loan, Sale, Book, WishlistItem } from '@/types';
import { mockBooks } from '@/data/mockBooks';
import { LoanReturnDialog } from '@/components/loans/LoanReturnDialog';
import { LoanRenewalDialog } from '@/components/loans/LoanRenewalDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookCard } from '@/components/books/BookCard';

// Mock data
const mockLoans: Loan[] = [
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

const mockPurchases: (Sale & { bookTitle: string })[] = [
  {
    id: 's1',
    bookId: '2',
    userId: '2',
    bookTitle: 'O Evangelho Segundo o Espiritismo',
    quantity: 1,
    unitPrice: 42,
    totalPrice: 42,
    paymentMethod: 'pix',
    paymentStatus: 'completed',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 's2',
    bookId: '7',
    userId: '2',
    bookTitle: 'Violetas na Janela',
    quantity: 2,
    unitPrice: 35,
    totalPrice: 70,
    paymentMethod: 'pix',
    paymentStatus: 'completed',
    createdAt: new Date('2023-11-20'),
  },
];

const mockWishlist: string[] = ['4', '6', '8'];

const statusConfig = {
  active: {
    label: 'Ativo',
    icon: Clock,
    variant: 'default' as const,
    color: 'text-blue-500',
  },
  pending_return: {
    label: 'Devolução Pendente',
    icon: RotateCcw,
    variant: 'secondary' as const,
    color: 'text-yellow-500',
  },
  pending_renewal: {
    label: 'Renovação Pendente',
    icon: RefreshCw,
    variant: 'secondary' as const,
    color: 'text-orange-500',
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

export default function MyBooks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loans, setLoans] = useState(mockLoans);
  const [wishlist, setWishlist] = useState<string[]>(mockWishlist);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<LoanWithBook | null>(null);
  const [selectedLoanForRenewal, setSelectedLoanForRenewal] = useState<LoanWithBook | null>(null);

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

  const activeLoans = loansWithBooks.filter(l => l.status === 'active' || l.status === 'pending_return' || l.status === 'pending_renewal');
  const loanHistory = loansWithBooks.filter(l => l.status === 'returned');

  const wishlistBooks = useMemo(() => {
    return mockBooks.filter(book => wishlist.includes(book.id));
  }, [wishlist]);

  // Get suggested books based on categories and authors from history
  const suggestedBooks = useMemo(() => {
    const borrowedCategories = new Set(
      loansWithBooks
        .map(l => getBookDetails(l.bookId)?.category)
        .filter(Boolean)
    );
    const borrowedAuthors = new Set(
      loansWithBooks
        .map(l => getBookDetails(l.bookId)?.spiritAuthor)
        .filter(Boolean)
    );

    return mockBooks
      .filter(book => 
        !loans.some(l => l.bookId === book.id) && // Not already borrowed
        !wishlist.includes(book.id) && // Not in wishlist
        (borrowedCategories.has(book.category) || borrowedAuthors.has(book.spiritAuthor))
      )
      .slice(0, 4);
  }, [loans, wishlist, loansWithBooks]);

  const handleReturnConfirm = (loanId: string, justification?: string) => {
    setLoans(prev =>
      prev.map(l =>
        l.id === loanId 
          ? { ...l, status: 'pending_return' as const, returnJustification: justification } 
          : l
      )
    );
  };

  const handleRenewalConfirm = (loanId: string, justification: string) => {
    setLoans(prev =>
      prev.map(l =>
        l.id === loanId 
          ? { ...l, status: 'pending_renewal' as const, renewalJustification: justification } 
          : l
      )
    );
  };

  const handleWishlistToggle = (bookId: string) => {
    setWishlist(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const renderLoanCard = (loan: LoanWithBook) => {
    const config = statusConfig[loan.status];
    const StatusIcon = config.icon;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-3 sm:gap-4">
            <img
              src={loan.bookCover}
              alt={loan.bookTitle}
              className="w-12 h-18 sm:w-16 sm:h-24 object-cover rounded cursor-pointer flex-shrink-0"
              onClick={() => navigate(`/livro/${loan.bookId}`)}
            />
            <div className="flex-1 min-w-0">
              <h3 
                className="font-semibold line-clamp-2 hover:text-primary cursor-pointer transition-colors text-sm sm:text-base"
                onClick={() => navigate(`/livro/${loan.bookId}`)}
              >
                {loan.bookTitle}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{loan.bookAuthor}</p>
              
              <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                <Badge variant={config.variant} className="text-[10px] sm:text-xs px-1.5 sm:px-2">
                  <StatusIcon size={12} className="mr-0.5 sm:mr-1" />
                  <span className="hidden xs:inline">{config.label}</span>
                  <span className="xs:hidden">
                    {loan.status === 'active' ? 'Ativo' : 
                     loan.status === 'pending_return' ? 'Dev. Pend.' : 
                     loan.status === 'pending_renewal' ? 'Ren. Pend.' : 'Devolvido'}
                  </span>
                </Badge>
              </div>

              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">
                Emprestado: {loan.borrowedAt.toLocaleDateString('pt-BR')}
              </p>
              {loan.status === 'active' && (
                <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${loan.daysLeft <= 5 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  {loan.daysLeft > 0 ? `${loan.daysLeft} dias para devolução` : 'Vence hoje!'}
                </p>
              )}

              {loan.status === 'active' && (
                <div className="mt-2 sm:mt-3 flex gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs sm:text-sm px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLoanForReturn(loan);
                    }}
                  >
                    <RotateCcw size={12} className="sm:mr-1" />
                    <span className="hidden sm:inline">Devolver</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8 text-xs sm:text-sm px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLoanForRenewal(loan);
                    }}
                  >
                    <RefreshCw size={12} className="sm:mr-1" />
                    <span className="hidden sm:inline">Renovar</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="container py-4 sm:py-8 px-3 sm:px-4 max-w-6xl">
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
              <BookOpen className="text-primary w-6 h-6 sm:w-8 sm:h-8" />
              Meus Livros
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Empréstimos ativos, histórico, lista de desejos e recomendações
            </p>
          </div>

          <Tabs defaultValue="active" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              <TabsTrigger value="active" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
                <Clock size={16} />
                <span className="hidden xs:inline">Ativos</span>
                {activeLoans.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">{activeLoans.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
                <History size={16} />
                <span className="hidden xs:inline">Histórico</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
                <Heart size={16} />
                <span className="hidden xs:inline">Desejos</span>
                {wishlistBooks.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">{wishlistBooks.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
                <Sparkles size={16} />
                <span className="hidden xs:inline">Sugestões</span>
              </TabsTrigger>
            </TabsList>

            {/* Active Loans */}
            <TabsContent value="active" className="space-y-4">
              {activeLoans.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {activeLoans.map(loan => (
                    <div key={loan.id}>{renderLoanCard(loan)}</div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium">Nenhum empréstimo ativo</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Explore o catálogo e solicite um empréstimo
                    </p>
                    <Button className="mt-4" onClick={() => navigate('/catalogo')}>
                      Ver Catálogo
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Loan History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen size={20} />
                      Últimos Empréstimos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loanHistory.length > 0 ? (
                      <div className="space-y-3">
                        {loanHistory.map(loan => (
                          <div 
                            key={loan.id}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => navigate(`/livro/${loan.bookId}`)}
                          >
                            <img
                              src={loan.bookCover}
                              alt={loan.bookTitle}
                              className="w-10 h-14 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{loan.bookTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                Devolvido em {loan.returnedAt?.toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <Badge variant="outline">
                              <CheckCircle size={12} className="mr-1" />
                              Devolvido
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum empréstimo devolvido
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Purchase History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingBag size={20} />
                      Últimas Compras
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mockPurchases.length > 0 ? (
                      <div className="space-y-3">
                        {mockPurchases.map(purchase => (
                          <div 
                            key={purchase.id}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => navigate(`/livro/${purchase.bookId}`)}
                          >
                            <ShoppingBag size={20} className="text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{purchase.bookTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                {purchase.quantity}x em {purchase.createdAt.toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <span className="font-medium text-green-600">
                              R$ {purchase.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhuma compra realizada
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Wishlist */}
            <TabsContent value="wishlist" className="space-y-4">
              {wishlistBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlistBooks.map(book => (
                    <BookCard 
                      key={book.id} 
                      book={book} 
                      isInWishlist={true}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium">Lista de desejos vazia</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Adicione livros que você deseja ler no futuro
                    </p>
                    <Button className="mt-4" onClick={() => navigate('/catalogo')}>
                      Explorar Catálogo
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Suggestions */}
            <TabsContent value="suggestions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles size={20} className="text-primary" />
                    Recomendados para Você
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {suggestedBooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {suggestedBooks.map(book => (
                        <BookCard 
                          key={book.id} 
                          book={book}
                          isInWishlist={wishlist.includes(book.id)}
                          onWishlistToggle={handleWishlistToggle}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Faça mais empréstimos para receber recomendações personalizadas
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Return dialog */}
      <LoanReturnDialog
        loan={selectedLoanForReturn}
        open={!!selectedLoanForReturn}
        onOpenChange={(open) => !open && setSelectedLoanForReturn(null)}
        onConfirm={handleReturnConfirm}
      />

      {/* Renewal dialog */}
      <LoanRenewalDialog
        loan={selectedLoanForRenewal}
        open={!!selectedLoanForRenewal}
        onOpenChange={(open) => !open && setSelectedLoanForRenewal(null)}
        onConfirm={handleRenewalConfirm}
      />
    </MainLayout>
  );
}
