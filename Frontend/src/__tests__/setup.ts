import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Polyfill window.scrollTo if not present in jsdom
if (typeof window.scrollTo !== 'function') {
  window.scrollTo = () => {};
}

// Polyfill Element.prototype.scrollIntoView if not present in jsdom
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {};
}
