import { appConfig } from '@config/app.config';

jest.mock('@config/env', () => ({
  env: {
    appName: 'Test App',
    apiUrl: 'http://localhost/api',
    aiStreaming: true,
    enableLogger: false,
    isDev: false,
    isProd: true,
  },
}));

describe('appConfig', () => {
  it('derives values from env', () => {
    expect(appConfig.name).toBe('Test App');
    expect(appConfig.apiUrl).toBe('http://localhost/api');
    expect(appConfig.aiStreaming).toBe(true);
  });

  it('exposes pagination defaults', () => {
    expect(appConfig.pagination.defaultPageSize).toBe(20);
    expect(appConfig.pagination.pageSizeOptions).toEqual([10, 20, 50, 100]);
  });

  it('exposes the request timeout', () => {
    expect(appConfig.request.timeoutMs).toBe(30_000);
  });
});
