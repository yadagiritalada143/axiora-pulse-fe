import { env } from '@config/env';
import { logger } from '@utils/logger';

jest.mock('@config/env', () => ({
  env: { enableLogger: true },
}));

describe('logger', () => {
  const spies = {
    info: jest.spyOn(console, 'info').mockImplementation(() => undefined),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => undefined),
    error: jest.spyOn(console, 'error').mockImplementation(() => undefined),
    debug: jest.spyOn(console, 'debug').mockImplementation(() => undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    env.enableLogger = true;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('writes each level with a prefix when logging is enabled', () => {
    logger.info('hello');
    logger.warn('careful');
    logger.error('boom');
    logger.debug('trace');

    expect(spies.info).toHaveBeenCalledWith('[INFO]', 'hello');
    expect(spies.warn).toHaveBeenCalledWith('[WARN]', 'careful');
    expect(spies.error).toHaveBeenCalledWith('[ERROR]', 'boom');
    expect(spies.debug).toHaveBeenCalledWith('[DEBUG]', 'trace');
  });

  it('is a no-op when logging is disabled', () => {
    env.enableLogger = false;

    logger.info('hidden');

    expect(spies.info).not.toHaveBeenCalled();
  });
});
