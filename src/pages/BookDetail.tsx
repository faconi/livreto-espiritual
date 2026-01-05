import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookMarked, ShoppingCart, Calendar, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockBooks } from '@/data/mockBooks';
import { LoanRequestDialog } from '@/components/loans/LoanRequestDialog';
import { Book } from '@/types';

export default function BookDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);

  const book = mockBooks.find(b => b.id === id);

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
      <div className="container py-8">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/catalogo">
            <ArrowLeft size={18} className="mr-2" />
            Voltar ao catálogo
          </Link>
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Book cover */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
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
                      className="absolute top-4 left-4 text-lg px-3 py-1"
                    >
                      -{book.discount}%
                    </Badge>
                  )}
                  {book.isDonation && (
                    <Badge 
                      className="absolute top-4 right-4 bg-accent text-accent-foreground"
                    >
                      Doação
                    </Badge>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Book details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              {book.category && (
                <Badge variant="secondary" className="mb-2">
                  {book.category}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-serif font-bold">
                {book.title}
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Médium: {book.author}
              </p>
              {book.spiritAuthor && (
                <p className="text-lg text-primary mt-1">
                  Espírito: {book.spiritAuthor}
                </p>
              )}
              {book.edition && (
                <p className="text-sm text-muted-foreground mt-1">
                  {book.edition} edição
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {book.publisher && (
                <div className="flex items-center gap-1">
                  <Building2 size={16} />
                  <span>{book.publisher}</span>
                </div>
              )}
              {book.year && (
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{book.year}</span>
                </div>
              )}
              {book.pages && (
                <div className="flex items-center gap-1">
                  <FileText size={16} />
                  <span>{book.pages} páginas</span>
                </div>
              )}
              {book.isbn && (
                <div className="flex items-center gap-1">
                  <span className="font-mono">ISBN: {book.isbn}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            {book.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Availability and pricing */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Loan card */}
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BookMarked size={18} className="text-primary" />
                      Empréstimo
                    </h3>
                    <Badge variant={book.availableForLoan > 0 ? 'default' : 'secondary'}>
                      {book.availableForLoan} disponíveis
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gratuito por até 15 dias
                  </p>
                  {user ? (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      disabled={book.availableForLoan <= 0}
                      onClick={() => setLoanDialogOpen(true)}
                    >
                      <BookMarked size={16} className="mr-2" />
                      {book.availableForLoan > 0 ? 'Solicitar Empréstimo' : 'Indisponível'}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" asChild>
                      <Link to="/login">Faça login para emprestar</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Purchase card */}
              {book.salePrice && (
                <Card className="border-accent/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <ShoppingCart size={18} className="text-accent" />
                        Compra
                      </h3>
                      <Badge variant={book.availableForSale > 0 ? 'default' : 'secondary'}>
                        {book.availableForSale} em estoque
                      </Badge>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          R$ {finalPrice.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-muted-foreground line-through">
                            R$ {book.salePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    {user ? (
                      <Button 
                        className="w-full"
                        disabled={book.availableForSale <= 0}
                        onClick={() => addToCart(book, 'purchase')}
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        {book.availableForSale > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
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