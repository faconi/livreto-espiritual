export interface SystemSettings {
  // Identity
  appName: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
  };

  // SSO Integrations
  sso: {
    google: {
      enabled: boolean;
      clientId?: string;
      clientSecret?: string;
    };
    facebook: {
      enabled: boolean;
      appId?: string;
      appSecret?: string;
    };
    microsoft: {
      enabled: boolean;
      clientId?: string;
      tenantId?: string;
      clientSecret?: string;
    };
  };

  // External APIs
  apis: {
    isbnSearchUrl?: string;
    pixKey?: string;
    backendUrl?: string;
    requestTimeout: number;
  };

  // Business Rules
  businessRules: {
    maxLoanDays: number;
    maxSimultaneousLoans: number;
    maxRenewals: number;
    daysBeforeDueWarning: number;
  };

  // Database
  database: {
    host?: string;
    port: number;
    user?: string;
    password?: string;
    database?: string;
  };
}

export const defaultSettings: SystemSettings = {
  appName: 'Livraria Espírita',
  themeColors: {
    primary: '262 83% 58%',
    secondary: '220 14.3% 95.9%',
    accent: '262 83% 58%',
  },
  sso: {
    google: { enabled: false },
    facebook: { enabled: false },
    microsoft: { enabled: false },
  },
  apis: {
    requestTimeout: 30000,
  },
  businessRules: {
    maxLoanDays: 15,
    maxSimultaneousLoans: 3,
    maxRenewals: 2,
    daysBeforeDueWarning: 3,
  },
  database: {
    port: 3306,
  },
};
