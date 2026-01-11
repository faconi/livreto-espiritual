import { Book } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

interface PurchaseConfirmDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function PurchaseConfirmDialog({ 
  book, 
  open, 
  onOpenChange, 
  onConfirm 
}: PurchaseConfirmDialogProps) {
  if (!book) return null;

  const hasDiscount = book.discount && book.discount > 0;
  const finalPrice = book.salePrice 
    ? book.salePrice * (1 - (book.discount || 0) / 100) 
    : 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShoppingCart className="text-primary" size={20} />
            Confirmar Compra
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="flex gap-3 p-3 bg-muted rounded-lg">
                <img 
                  src={book.coverUrl || '/placeholder.svg'} 
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground line-clamp-2">{book.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-primary">
                      R$ {finalPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-muted-foreground line-through">
                        R$ {book.salePrice?.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                <AlertTriangle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-700">
                  <p className="font-medium">Importante:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>O item será adicionado ao seu carrinho</li>
                    <li>O pagamento deve ser feito via PIX ou dinheiro</li>
                    <li>A retirada é feita presencialmente na sede</li>
                  </ul>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Adicionar ao Carrinho
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
