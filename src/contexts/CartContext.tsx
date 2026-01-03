import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Book, CartItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book, type: 'loan' | 'purchase') => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (book: Book, type: 'loan' | 'purchase') => {
    setItems(prev => {
      const existing = prev.find(item => item.book.id === book.id && item.type === type);
      
      if (existing) {
        toast({
          title: 'Item já no carrinho',
          description: 'Este livro já está no seu carrinho.',
        });
        return prev;
      }
      
      toast({
        title: 'Livro adicionado',
        description: `"${book.title}" foi adicionado ao carrinho.`,
      });
      
      return [...prev, { book, quantity: 1, type }];
    });
  };

  const removeFromCart = (bookId: string) => {
    setItems(prev => prev.filter(item => item.book.id !== bookId));
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(bookId);
      return;
    }
    
    setItems(prev =>
      prev.map(item => {
        if (item.book.id === bookId) {
          // Limit quantity to available stock
          const maxQuantity = item.book.availableForSale;
          const newQuantity = Math.min(quantity, maxQuantity);
          
          if (quantity > maxQuantity) {
            toast({
              title: 'Quantidade limitada',
              description: `Apenas ${maxQuantity} unidades disponíveis em estoque.`,
              variant: 'destructive',
            });
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items
    .filter(item => item.type === 'purchase')
    .reduce((sum, item) => {
      const price = item.book.salePrice || 0;
      const discount = item.book.discount || 0;
      const finalPrice = price * (1 - discount / 100);
      return sum + finalPrice * item.quantity;
    }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
