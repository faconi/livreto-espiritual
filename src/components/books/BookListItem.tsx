import { useState } from 'react';
import { Book } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, BookMarked, Eye, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LoanRequestDialog } from '@/components/loans/LoanRequestDialog';
import { useToast } from '@/hooks/use-toast';

interface BookListItemProps {
  book: Book;
  onView?: () => void;
  onWishlistToggle?: (bookId: string) => void;
  isInWishlist?: boolean;
}

export function BookListItem({ book, onView, onWishlistToggle, isInWishlist }: BookListItemProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);

  const hasDiscount = book.discount && book.discount > 0;
  const finalPrice = book.salePrice 
    ? book.salePrice * (1 - (book.discount || 0) / 100) 
    : 0;

  const canLoan = book.availableForLoan > 0;
  const canBuy = book.availableForSale > 0 && book.salePrice;

  const handleLoanConfirm = (confirmedBook: Book) => {
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
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-card border rounded-lg hover:shadow-md transition-shadow">
        {/* Cover + main info row on mobile */}
        <div className="flex gap-3 sm:gap-4">
          <img
            src={book.coverUrl || '/placeholder.svg'}
            alt={book.title}
            className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Link 
                  to={`/livro/${book.id}`} 
                  className="font-serif font-semibold hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base"
                >
                  {book.title}
                </Link>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Médium: {book.author}
                  {book.spiritAuthor && ` | Espírito: ${book.spiritAuthor}`}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="truncate">{book.publisher}</span>
                  {book.edition && <span className="hidden sm:inline">• {book.edition} ed.</span>}
                </div>
              </div>

              {/* Price + wishlist on mobile - inline */}
              <div className="flex items-start gap-1 sm:gap-2 shrink-0">
                {user && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    onClick={handleWishlistToggle}
                  >
                    <Heart 
                      size={14} 
                      className={isInWishlist ? 'fill-red-500 text-red-500' : ''} 
                    />
                  </Button>
                )}
                {book.salePrice ? (
                  <div className="flex flex-col items-end">
                    <span className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                      R$ {finalPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                        R$ {book.salePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Só empréstimo</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Badges + Actions - stacked on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 sm:flex-1">
          {/* Badges */}
          <div className="flex gap-1.5 flex-wrap">
            {book.isDonation && (
              <Badge className="bg-accent text-accent-foreground text-[10px] sm:text-xs px-1.5 py-0.5">Doação</Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 py-0.5">-{book.discount}%</Badge>
            )}
            {book.availableForLoan > 0 && (
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                {book.availableForLoan} p/ empréstimo
              </Badge>
            )}
            {book.availableForSale > 0 && (
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                {book.availableForSale} p/ venda
              </Badge>
            )}
          </div>

          {/* Actions */}
          {user && (
            <div className="flex gap-2 mt-1 sm:mt-0">
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none h-8 text-xs sm:text-sm" asChild>
                <Link to={`/livro/${book.id}`}>
                  <Eye size={14} className="mr-1" />
                  Ver
                </Link>
              </Button>
              {canLoan && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none h-8 text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLoanDialogOpen(true);
                  }}
                >
                  <BookMarked size={14} className="mr-1" />
                  <span className="hidden xs:inline">Emprestar</span>
                  <span className="xs:hidden">Emp.</span>
                </Button>
              )}
              {canBuy && (
                <Button
                  size="sm"
                  className="flex-1 sm:flex-none h-8 text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(book, 'purchase');
                  }}
                >
                  <ShoppingCart size={14} className="mr-1" />
                  <span className="hidden xs:inline">Comprar</span>
                  <span className="xs:hidden">Comp.</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

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
