import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, BookMarked, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { LoanRequestDialog } from '@/components/loans/LoanRequestDialog';
import { PurchaseConfirmDialog } from '@/components/books/PurchaseConfirmDialog';
import { BookRatingSummary } from '@/components/reviews/BookRatingSummary';
import { useToast } from '@/hooks/use-toast';

interface CatalogBookCardProps {
  book: Book;
}

export function CatalogBookCard({ book }: CatalogBookCardProps) {
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
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
        <div className="relative aspect-[2/3]">
          <Link to={`/livro/${book.id}`}>
            <img
              src={book.coverUrl || '/placeholder.svg'}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          
          {/* Wishlist button - always visible for logged in users */}
          {user && (
            <Button
              size="icon"
              variant={inWishlist ? "default" : "secondary"}
              className={`absolute top-2 right-2 h-8 w-8 transition-all ${
                inWishlist 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              onClick={handleWishlistToggle}
              title={inWishlist ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart 
                size={16} 
                className={inWishlist ? 'fill-current' : ''} 
              />
            </Button>
          )}
          
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 text-xs sm:text-sm"
            >
              -{book.discount}%
            </Badge>
          )}
          {book.isDonation && (
            <Badge 
              className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-xs"
            >
              Doação
            </Badge>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 flex-1">
          <Link 
            to={`/livro/${book.id}`}
            className="font-serif font-semibold line-clamp-2 hover:text-primary transition-colors text-sm sm:text-base"
          >
            {book.title}
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
            {book.author}
          </p>
          {book.spiritAuthor && (
            <p className="text-xs text-primary mt-0.5 line-clamp-1">
              {book.spiritAuthor}
            </p>
          )}
          
          {/* Rating */}
          <div className="mt-1.5">
            <BookRatingSummary bookId={book.id} />
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3">
            {book.salePrice ? (
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-bold text-primary">
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
            
            <div className="flex gap-1 text-[10px] sm:text-xs">
              {canLoan && (
                <Badge variant="outline" className="px-1.5 py-0.5">
                  {book.availableForLoan} emp.
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        {user && (canLoan || canBuy) && (
          <CardFooter className="p-2 sm:p-3 pt-0 gap-2">
            {canLoan && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs sm:text-sm"
                onClick={(e) => {
                  e.preventDefault();
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
                className="flex-1 h-8 text-xs sm:text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setPurchaseDialogOpen(true);
                }}
              >
                <ShoppingCart size={14} className="mr-1" />
                Comprar
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

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
