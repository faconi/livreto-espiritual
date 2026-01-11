import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Activity as ActivityType, ActivityType as ActivityTypeEnum } from '@/types';

interface ActivityContextType {
  activities: ActivityType[];
  addActivity: (activity: Omit<ActivityType, 'id' | 'createdAt'>) => void;
  clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Initial mock activities
const initialActivities: ActivityType[] = [
  {
    id: 'a1',
    userId: '2',
    type: 'loan_confirmed',
    title: 'Empréstimo confirmado',
    description: 'Você solicitou o empréstimo de "O Livro dos Espíritos"',
    itemId: '1',
    itemTitle: 'O Livro dos Espíritos',
    createdAt: new Date('2024-01-15T10:30:00'),
    actionUrl: '/meus-livros',
  },
  {
    id: 'a2',
    userId: '2',
    type: 'purchase',
    title: 'Compra realizada',
    description: 'Você comprou "O Evangelho Segundo o Espiritismo"',
    itemId: '2',
    itemTitle: 'O Evangelho Segundo o Espiritismo',
    createdAt: new Date('2024-01-10T14:20:00'),
    metadata: { total: 42 },
    actionUrl: '/meus-livros',
  },
];

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityType[]>(initialActivities);

  const addActivity = useCallback((activity: Omit<ActivityType, 'id' | 'createdAt'>) => {
    const newActivity: ActivityType = {
      ...activity,
      id: `activity_${Date.now()}`,
      createdAt: new Date(),
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  return (
    <ActivityContext.Provider value={{ activities, addActivity, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
