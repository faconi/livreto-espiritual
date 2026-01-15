import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface WishlistContextType {
  wishlist: string[];
  isInWishlist: (bookId: string) => boolean;
  toggleWishlist: (bookId: string, bookTitle?: string) => void;
  addToWishlist: (bookId: string, bookTitle?: string) => void;
  removeFromWishlist: (bookId: string, bookTitle?: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'biblioluz_wishlist';
const initialWishlist = ['4', '6', '8'];

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useLocalStorage<string[]>(STORAGE_KEY, initialWishlist);
  const { toast } = useToast();

  const isInWishlist = useCallback((bookId: string) => wishlist.includes(bookId), [wishlist]);

  const toggleWishlist = useCallback((bookId: string, bookTitle?: string) => {
    setWishlist(prev => {
      const wasInWishlist = prev.includes(bookId);
      const newWishlist = wasInWishlist 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId];
      
      // Show toast after determining action
      setTimeout(() => {
        toast({
          title: wasInWishlist ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
          description: bookTitle 
            ? (wasInWishlist 
                ? `"${bookTitle}" foi removido da sua lista.`
                : `"${bookTitle}" foi adicionado à sua lista.`)
            : (wasInWishlist 
                ? 'Livro removido da sua lista de desejos.'
                : 'Livro adicionado à sua lista de desejos.'),
        });
      }, 0);
      
      return newWishlist;
    });
  }, [setWishlist, toast]);

  const addToWishlist = useCallback((bookId: string, bookTitle?: string) => {
    if (!wishlist.includes(bookId)) {
      setWishlist(prev => [...prev, bookId]);
      toast({
        title: 'Adicionado aos favoritos',
        description: bookTitle 
          ? `"${bookTitle}" foi adicionado à sua lista.`
          : 'Livro adicionado à sua lista de desejos.',
      });
    }
  }, [wishlist, setWishlist, toast]);

  const removeFromWishlist = useCallback((bookId: string, bookTitle?: string) => {
    if (wishlist.includes(bookId)) {
      setWishlist(prev => prev.filter(id => id !== bookId));
      toast({
        title: 'Removido dos favoritos',
        description: bookTitle 
          ? `"${bookTitle}" foi removido da sua lista.`
          : 'Livro removido da sua lista de desejos.',
      });
    }
  }, [wishlist, setWishlist, toast]);

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
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
