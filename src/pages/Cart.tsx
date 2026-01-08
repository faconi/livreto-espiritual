import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, QrCode, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { toast } = useToast();
  const [showPixDialog, setShowPixDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Only purchase items - loans are handled separately
  const purchaseItems = items.filter(item => item.type === 'purchase');

  const pixKey = 'Pix@EvangelhoDeCristoOP.com.br';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast({
      title: 'Chave PIX copiada!',
      description: 'Cole no seu aplicativo de banco.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = () => {
    if (purchaseItems.length > 0) {
      setShowPixDialog(true);
    }
  };

  if (purchaseItems.length === 0) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <ShoppingCart size={64} className="mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-6">
            Explore nosso catálogo e adicione livros ao carrinho
          </p>
          <Button asChild>
            <Link to="/catalogo">Ver Catálogo</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-4 sm:py-8 px-3 sm:px-6">
        <h1 className="text-xl sm:text-3xl font-serif font-bold mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3">
          <ShoppingCart className="text-primary" size={24} />
          Carrinho de Compras
        </h1>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ShoppingCart className="text-accent" size={18} />
                  Compras ({purchaseItems.reduce((sum, i) => sum + i.quantity, 0)} itens)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-6">
                {purchaseItems.map(item => {
                  const price = item.book.salePrice || 0;
                  const discount = item.book.discount || 0;
                  const finalPrice = price * (1 - discount / 100);
                  const maxQuantity = item.book.availableForSale;

                  return (
                    <div key={item.book.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex gap-3">
                        <img
                          src={item.book.coverUrl || '/placeholder.svg'}
                          alt={item.book.title}
                          className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{item.book.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{item.book.author}</p>
                          <div className="flex items-center gap-2 mt-1 sm:mt-2">
                            <span className="font-bold text-primary text-sm sm:text-base">
                              R$ {finalPrice.toFixed(2)}
                            </span>
                            {discount > 0 && (
                              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                R$ {price.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {maxQuantity} disponíveis
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-6 sm:w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={item.quantity >= maxQuantity}
                            onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.book.id)}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div>
            <Card className="sticky top-20 sm:top-24">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">
                    Subtotal ({purchaseItems.reduce((sum, i) => sum + i.quantity, 0)} itens)
                  </span>
                  <span className="font-medium">R$ {totalPrice.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
                </div>

                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Finalizar Compra
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Pagamento via PIX
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PIX Payment Dialog */}
      <Dialog open={showPixDialog} onOpenChange={setShowPixDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="text-primary" />
              Pagamento via PIX
            </DialogTitle>
            <DialogDescription>
              Escaneie o QR Code ou copie a chave PIX para pagar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* QR Code placeholder */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                <QrCode size={120} className="text-primary" />
              </div>
            </div>

            {/* Value */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Valor a pagar</p>
              <p className="text-3xl font-bold text-primary">
                R$ {totalPrice.toFixed(2)}
              </p>
            </div>

            {/* PIX Key */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Chave PIX (Email)</p>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                  {pixKey}
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyPix}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </Button>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => {
                setShowPixDialog(false);
                clearCart();
                toast({
                  title: 'Pedido realizado!',
                  description: 'Após o pagamento, seu pedido será processado.',
                });
              }}
            >
              Confirmar Pagamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
