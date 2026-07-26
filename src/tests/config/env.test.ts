describe('env', () => {
  const originalImportMeta = globalThis.__IMPORT_META__;

  afterEach(() => {
    globalThis.__IMPORT_META__ = originalImportMeta;
    jest.resetModules();
  });

  it('falls back to defaults when no VITE_* variables are set', async () => {
    globalThis.__IMPORT_META__ = { env: { DEV: true, PROD: false, MODE: 'test' } };
    jest.resetModules();

    const { env } = await import('@config/env');

    expect(env.apiUrl).toBe('http://localhost:8000/api');
    expect(env.appName).toBe('Axiora Pulse');
    expect(env.enableLogger).toBe(true); // falls back to env.DEV
    expect(env.aiStreaming).toBe(true);
    expect(env.isDev).toBe(true);
    expect(env.isProd).toBe(false);
  });

  it('reads and coerces explicit VITE_* variables', async () => {
    globalThis.__IMPORT_META__ = {
      env: {
        DEV: false,
        PROD: true,
        MODE: 'production',
        VITE_API_URL: 'https://api.axiora.test',
        VITE_APP_NAME: 'Axiora Test',
        VITE_ENABLE_LOGGER: 'true',
        VITE_AI_STREAMING: '0',
      },
    };
    jest.resetModules();

    const { env } = await import('@config/env');

    expect(env.apiUrl).toBe('https://api.axiora.test');
    expect(env.appName).toBe('Axiora Test');
    expect(env.enableLogger).toBe(true);
    expect(env.aiStreaming).toBe(false);
    expect(env.isDev).toBe(false);
    expect(env.isProd).toBe(true);
  });

  it('accepts "1" as a truthy boolean flag', async () => {
    globalThis.__IMPORT_META__ = {
      env: { DEV: false, PROD: false, MODE: 'test', VITE_ENABLE_LOGGER: '1' },
    };
    jest.resetModules();

    const { env } = await import('@config/env');

    expect(env.enableLogger).toBe(true);
  });
});
