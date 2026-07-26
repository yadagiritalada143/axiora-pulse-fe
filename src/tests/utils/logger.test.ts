jest.mock('@config/env', () => ({
  env: { enableLogger: true },
}));

describe('logger', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('writes to the matching console method with a level prefix when logging is enabled', async () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation();
    const { logger } = await import('@utils/logger');

    logger.info('hello', { extra: true });

    expect(infoSpy).toHaveBeenCalledWith('[INFO]', 'hello', { extra: true });
  });

  it('routes warn/error/debug to their respective console methods', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation();
    const { logger } = await import('@utils/logger');

    logger.warn('warn msg');
    logger.error('error msg');
    logger.debug('debug msg');

    expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'warn msg');
    expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'error msg');
    expect(debugSpy).toHaveBeenCalledWith('[DEBUG]', 'debug msg');
  });

  it('does not write to the console when logging is disabled', async () => {
    jest.resetModules();
    jest.doMock('@config/env', () => ({ env: { enableLogger: false } }));
    const infoSpy = jest.spyOn(console, 'info').mockImplementation();
    const { logger } = await import('@utils/logger');

    logger.info('should not log');

    expect(infoSpy).not.toHaveBeenCalled();
  });
});
