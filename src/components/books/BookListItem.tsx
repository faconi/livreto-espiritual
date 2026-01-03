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
      <div className="flex gap-4 p-4 bg-card border rounded-lg hover:shadow-md transition-shadow">
        <img
          src={book.coverUrl || '/placeholder.svg'}
          alt={book.title}
          className="w-16 h-24 object-cover rounded"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link 
                to={`/livro/${book.id}`} 
                className="font-serif font-semibold hover:text-primary transition-colors line-clamp-1"
              >
                {book.title}
              </Link>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              {book.spiritAuthor && (
                <p className="text-xs text-primary">Espírito: {book.spiritAuthor}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{book.publisher}</p>
            </div>

            <div className="text-right shrink-0 flex items-start gap-2">
              {user && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={handleWishlistToggle}
                >
                  <Heart 
                    size={16} 
                    className={isInWishlist ? 'fill-red-500 text-red-500' : ''} 
                  />
                </Button>
              )}
              {book.salePrice ? (
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-primary">
                    R$ {finalPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-muted-foreground line-through">
                      R$ {book.salePrice.toFixed(2)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Só empréstimo</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2 flex-wrap">
              {book.isDonation && (
                <Badge className="bg-accent text-accent-foreground text-xs">Doação</Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="text-xs">-{book.discount}%</Badge>
              )}
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

            {user && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/livro/${book.id}`}>
                    <Eye size={14} className="mr-1" />
                    Ver
                  </Link>
                </Button>
                {canLoan && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLoanDialogOpen(true);
                    }}
                  >
                    <BookMarked size={14} className="mr-1" />
                    Emprestar
                  </Button>
                )}
                {canBuy && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(book, 'purchase');
                    }}
                  >
                    <ShoppingCart size={14} className="mr-1" />
                    Comprar
                  </Button>
                )}
              </div>
            )}
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
    </>
  );
}
