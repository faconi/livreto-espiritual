import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { User, Camera, Loader2, Save, Chrome, Facebook, Building2, ClipboardList, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
const profileSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  socialName: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Mock: In real app, this would come from auth provider
const getAuthProvider = (email: string | undefined) => {
  if (!email) return null;
  if (email.includes('gmail') || email.includes('google')) return 'google';
  if (email.includes('facebook')) return 'facebook';
  if (email.includes('microsoft') || email.includes('outlook') || email.includes('hotmail')) return 'microsoft';
  return 'email';
};

const authProviderConfig = {
  google: { label: 'Google', icon: Chrome, color: 'text-red-500' },
  facebook: { label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  microsoft: { label: 'Microsoft', icon: Building2, color: 'text-blue-500' },
  email: { label: 'Email e Senha', icon: User, color: 'text-muted-foreground' },
};

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      socialName: user?.socialName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      cpf: user?.cpf || '',
      address: user?.address || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  if (!user) {
    return null;
  }

  const authProvider = getAuthProvider(user.email);
  const providerConfig = authProvider ? authProviderConfig[authProvider] : null;

  return (
    <MainLayout>
      <div className="container py-4 sm:py-8 px-3 sm:px-4 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
          <User className="text-primary" size={24} />
          Meu Perfil
        </h1>

        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link to="/minhas-atividades">
                    <Activity size={16} className="mr-2" />
                    Minhas Atividades
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/minhas-atividades">
                    <ClipboardList size={16} className="mr-2" />
                    Minhas Pendências
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Auth Provider Card */}
          {providerConfig && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conta de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${providerConfig.color}`}>
                    <providerConfig.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{providerConfig.label}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Conectado
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Avatar section */}
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="relative">
                  <Avatar className="h-16 w-16 sm:h-24 sm:w-24">
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    <AvatarFallback className="text-xl sm:text-2xl bg-primary text-primary-foreground">
                      {user.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                  >
                    <Camera size={12} className="sm:w-[14px] sm:h-[14px]" />
                  </Button>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">{user.fullName}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Social</FormLabel>
                          <FormControl>
                            <Input placeholder="Opcional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} disabled={authProvider !== 'email'} />
                        </FormControl>
                        {authProvider !== 'email' && (
                          <p className="text-xs text-muted-foreground">
                            Email gerenciado pela sua conta {providerConfig?.label}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Opcional"
                              {...field}
                              onChange={(e) => field.onChange(formatCpf(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Opcional - para entregas de livros"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
