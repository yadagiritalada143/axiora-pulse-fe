import { authEvents } from '@services/api/authEvents';

describe('authEvents', () => {
  it('invokes every subscribed handler on emit', () => {
    const handlerA = jest.fn();
    const handlerB = jest.fn();

    const unsubscribeA = authEvents.on('session-expired', handlerA);
    const unsubscribeB = authEvents.on('session-expired', handlerB);

    authEvents.emit('session-expired');

    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).toHaveBeenCalledTimes(1);

    unsubscribeA();
    unsubscribeB();
  });

  it('stops notifying a handler once it unsubscribes', () => {
    const handler = jest.fn();

    const unsubscribe = authEvents.on('session-expired', handler);
    unsubscribe();

    authEvents.emit('session-expired');

    expect(handler).not.toHaveBeenCalled();
  });

  it('does nothing when there are no subscribers', () => {
    expect(() => authEvents.emit('session-expired')).not.toThrow();
  });

  it('only unsubscribes the handler tied to the returned callback', () => {
    const handlerA = jest.fn();
    const handlerB = jest.fn();

    const unsubscribeA = authEvents.on('session-expired', handlerA);
    const unsubscribeB = authEvents.on('session-expired', handlerB);

    unsubscribeA();
    authEvents.emit('session-expired');

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).toHaveBeenCalledTimes(1);

    unsubscribeB();
  });
});
