import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, BookMarked, QrCode, Copy, Check } from 'lucide-react';
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

  const loanItems = items.filter(item => item.type === 'loan');
  const purchaseItems = items.filter(item => item.type === 'purchase');

  const pixKey = 'Pix@EvangelhoDeCristoOP.com.br';

  // Generate a simple QR Code data URL (in production, use a proper library)
  const generatePixCode = () => {
    // Simplified PIX copy-paste code
    return `00020126580014BR.GOV.BCB.PIX0136${pixKey}5204000053039865404${totalPrice.toFixed(2)}5802BR5925GEEC Evangelho de Cristo6009OURO PRET62070503***6304`;
  };

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
    } else {
      toast({
        title: 'Empréstimos solicitados!',
        description: 'Aguarde a confirmação do administrador.',
      });
      clearCart();
    }
  };

  if (items.length === 0) {
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
      <div className="container py-8">
        <h1 className="text-3xl font-serif font-bold mb-8 flex items-center gap-3">
          <ShoppingCart className="text-primary" />
          Carrinho
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan items */}
            {loanItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookMarked className="text-primary" size={20} />
                    Empréstimos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loanItems.map(item => (
                    <div key={item.book.id} className="flex gap-4">
                      <img
                        src={item.book.coverUrl || '/placeholder.svg'}
                        alt={item.book.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.book.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.book.author}</p>
                        <Badge variant="secondary" className="mt-2">
                          Gratuito - 30 dias
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.book.id)}
                      >
                        <Trash2 size={18} className="text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Purchase items */}
            {purchaseItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="text-accent" size={20} />
                    Compras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {purchaseItems.map(item => {
                    const price = item.book.salePrice || 0;
                    const discount = item.book.discount || 0;
                    const finalPrice = price * (1 - discount / 100);

                    return (
                      <div key={item.book.id} className="flex gap-4">
                        <img
                          src={item.book.coverUrl || '/placeholder.svg'}
                          alt={item.book.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.book.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.book.author}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-primary">
                              R$ {finalPrice.toFixed(2)}
                            </span>
                            {discount > 0 && (
                              <span className="text-sm text-muted-foreground line-through">
                                R$ {price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.book.id)}
                        >
                          <Trash2 size={18} className="text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loanItems.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Empréstimos ({loanItems.length})
                    </span>
                    <span className="font-medium">Grátis</span>
                  </div>
                )}
                {purchaseItems.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Compras ({purchaseItems.reduce((sum, i) => sum + i.quantity, 0)})
                    </span>
                    <span className="font-medium">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
                </div>

                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  {purchaseItems.length > 0 ? 'Finalizar Compra' : 'Solicitar Empréstimos'}
                </Button>
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
