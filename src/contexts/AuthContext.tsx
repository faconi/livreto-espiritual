import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@geec.com.br',
    password: 'admin123',
    fullName: 'Administrador GEEC',
    role: 'admin',
    phone: '31999999999',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'usuario@email.com',
    password: 'user123',
    fullName: 'João Silva',
    role: 'user',
    phone: '31988888888',
    createdAt: new Date(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('geec_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Email ou senha inválidos');
    }
    
    const { password: _, ...userData } = foundUser;
    setUser(userData);
    localStorage.setItem('geec_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock Google login
    const googleUser: User = {
      id: '3',
      email: 'google.user@gmail.com',
      fullName: 'Usuário Google',
      role: 'user',
      avatarUrl: 'https://ui-avatars.com/api/?name=Google+User&background=2E7D32&color=fff',
      createdAt: new Date(),
    };
    
    setUser(googleUser);
    localStorage.setItem('geec_user', JSON.stringify(googleUser));
    setIsLoading(false);
  };

  const register = async (data: Partial<User> & { password: string }) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email || '',
      fullName: data.fullName || '',
      socialName: data.socialName,
      phone: data.phone,
      cpf: data.cpf,
      address: data.address,
      role: 'user',
      createdAt: new Date(),
    };
    
    setUser(newUser);
    localStorage.setItem('geec_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('geec_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('geec_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
