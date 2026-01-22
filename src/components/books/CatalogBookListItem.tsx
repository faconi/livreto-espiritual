import { useState } from 'react';
import { Book } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, BookMarked, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { LoanRequestDialog } from '@/components/loans/LoanRequestDialog';
import { PurchaseConfirmDialog } from '@/components/books/PurchaseConfirmDialog';
import { BookRatingSummary } from '@/components/reviews/BookRatingSummary';
import { useToast } from '@/hooks/use-toast';

interface CatalogBookListItemProps {
  book: Book;
}

export function CatalogBookListItem({ book }: CatalogBookListItemProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const hasDiscount = book.discount && book.discount > 0;
  const finalPrice = book.salePrice 
    ? book.salePrice * (1 - (book.discount || 0) / 100) 
    : 0;

  const canLoan = book.availableForLoan > 0;
  const canBuy = book.availableForSale > 0 && book.salePrice;
  const inWishlist = isInWishlist(book.id);

  const handleLoanConfirm = (confirmedBook: Book) => {
    navigate('/meus-livros');
  };

  const handlePurchaseConfirm = () => {
    addToCart(book, 'purchase');
    setPurchaseDialogOpen(false);
    toast({
      title: 'Adicionado ao carrinho',
      description: `"${book.title}" foi adicionado ao seu carrinho.`,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(book.id, book.title);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-card border rounded-lg hover:shadow-md transition-shadow">
        {/* Main info - NO COVER IMAGE for catalog list view */}
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
                {book.category && <span>• {book.category}</span>}
              </div>
              <div className="mt-1">
                <BookRatingSummary bookId={book.id} />
              </div>
            </div>

            {/* Price + wishlist */}
            <div className="flex items-start gap-1 sm:gap-2 shrink-0">
              {user && (
                <Button
                  size="icon"
                  variant={inWishlist ? "default" : "ghost"}
                  className={`h-7 w-7 sm:h-8 sm:w-8 ${
                    inWishlist 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : ''
                  }`}
                  onClick={handleWishlistToggle}
                  title={inWishlist ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Heart 
                    size={14} 
                    className={inWishlist ? 'fill-current' : ''} 
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

        {/* Badges + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 sm:min-w-[280px]">
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
                    setPurchaseDialogOpen(true);
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

      <LoanRequestDialog
        book={book}
        open={loanDialogOpen}
        onOpenChange={setLoanDialogOpen}
        onConfirm={handleLoanConfirm}
      />

      <PurchaseConfirmDialog
        book={book}
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        onConfirm={handlePurchaseConfirm}
      />
    </>
  );
}
