import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

export interface BusinessRules {
  maxLoanDays: number;
  maxSimultaneousLoans: number;
  maxRenewals: number;
  daysBeforeDueWarning: number;
}

export interface AppIdentity {
  appName: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface PaymentSettings {
  pixKey: string;
}

export interface ApiEndpoints {
  backendUrl?: string;
  isbnSearchUrl?: string;
  requestTimeout: number;
}

export function useSystemSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const dbSettings = await db.getSettings();
      const result: Record<string, unknown> = {};
      dbSettings.forEach(s => {
        result[s.key] = s.value;
      });
      return result;
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, unknown> }) => {
      await db.updateSetting(key, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({ title: 'Configuração atualizada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar configuração', description: error.message, variant: 'destructive' });
    },
  });

  const businessRules: BusinessRules = (settings?.business_rules as BusinessRules) || {
    maxLoanDays: 15,
    maxSimultaneousLoans: 3,
    maxRenewals: 2,
    daysBeforeDueWarning: 3,
  };

  const appIdentity: AppIdentity = (settings?.app_identity as AppIdentity) || {
    appName: 'Livraria Espírita',
  };

  const themeColors: ThemeColors = (settings?.theme_colors as ThemeColors) || {
    primary: '262 83% 58%',
    secondary: '220 14.3% 95.9%',
    accent: '262 83% 58%',
  };

  const paymentSettings: PaymentSettings = (settings?.payment as PaymentSettings) || {
    pixKey: 'Pix@EvangelhoDeCristoOP.com.br',
  };

  const apiEndpoints: ApiEndpoints = (settings?.api_endpoints as ApiEndpoints) || {
    requestTimeout: 30000,
  };

  return {
    settings,
    isLoading,
    businessRules,
    appIdentity,
    themeColors,
    paymentSettings,
    apiEndpoints,
    updateSetting,
  };
}
