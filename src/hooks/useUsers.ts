import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, mapDbProfileToUser } from '@/services/database';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const [profiles, allRoles] = await Promise.all([
        db.getProfiles(),
        Promise.resolve([]), // We'll fetch roles per user as needed
      ]);
      
      // Map profiles to users with roles
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const roles = await db.getUserRoles(profile.id);
          return mapDbProfileToUser(profile, roles);
        })
      );
      
      return usersWithRoles;
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<User> }) => {
      await db.updateProfile(id, {
        full_name: updates.fullName,
        social_name: updates.socialName || null,
        phone: updates.phone || null,
        cpf: updates.cpf || null,
        avatar_url: updates.avatarUrl || null,
        address: updates.address ? JSON.parse(updates.address) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Usuário atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar usuário', description: error.message, variant: 'destructive' });
    },
  });

  const setUserRole = useMutation({
    mutationFn: async ({ userId, role, action }: { userId: string; role: 'admin' | 'user'; action: 'add' | 'remove' }) => {
      if (action === 'add') {
        await db.addUserRole(userId, role);
      } else {
        await db.removeUserRole(userId, role);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Perfil atualizado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar perfil', description: error.message, variant: 'destructive' });
    },
  });

  return {
    users,
    isLoading,
    error,
    updateUser,
    setUserRole,
  };
}
