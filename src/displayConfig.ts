import type { DisplayConfig } from './types';

export const DEFAULT_CONFIG: DisplayConfig = {
  defaultDurationMinutes: 10,
  pages: [
    {
      id: 'crm-mission',
      label: 'CRM Mission Display',
      url: 'https://example.com/crm',
      enabled: true,
    },
    {
      id: 'other-app-home',
      label: 'Other App Home',
      url: 'https://example.com/app',
      enabled: true,
    },
  ],
};
