import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlist: string[];
  isInWishlist: (bookId: string) => boolean;
  toggleWishlist: (bookId: string, bookTitle?: string) => void;
  addToWishlist: (bookId: string, bookTitle?: string) => void;
  removeFromWishlist: (bookId: string, bookTitle?: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Initial mock data
const initialWishlist = ['4', '6', '8'];

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>(initialWishlist);
  const { toast } = useToast();

  const isInWishlist = (bookId: string) => wishlist.includes(bookId);

  const toggleWishlist = (bookId: string, bookTitle?: string) => {
    const wasInWishlist = wishlist.includes(bookId);
    
    setWishlist(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );

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
  };

  const addToWishlist = (bookId: string, bookTitle?: string) => {
    if (!wishlist.includes(bookId)) {
      setWishlist(prev => [...prev, bookId]);
      toast({
        title: 'Adicionado aos favoritos',
        description: bookTitle 
          ? `"${bookTitle}" foi adicionado à sua lista.`
          : 'Livro adicionado à sua lista de desejos.',
      });
    }
  };

  const removeFromWishlist = (bookId: string, bookTitle?: string) => {
    if (wishlist.includes(bookId)) {
      setWishlist(prev => prev.filter(id => id !== bookId));
      toast({
        title: 'Removido dos favoritos',
        description: bookTitle 
          ? `"${bookTitle}" foi removido da sua lista.`
          : 'Livro removido da sua lista de desejos.',
      });
    }
  };

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
