import { authEvents } from '@services/api/authEvents';

describe('authEvents', () => {
  it('invokes subscribed handlers on emit', () => {
    const handler = jest.fn();
    const unsubscribe = authEvents.on('session-expired', handler);

    authEvents.emit('session-expired');
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('stops invoking a handler after it unsubscribes', () => {
    const handler = jest.fn();
    const unsubscribe = authEvents.on('session-expired', handler);

    unsubscribe();
    authEvents.emit('session-expired');

    expect(handler).not.toHaveBeenCalled();
  });
});
