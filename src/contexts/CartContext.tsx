import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { Book, CartItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, mapDbBookToBook } from '@/services/database';

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (book: Book, type: 'loan' | 'purchase') => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartData = [], isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const items = await db.getCart(user.id);
      return items.map(item => ({
        id: item.id,
        book: mapDbBookToBook(item.books),
        quantity: item.quantity,
        type: item.type as 'loan' | 'purchase',
      }));
    },
    enabled: !!user,
  });

  const items: CartItem[] = cartData.map(item => ({
    book: item.book,
    quantity: item.quantity,
    type: item.type,
  }));

  const addMutation = useMutation({
    mutationFn: async ({ book, type }: { book: Book; type: 'loan' | 'purchase' }) => {
      if (!user) throw new Error('User not authenticated');
      await db.addToCart({
        user_id: user.id,
        book_id: book.id,
        quantity: 1,
        type,
      });
    },
    onSuccess: (_, { book }) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Livro adicionado',
        description: `"${book.title}" foi adicionado ao carrinho.`,
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await db.updateCartItem(itemId, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await db.removeFromCart(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      await db.clearCart(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const addToCart = useCallback((book: Book, type: 'loan' | 'purchase') => {
    if (!user) {
      toast({ title: 'Faça login para adicionar ao carrinho', variant: 'destructive' });
      return;
    }
    
    const existing = cartData.find(item => item.book.id === book.id && item.type === type);
    if (existing) {
      toast({
        title: 'Item já no carrinho',
        description: 'Este livro já está no seu carrinho.',
      });
      return;
    }
    
    addMutation.mutate({ book, type });
  }, [user, cartData, addMutation, toast]);

  const removeFromCart = useCallback((bookId: string) => {
    const item = cartData.find(i => i.book.id === bookId);
    if (item) {
      removeMutation.mutate(item.id);
    }
  }, [cartData, removeMutation]);

  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    const item = cartData.find(i => i.book.id === bookId);
    if (!item) return;
    
    if (quantity < 1) {
      removeMutation.mutate(item.id);
      return;
    }
    
    const maxQuantity = item.book.availableForSale;
    const newQuantity = Math.min(quantity, maxQuantity);
    
    if (quantity > maxQuantity) {
      toast({
        title: 'Quantidade limitada',
        description: `Apenas ${maxQuantity} unidades disponíveis em estoque.`,
        variant: 'destructive',
      });
    }
    
    updateMutation.mutate({ itemId: item.id, quantity: newQuantity });
  }, [cartData, updateMutation, removeMutation, toast]);

  const clearCart = useCallback(() => {
    if (user) {
      clearMutation.mutate();
    }
  }, [user, clearMutation]);

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
        isLoading,
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
