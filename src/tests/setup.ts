import { TextDecoder, TextEncoder } from 'util';

import '@testing-library/jest-dom';

Object.assign(globalThis, { TextEncoder, TextDecoder });

declare global {
  var __IMPORT_META__: { env: Record<string, string | boolean | undefined> };
}
globalThis.__IMPORT_META__ = {
  env: { DEV: false, PROD: false, MODE: 'test' },
};

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
