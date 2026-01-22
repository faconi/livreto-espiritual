import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { BookReview } from '@/types';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'biblioluz_reviews';

interface ReviewContextType {
  reviews: BookReview[];
  getBookReviews: (bookId: string) => BookReview[];
  getBookAverageRating: (bookId: string) => { average: number; count: number };
  getUserReview: (bookId: string, userId: string) => BookReview | undefined;
  addReview: (review: Omit<BookReview, 'id' | 'createdAt'>) => void;
  updateReview: (reviewId: string, updates: Partial<Pick<BookReview, 'rating' | 'comment'>>) => void;
  deleteReview: (reviewId: string) => void;
  markHelpful: (reviewId: string) => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

// Mock initial reviews
const defaultReviews: BookReview[] = [
  {
    id: 'r1',
    bookId: '1',
    userId: '3',
    userName: 'Maria Santos',
    rating: 5,
    comment: 'Obra fundamental para quem deseja compreender a Doutrina Espírita. A leitura é clara e as explicações são profundas. Recomendo a todos!',
    createdAt: new Date('2024-01-15'),
    helpful: 12,
  },
  {
    id: 'r2',
    bookId: '1',
    userId: '4',
    userName: 'Pedro Lima',
    rating: 5,
    comment: 'Um clássico atemporal. A forma como as perguntas são respondidas pelos Espíritos traz luz sobre questões essenciais da vida.',
    createdAt: new Date('2024-01-10'),
    helpful: 8,
  },
  {
    id: 'r3',
    bookId: '3',
    userId: '2',
    userName: 'João Silva',
    rating: 4,
    comment: 'Livro emocionante que nos faz refletir sobre a vida após a morte. A narrativa é envolvente e as descrições da colônia espiritual são ricas em detalhes.',
    createdAt: new Date('2024-01-08'),
    helpful: 5,
  },
  {
    id: 'r4',
    bookId: '2',
    userId: '3',
    userName: 'Maria Santos',
    rating: 5,
    comment: 'Os ensinamentos morais contidos nesta obra são transformadores. Leitura obrigatória para o estudo espírita.',
    createdAt: new Date('2024-01-05'),
    helpful: 15,
  },
  {
    id: 'r5',
    bookId: '5',
    userId: '4',
    userName: 'Pedro Lima',
    rating: 5,
    comment: 'Uma história linda e tocante. Chorei em várias partes. A Patrícia nos ensina sobre amor, perdão e continuidade da vida.',
    createdAt: new Date('2024-01-03'),
    helpful: 7,
  },
];

function loadReviews(): BookReview[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultReviews;
    
    const parsed = JSON.parse(stored);
    return parsed.map((review: Record<string, unknown>) => ({
      ...review,
      createdAt: new Date(review.createdAt as string),
      updatedAt: review.updatedAt ? new Date(review.updatedAt as string) : undefined,
    }));
  } catch {
    return defaultReviews;
  }
}

function saveReviews(reviews: BookReview[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (error) {
    console.warn('Error saving reviews to localStorage:', error);
  }
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<BookReview[]>(() => loadReviews());
  const { toast } = useToast();

  // Persist reviews when they change
  useEffect(() => {
    saveReviews(reviews);
  }, [reviews]);

  const getBookReviews = useCallback((bookId: string): BookReview[] => {
    return reviews
      .filter(r => r.bookId === bookId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews]);

  const getBookAverageRating = useCallback((bookId: string): { average: number; count: number } => {
    const bookReviews = reviews.filter(r => r.bookId === bookId);
    if (bookReviews.length === 0) return { average: 0, count: 0 };
    
    const sum = bookReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: sum / bookReviews.length,
      count: bookReviews.length,
    };
  }, [reviews]);

  const getUserReview = useCallback((bookId: string, userId: string): BookReview | undefined => {
    return reviews.find(r => r.bookId === bookId && r.userId === userId);
  }, [reviews]);

  const addReview = useCallback((review: Omit<BookReview, 'id' | 'createdAt'>) => {
    const newReview: BookReview = {
      ...review,
      id: `review_${Date.now()}`,
      createdAt: new Date(),
      helpful: 0,
    };

    setReviews(prev => [newReview, ...prev]);

    toast({
      title: 'Avaliação publicada',
      description: 'Sua avaliação foi publicada com sucesso!',
    });
  }, [toast]);

  const updateReview = useCallback((reviewId: string, updates: Partial<Pick<BookReview, 'rating' | 'comment'>>) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId 
        ? { ...r, ...updates, updatedAt: new Date() }
        : r
    ));

    toast({
      title: 'Avaliação atualizada',
      description: 'Sua avaliação foi atualizada com sucesso!',
    });
  }, [toast]);

  const deleteReview = useCallback((reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));

    toast({
      title: 'Avaliação removida',
      description: 'Sua avaliação foi removida.',
    });
  }, [toast]);

  const markHelpful = useCallback((reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId 
        ? { ...r, helpful: (r.helpful || 0) + 1 }
        : r
    ));
  }, []);

  const value = useMemo(() => ({
    reviews,
    getBookReviews,
    getBookAverageRating,
    getUserReview,
    addReview,
    updateReview,
    deleteReview,
    markHelpful,
  }), [reviews, getBookReviews, getBookAverageRating, getUserReview, addReview, updateReview, deleteReview, markHelpful]);

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
}
