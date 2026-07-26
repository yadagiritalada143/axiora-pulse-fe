jest.mock('@config/env', () => ({
  env: {
    apiUrl: 'https://api.example.com',
    appName: 'Test App',
    enableLogger: false,
    aiStreaming: false,
    isDev: false,
    isProd: true,
  },
}));

import { appConfig } from '@config/app.config';

describe('appConfig', () => {
  it('derives name, apiUrl and aiStreaming from env', () => {
    expect(appConfig.name).toBe('Test App');
    expect(appConfig.apiUrl).toBe('https://api.example.com');
    expect(appConfig.aiStreaming).toBe(false);
  });

  it('provides static pagination defaults', () => {
    expect(appConfig.pagination.defaultPageSize).toBe(20);
    expect(appConfig.pagination.pageSizeOptions).toEqual([10, 20, 50, 100]);
  });

  it('provides a static request timeout', () => {
    expect(appConfig.request.timeoutMs).toBe(30_000);
  });
});
