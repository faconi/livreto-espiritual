import { useState } from 'react';
import { Book } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, BookMarked, Eye, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LoanRequestDialog } from '@/components/loans/LoanRequestDialog';
import { useToast } from '@/hooks/use-toast';

interface BookCardProps {
  book: Book;
  className?: string;
  onWishlistToggle?: (bookId: string) => void;
  isInWishlist?: boolean;
}

export function BookCard({ book, className, onWishlistToggle, isInWishlist }: BookCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);

  const hasDiscount = book.discount && book.discount > 0;
  const finalPrice = book.salePrice 
    ? book.salePrice * (1 - (book.discount || 0) / 100) 
    : 0;

  // Check loan availability (max 3 active loans per user, 1 per book)
  const canLoan = book.availableForLoan > 0;
  const canBuy = book.availableForSale > 0 && book.salePrice;

  const handleLoanConfirm = (confirmedBook: Book) => {
    // In real app, this would create a loan record and redirect to My Books
    console.log('Loan confirmed for book:', confirmedBook.id);
    navigate('/meus-livros');
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(book.id);
    } else {
      toast({
        title: isInWishlist ? 'Removido da lista de desejos' : 'Adicionado à lista de desejos',
        description: isInWishlist 
          ? `"${book.title}" foi removido da sua lista.`
          : `"${book.title}" foi adicionado à sua lista.`,
      });
    }
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

          {/* Wishlist button */}
          {user && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
              onClick={handleWishlistToggle}
            >
              <Heart 
                size={16} 
                className={isInWishlist ? 'fill-red-500 text-red-500' : ''} 
              />
            </Button>
          )}

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
            <p className="text-sm text-muted-foreground">
              Médium: {book.author}
            </p>
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
              {canLoan && (
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
              {canBuy && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => addToCart(book, 'purchase')}
                >
                  <ShoppingCart size={14} className="mr-1" />
                  Comprar
                </Button>
              )}
              {!canLoan && !canBuy && (
                <Badge variant="secondary" className="w-full justify-center py-1">
                  Indisponível
                </Badge>
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
