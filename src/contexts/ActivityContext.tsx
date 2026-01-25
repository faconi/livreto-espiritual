import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { Activity as ActivityType } from '@/types';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, mapDbActivityToActivity } from '@/services/database';

interface ActivityContextType {
  activities: ActivityType[];
  isLoading: boolean;
  addActivity: (activity: Omit<ActivityType, 'id' | 'createdAt'>) => void;
  clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const dbActivities = await db.getActivities(user.id);
      return dbActivities.map(mapDbActivityToActivity);
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (activity: Omit<ActivityType, 'id' | 'createdAt'>) => {
      if (!user) throw new Error('User not authenticated');
      await db.createActivity({
        user_id: user.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        item_id: activity.itemId || null,
        item_title: activity.itemTitle || null,
        metadata: activity.metadata as Record<string, unknown> || null,
        action_url: activity.actionUrl || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const addActivity = useCallback((activity: Omit<ActivityType, 'id' | 'createdAt'>) => {
    if (!user) return;
    createMutation.mutate(activity);
  }, [user, createMutation]);

  const clearActivities = useCallback(() => {
    // Not implemented for database - activities are permanent records
  }, []);

  return (
    <ActivityContext.Provider value={{ activities, isLoading, addActivity, clearActivities }}>
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
