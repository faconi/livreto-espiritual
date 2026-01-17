import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { BookDraft } from '@/types';

const STORAGE_KEY = 'biblioluz_book_drafts';

interface BookDraftsContextType {
  drafts: BookDraft[];
  addDrafts: (codes: string[]) => void;
  updateDraft: (id: string, updates: Partial<BookDraft>) => void;
  removeDraft: (id: string) => void;
  removeDrafts: (ids: string[]) => void;
  clearDrafts: () => void;
}

const BookDraftsContext = createContext<BookDraftsContextType | undefined>(undefined);

export function BookDraftsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useLocalStorage<BookDraft[]>(STORAGE_KEY, []);

  const addDrafts = useCallback((codes: string[]) => {
    const newDrafts: BookDraft[] = codes.map((code, index) => ({
      id: `draft-${Date.now()}-${index}`,
      isbn: code,
      barcode: code,
      status: 'pending' as const,
      createdAt: new Date(),
    }));
    
    setDrafts(prev => [...prev, ...newDrafts]);
  }, [setDrafts]);

  const updateDraft = useCallback((id: string, updates: Partial<BookDraft>) => {
    setDrafts(prev => prev.map(d => 
      d.id === id ? { ...d, ...updates } : d
    ));
  }, [setDrafts]);

  const removeDraft = useCallback((id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  }, [setDrafts]);

  const removeDrafts = useCallback((ids: string[]) => {
    setDrafts(prev => prev.filter(d => !ids.includes(d.id)));
  }, [setDrafts]);

  const clearDrafts = useCallback(() => {
    setDrafts([]);
  }, [setDrafts]);

  return (
    <BookDraftsContext.Provider value={{
      drafts,
      addDrafts,
      updateDraft,
      removeDraft,
      removeDrafts,
      clearDrafts,
    }}>
      {children}
    </BookDraftsContext.Provider>
  );
}

export function useBookDrafts() {
  const context = useContext(BookDraftsContext);
  if (!context) {
    throw new Error('useBookDrafts must be used within a BookDraftsProvider');
  }
  return context;
}
