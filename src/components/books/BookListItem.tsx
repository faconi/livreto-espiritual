import { Book } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, BookMarked, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface BookListItemProps {
  book: Book;
  onView?: () => void;
}

export function BookListItem({ book, onView }: BookListItemProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const hasDiscount = book.discount && book.discount > 0;
  const finalPrice = book.salePrice 
    ? book.salePrice * (1 - (book.discount || 0) / 100) 
    : 0;

  return (
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

          <div className="text-right shrink-0">
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
          <div className="flex gap-2">
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
              {book.availableForLoan > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(book, 'loan');
                  }}
                >
                  <BookMarked size={14} className="mr-1" />
                  Emprestar
                </Button>
              )}
              {book.availableForSale > 0 && book.salePrice && (
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
  );
}
