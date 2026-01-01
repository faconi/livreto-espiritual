import { useState } from 'react';
import { Book } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, BookMarked, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LoanRequestDialog } from '@/components/loans/LoanRequestDialog';

interface BookCardProps {
  book: Book;
  className?: string;
}

export function BookCard({ book, className }: BookCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);

  const hasDiscount = book.discount && book.discount > 0;
  const finalPrice = book.salePrice 
    ? book.salePrice * (1 - (book.discount || 0) / 100) 
    : 0;

  const handleLoanConfirm = (confirmedBook: Book) => {
    // In real app, this would create a loan record in the database
    console.log('Loan confirmed for book:', confirmedBook.id);
  };

  return (
    <>
      <Card className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}>
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={book.coverUrl || '/placeholder.svg'}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {book.isDonation && (
              <Badge className="bg-accent text-accent-foreground">
                Doação
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive">
                -{book.discount}%
              </Badge>
            )}
          </div>

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <Button 
                size="sm" 
                variant="secondary"
                className="flex-1"
                asChild
              >
                <Link to={`/livro/${book.id}`}>
                  <Eye size={16} className="mr-1" />
                  Ver
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          <div>
            <h3 className="font-serif font-semibold line-clamp-2 leading-tight">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
            {book.spiritAuthor && (
              <p className="text-xs text-primary">
                Espírito: {book.spiritAuthor}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {book.salePrice ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">
                    R$ {finalPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {book.salePrice.toFixed(2)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Apenas empréstimo
                </span>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="flex gap-2 text-xs">
            {book.availableForLoan > 0 && (
              <Badge variant="outline" className="text-xs">
                {book.availableForLoan} p/ empréstimo
              </Badge>
            )}
            {book.availableForSale > 0 && (
              <Badge variant="outline" className="text-xs">
                {book.availableForSale} p/ venda
              </Badge>
            )}
          </div>

          {/* Actions */}
          {user && (
            <div className="flex gap-2 pt-2">
              {book.availableForLoan > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLoanDialogOpen(true)}
                >
                  <BookMarked size={14} className="mr-1" />
                  Emprestar
                </Button>
              )}
              {book.availableForSale > 0 && book.salePrice && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => addToCart(book, 'purchase')}
                >
                  <ShoppingCart size={14} className="mr-1" />
                  Comprar
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan request dialog */}
      <LoanRequestDialog
        book={book}
        open={loanDialogOpen}
        onOpenChange={setLoanDialogOpen}
        onConfirm={handleLoanConfirm}
      />
    </>
  );
}