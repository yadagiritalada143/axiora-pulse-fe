import { TextDecoder, TextEncoder } from 'util';

import '@testing-library/jest-dom';

// jsdom doesn't provide these globals, but react-router-dom expects them.
Object.assign(globalThis, { TextEncoder, TextDecoder });

// Jest transforms to CommonJS, which has no `import.meta`. babel.config.cjs rewrites every
// `import.meta` occurrence (only src/config/env.ts uses it) to `globalThis.__IMPORT_META__` -
// provide the Vite-shaped env object it expects so env.ts (and anything importing it) loads.
declare global {
  var __IMPORT_META__: { env: Record<string, string | boolean | undefined> };
}
globalThis.__IMPORT_META__ = {
  env: { DEV: false, PROD: false, MODE: 'test' },
};

// jsdom doesn't implement these, but Radix UI primitives (Select, Dropdown Menu, etc.)
// call them during pointer interaction - without stubs, userEvent.click() on Radix
// triggers/items throws "not a function" in every test that opens one.
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
