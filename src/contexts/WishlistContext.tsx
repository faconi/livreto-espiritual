import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/services/database';

interface WishlistContextType {
  wishlist: string[];
  isLoading: boolean;
  isInWishlist: (bookId: string) => boolean;
  toggleWishlist: (bookId: string, bookTitle?: string) => void;
  addToWishlist: (bookId: string, bookTitle?: string) => void;
  removeFromWishlist: (bookId: string, bookTitle?: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const items = await db.getWishlist(user.id);
      return items.map(item => item.book_id);
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async ({ bookId }: { bookId: string; bookTitle?: string }) => {
      if (!user) throw new Error('User not authenticated');
      await db.addToWishlist(user.id, bookId);
    },
    onSuccess: (_, { bookTitle }) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: 'Adicionado aos favoritos',
        description: bookTitle ? `"${bookTitle}" foi adicionado à sua lista.` : 'Livro adicionado à sua lista de desejos.',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async ({ bookId }: { bookId: string; bookTitle?: string }) => {
      if (!user) throw new Error('User not authenticated');
      await db.removeFromWishlist(user.id, bookId);
    },
    onSuccess: (_, { bookTitle }) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: 'Removido dos favoritos',
        description: bookTitle ? `"${bookTitle}" foi removido da sua lista.` : 'Livro removido da sua lista de desejos.',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const isInWishlist = useCallback((bookId: string) => wishlistItems.includes(bookId), [wishlistItems]);

  const toggleWishlist = useCallback((bookId: string, bookTitle?: string) => {
    if (!user) {
      toast({ title: 'Faça login para adicionar aos favoritos', variant: 'destructive' });
      return;
    }
    
    if (isInWishlist(bookId)) {
      removeMutation.mutate({ bookId, bookTitle });
    } else {
      addMutation.mutate({ bookId, bookTitle });
    }
  }, [user, isInWishlist, addMutation, removeMutation, toast]);

  const addToWishlist = useCallback((bookId: string, bookTitle?: string) => {
    if (!user) {
      toast({ title: 'Faça login para adicionar aos favoritos', variant: 'destructive' });
      return;
    }
    if (!isInWishlist(bookId)) {
      addMutation.mutate({ bookId, bookTitle });
    }
  }, [user, isInWishlist, addMutation, toast]);

  const removeFromWishlist = useCallback((bookId: string, bookTitle?: string) => {
    if (!user) return;
    if (isInWishlist(bookId)) {
      removeMutation.mutate({ bookId, bookTitle });
    }
  }, [user, isInWishlist, removeMutation]);

  return (
    <WishlistContext.Provider value={{ 
      wishlist: wishlistItems, 
      isLoading,
      isInWishlist, 
      toggleWishlist, 
      addToWishlist, 
      removeFromWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
