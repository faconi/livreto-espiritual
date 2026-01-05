import { useState } from 'react';
import { Settings, Palette, Key, Globe, Briefcase, Database, Loader2, Check } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { defaultSettings, SystemSettings } from '@/types/settings';

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Configurações salvas',
      description: 'As alterações foram aplicadas com sucesso.',
    });
    setIsSaving(false);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast({
      title: 'Conexão bem-sucedida',
      description: 'O banco de dados MySQL está acessível.',
    });
    setTestingConnection(false);
  };

  const updateSettings = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <MainLayout showFooter={false}>
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="text-primary" size={28} />
          <div>
            <h1 className="text-3xl font-serif font-bold">Configurações do Sistema</h1>
            <p className="text-muted-foreground">Gerencie as configurações da aplicação</p>
          </div>
        </div>

        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="identity" className="text-xs sm:text-sm">
              <Palette size={16} className="mr-1 hidden sm:inline" />
              Identidade
            </TabsTrigger>
            <TabsTrigger value="sso" className="text-xs sm:text-sm">
              <Key size={16} className="mr-1 hidden sm:inline" />
              SSO
            </TabsTrigger>
            <TabsTrigger value="apis" className="text-xs sm:text-sm">
              <Globe size={16} className="mr-1 hidden sm:inline" />
              APIs
            </TabsTrigger>
            <TabsTrigger value="business" className="text-xs sm:text-sm">
              <Briefcase size={16} className="mr-1 hidden sm:inline" />
              Regras
            </TabsTrigger>
            <TabsTrigger value="database" className="text-xs sm:text-sm">
              <Database size={16} className="mr-1 hidden sm:inline" />
              Banco
            </TabsTrigger>
          </TabsList>

          {/* Identity Tab */}
          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>Personalize a aparência da aplicação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">Nome da Aplicação</Label>
                  <Input
                    id="appName"
                    value={settings.appName}
                    onChange={e => updateSettings('appName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL do Logo</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://..."
                    value={settings.logoUrl || ''}
                    onChange={e => updateSettings('logoUrl', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">URL do Favicon</Label>
                  <Input
                    id="faviconUrl"
                    placeholder="https://..."
                    value={settings.faviconUrl || ''}
                    onChange={e => updateSettings('faviconUrl', e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Cor Primária (HSL)</Label>
                    <Input
                      id="primaryColor"
                      value={settings.themeColors.primary}
                      onChange={e => updateSettings('themeColors', {
                        ...settings.themeColors,
                        primary: e.target.value,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Cor Secundária (HSL)</Label>
                    <Input
                      id="secondaryColor"
                      value={settings.themeColors.secondary}
                      onChange={e => updateSettings('themeColors', {
                        ...settings.themeColors,
                        secondary: e.target.value,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Cor de Destaque (HSL)</Label>
                    <Input
                      id="accentColor"
                      value={settings.themeColors.accent}
                      onChange={e => updateSettings('themeColors', {
                        ...settings.themeColors,
                        accent: e.target.value,
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SSO Tab */}
          <TabsContent value="sso">
            <Card>
              <CardHeader>
                <CardTitle>Integrações SSO</CardTitle>
                <CardDescription>Configure autenticação com provedores externos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google */}
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Google OAuth</Label>
                    <Switch
                      checked={settings.sso.google.enabled}
                      onCheckedChange={checked => updateSettings('sso', {
                        ...settings.sso,
                        google: { ...settings.sso.google, enabled: checked },
                      })}
                    />
                  </div>
                  {settings.sso.google.enabled && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Client ID</Label>
                        <Input
                          value={settings.sso.google.clientId || ''}
                          onChange={e => updateSettings('sso', {
                            ...settings.sso,
                            google: { ...settings.sso.google, clientId: e.target.value },
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Client Secret</Label>
                        <Input
                          type="password"
                          value={settings.sso.google.clientSecret || ''}
                          onChange={e => updateSettings('sso', {
                            ...settings.sso,
                            google: { ...settings.sso.google, clientSecret: e.target.value },
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Facebook */}
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Facebook Login</Label>
                    <Switch
                      checked={settings.sso.facebook.enabled}
                      onCheckedChange={checked => updateSettings('sso', {
                        ...settings.sso,
                        facebook: { ...settings.sso.facebook, enabled: checked },
                      })}
                    />
                  </div>
                  {settings.sso.facebook.enabled && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>App ID</Label>
                        <Input
                          value={settings.sso.facebook.appId || ''}
                          onChange={e => updateSettings('sso', {
                            ...settings.sso,
                            facebook: { ...settings.sso.facebook, appId: e.target.value },
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>App Secret</Label>
                        <Input
                          type="password"
                          value={settings.sso.facebook.appSecret || ''}
                          onChange={e => updateSettings('sso', {
                            ...settings.sso,
                            facebook: { ...settings.sso.facebook, appSecret: e.target.value },
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Microsoft */}
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Microsoft Azure AD</Label>
                    <Switch
                      checked={settings.sso.microsoft.enabled}
                      onCheckedChange={checked => updateSettings('sso', {
                        ...settings.sso,
                        microsoft: { ...settings.sso.microsoft, enabled: checked },
                      })}
                    />
                  </div>
                  {settings.sso.microsoft.enabled && (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Client ID</Label>
                        <Input
                          value={settings.sso.microsoft.clientId || ''}
                          onChange={e => updateSettings('sso', {
                            ...settings.sso,
                            microsoft: { ...settings.sso.microsoft, clientId: e.target.value },
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tenant ID</Label>
                        <Input
                          value={settings.sso.microsoft.tenantId || ''}
                          onChange={e => updateSettings('sso', {
                            ...settings.sso,
                            microsoft: { ...settings.sso.microsoft, tenantId: e.target.value },
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Client Secret</Label>
                        <Input
                          type="password"
                          value={settings.sso.microsoft.clientSecret || ''}
                          onChange={e => updateSettings('sso', {
                            ...settings.sso,
                            microsoft: { ...settings.sso.microsoft, clientSecret: e.target.value },
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APIs Tab */}
          <TabsContent value="apis">
            <Card>
              <CardHeader>
                <CardTitle>APIs Externas</CardTitle>
                <CardDescription>Configure conexões com serviços externos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="isbnUrl">URL da API de Busca ISBN</Label>
                  <Input
                    id="isbnUrl"
                    placeholder="https://api.isbn.com.br/..."
                    value={settings.apis.isbnSearchUrl || ''}
                    onChange={e => updateSettings('apis', {
                      ...settings.apis,
                      isbnSearchUrl: e.target.value,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input
                    id="pixKey"
                    placeholder="email@exemplo.com ou CPF/CNPJ"
                    value={settings.apis.pixKey || ''}
                    onChange={e => updateSettings('apis', {
                      ...settings.apis,
                      pixKey: e.target.value,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backendUrl">URL do Backend PHP</Label>
                  <Input
                    id="backendUrl"
                    placeholder="https://api.minhabiblioteca.com.br"
                    value={settings.apis.backendUrl || ''}
                    onChange={e => updateSettings('apis', {
                      ...settings.apis,
                      backendUrl: e.target.value,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout de Requisições (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={settings.apis.requestTimeout}
                    onChange={e => updateSettings('apis', {
                      ...settings.apis,
                      requestTimeout: parseInt(e.target.value) || 30000,
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Rules Tab */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Regras de Negócio</CardTitle>
                <CardDescription>Configure as regras de empréstimo e vendas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxLoanDays">Tempo Máximo de Empréstimo (dias)</Label>
                    <Input
                      id="maxLoanDays"
                      type="number"
                      min="1"
                      value={settings.businessRules.maxLoanDays}
                      onChange={e => updateSettings('businessRules', {
                        ...settings.businessRules,
                        maxLoanDays: parseInt(e.target.value) || 15,
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoans">Limite de Livros Simultâneos</Label>
                    <Input
                      id="maxLoans"
                      type="number"
                      min="1"
                      value={settings.businessRules.maxSimultaneousLoans}
                      onChange={e => updateSettings('businessRules', {
                        ...settings.businessRules,
                        maxSimultaneousLoans: parseInt(e.target.value) || 3,
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxRenewals">Limite de Renovações por Empréstimo</Label>
                    <Input
                      id="maxRenewals"
                      type="number"
                      min="0"
                      value={settings.businessRules.maxRenewals}
                      onChange={e => updateSettings('businessRules', {
                        ...settings.businessRules,
                        maxRenewals: parseInt(e.target.value) || 2,
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daysWarning">Dias de Aviso Antes do Vencimento</Label>
                    <Input
                      id="daysWarning"
                      type="number"
                      min="1"
                      value={settings.businessRules.daysBeforeDueWarning}
                      onChange={e => updateSettings('businessRules', {
                        ...settings.businessRules,
                        daysBeforeDueWarning: parseInt(e.target.value) || 3,
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Banco de Dados MySQL</CardTitle>
                <CardDescription>Configure a conexão com o banco de dados externo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbHost">Host</Label>
                    <Input
                      id="dbHost"
                      placeholder="localhost ou IP do servidor"
                      value={settings.database.host || ''}
                      onChange={e => updateSettings('database', {
                        ...settings.database,
                        host: e.target.value,
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dbPort">Porta</Label>
                    <Input
                      id="dbPort"
                      type="number"
                      value={settings.database.port}
                      onChange={e => updateSettings('database', {
                        ...settings.database,
                        port: parseInt(e.target.value) || 3306,
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dbUser">Usuário</Label>
                    <Input
                      id="dbUser"
                      value={settings.database.user || ''}
                      onChange={e => updateSettings('database', {
                        ...settings.database,
                        user: e.target.value,
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dbPassword">Senha</Label>
                    <Input
                      id="dbPassword"
                      type="password"
                      value={settings.database.password || ''}
                      onChange={e => updateSettings('database', {
                        ...settings.database,
                        password: e.target.value,
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dbName">Nome do Banco</Label>
                  <Input
                    id="dbName"
                    placeholder="livraria_espirita"
                    value={settings.database.database || ''}
                    onChange={e => updateSettings('database', {
                      ...settings.database,
                      database: e.target.value,
                    })}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="mr-2 h-4 w-4" />
                  )}
                  Testar Conexão
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
