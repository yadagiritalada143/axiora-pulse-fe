import { TextDecoder, TextEncoder } from 'util';

import '@testing-library/jest-dom';

// jsdom doesn't provide these globals, but react-router-dom expects them.
Object.assign(globalThis, { TextEncoder, TextDecoder });
