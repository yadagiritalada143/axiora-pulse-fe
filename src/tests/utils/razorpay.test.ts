import type { loadRazorpayCheckout as LoadRazorpayCheckout } from '@utils/razorpay';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

type LoadFn = typeof LoadRazorpayCheckout;

function loadFresh(): LoadFn {
  let fn!: LoadFn;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fn = require('@utils/razorpay').loadRazorpayCheckout;
  });
  return fn;
}

afterEach(() => {
  delete window.Razorpay;
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

describe('loadRazorpayCheckout', () => {
  it('resolves immediately when window.Razorpay already exists', async () => {
    const load = loadFresh();
    const FakeConstructor = jest.fn();
    window.Razorpay = FakeConstructor as never;

    const result = await load();
    expect(result).toBe(FakeConstructor);
  });

  it('injects the script and resolves once loaded', async () => {
    const load = loadFresh();
    const FakeConstructor = jest.fn();

    const promise = load();
    const script = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    expect(script).not.toBeNull();
    window.Razorpay = FakeConstructor as never;
    script?.dispatchEvent(new Event('load'));

    await expect(promise).resolves.toBe(FakeConstructor);
  });

  it('rejects when the script fails to load', async () => {
    const load = loadFresh();
    const promise = load();
    const script = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    script?.dispatchEvent(new Event('error'));
    await expect(promise).rejects.toThrow('Failed to load Razorpay Checkout.');
  });

  it('rejects when loaded without window.Razorpay', async () => {
    const load = loadFresh();
    const promise = load();
    const script = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    script?.dispatchEvent(new Event('load'));
    await expect(promise).rejects.toThrow('Razorpay Checkout failed to initialize.');
  });

  it('reuses an existing in-flight promise', async () => {
    const load = loadFresh();
    const p1 = load();
    const p2 = load();
    expect(p1).toBe(p2);
    const script = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    const FakeConstructor = jest.fn();
    window.Razorpay = FakeConstructor as never;
    script?.dispatchEvent(new Event('load'));
    await expect(p1).resolves.toBe(FakeConstructor);
  });
});
