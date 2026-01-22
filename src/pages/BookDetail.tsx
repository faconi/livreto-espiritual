import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookMarked, ShoppingCart, Calendar, Building2, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useReviews } from '@/contexts/ReviewContext';
import { mockBooks } from '@/data/mockBooks';
import { LoanRequestDialog } from '@/components/loans/LoanRequestDialog';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { StarRating } from '@/components/reviews/StarRating';
import { Book } from '@/types';

export default function BookDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { getBookAverageRating, getUserReview } = useReviews();
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);

  const book = mockBooks.find(b => b.id === id);
  const { average, count } = getBookAverageRating(id || '');
  const userReview = user && id ? getUserReview(id, user.id) : undefined;

  if (!book) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Livro não encontrado</h1>
          <Button asChild>
            <Link to="/catalogo">Voltar ao catálogo</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const hasDiscount = book.discount && book.discount > 0;
  const finalPrice = book.salePrice 
    ? book.salePrice * (1 - (book.discount || 0) / 100) 
    : 0;

  const handleLoanConfirm = (confirmedBook: Book) => {
    // In real app, this would create a loan record in the database
    console.log('Loan confirmed for book:', confirmedBook.id);
  };

  return (
    <MainLayout>
      <div className="container py-4 sm:py-8 px-3 sm:px-4">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-4 sm:mb-6 -ml-2 h-9">
          <Link to="/catalogo">
            <ArrowLeft size={18} className="mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Voltar ao catálogo</span>
          </Link>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {/* Book cover - centered on mobile */}
          <div className="md:col-span-1 flex justify-center md:block">
            <div className="md:sticky md:top-24 w-full max-w-[200px] sm:max-w-[280px] md:max-w-none">
              <Card className="overflow-hidden">
                <div className="aspect-[2/3] relative">
                  <img
                    src={book.coverUrl || '/placeholder.svg'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  {hasDiscount && (
                    <Badge 
                      variant="destructive" 
                      className="absolute top-2 sm:top-4 left-2 sm:left-4 text-sm sm:text-lg px-2 sm:px-3 py-0.5 sm:py-1"
                    >
                      -{book.discount}%
                    </Badge>
                  )}
                  {book.isDonation && (
                    <Badge 
                      className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-accent text-accent-foreground text-xs sm:text-sm"
                    >
                      Doação
                    </Badge>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Book details */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            <div className="text-center md:text-left">
              {book.category && (
                <Badge variant="secondary" className="mb-2 text-xs sm:text-sm">
                  {book.category}
                </Badge>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold">
                {book.title}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mt-2">
                Médium: {book.author}
              </p>
              {book.spiritAuthor && (
                <p className="text-base sm:text-lg text-primary mt-1">
                  Espírito: {book.spiritAuthor}
                </p>
              )}
              {book.edition && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {book.edition} edição
                </p>
              )}
              
              {/* Rating summary */}
              {count > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                  <StarRating rating={average} size="md" />
                  <span className="text-sm text-muted-foreground">
                    {average.toFixed(1)} ({count} {count === 1 ? 'avaliação' : 'avaliações'})
                  </span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              {book.publisher && (
                <div className="flex items-center gap-1">
                  <Building2 size={14} className="sm:w-4 sm:h-4" />
                  <span>{book.publisher}</span>
                </div>
              )}
              {book.year && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="sm:w-4 sm:h-4" />
                  <span>{book.year}</span>
                </div>
              )}
              {book.pages && (
                <div className="flex items-center gap-1">
                  <FileText size={14} className="sm:w-4 sm:h-4" />
                  <span>{book.pages} páginas</span>
                </div>
              )}
              {book.isbn && (
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] sm:text-xs">ISBN: {book.isbn}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Descrição</TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-1.5">
                  <Star size={14} />
                  Avaliações {count > 0 && `(${count})`}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4">
                {book.description ? (
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Descrição não disponível.
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4 space-y-4">
                {/* User review form */}
                {user && id && (
                  <ReviewForm bookId={id} existingReview={userReview} />
                )}
                
                {/* Other reviews */}
                <ReviewList bookId={id || ''} currentUserId={user?.id} />
              </TabsContent>
            </Tabs>

            {/* Availability and pricing - stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Loan card */}
              <Card className="border-primary/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="font-semibold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                      <BookMarked size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
                      Empréstimo
                    </h3>
                    <Badge variant={book.availableForLoan > 0 ? 'default' : 'secondary'} className="text-xs sm:text-sm">
                      {book.availableForLoan} disp.
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    Gratuito por até 15 dias
                  </p>
                  {user ? (
                    <Button 
                      className="w-full h-9 sm:h-10 text-sm" 
                      variant="outline"
                      disabled={book.availableForLoan <= 0}
                      onClick={() => setLoanDialogOpen(true)}
                    >
                      <BookMarked size={14} className="mr-1.5 sm:mr-2" />
                      {book.availableForLoan > 0 ? 'Solicitar Empréstimo' : 'Indisponível'}
                    </Button>
                  ) : (
                    <Button className="w-full h-9 sm:h-10 text-sm" variant="outline" asChild>
                      <Link to="/login">Faça login para emprestar</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Purchase card */}
              {book.salePrice && (
                <Card className="border-accent/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="font-semibold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                        <ShoppingCart size={16} className="text-accent sm:w-[18px] sm:h-[18px]" />
                        Compra
                      </h3>
                      <Badge variant={book.availableForSale > 0 ? 'default' : 'secondary'} className="text-xs sm:text-sm">
                        {book.availableForSale} em estoque
                      </Badge>
                    </div>
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-baseline gap-1.5 sm:gap-2">
                        <span className="text-xl sm:text-2xl font-bold text-primary">
                          R$ {finalPrice.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs sm:text-sm text-muted-foreground line-through">
                            R$ {book.salePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    {user ? (
                      <Button 
                        className="w-full h-9 sm:h-10 text-sm"
                        disabled={book.availableForSale <= 0}
                        onClick={() => addToCart(book, 'purchase')}
                      >
                        <ShoppingCart size={14} className="mr-1.5 sm:mr-2" />
                        {book.availableForSale > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
                      </Button>
                    ) : (
                      <Button className="w-full h-9 sm:h-10 text-sm" asChild>
                        <Link to="/login">Faça login para comprar</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loan request dialog */}
      <LoanRequestDialog
        book={book}
        open={loanDialogOpen}
        onOpenChange={setLoanDialogOpen}
        onConfirm={handleLoanConfirm}
      />
    </MainLayout>
  );
}