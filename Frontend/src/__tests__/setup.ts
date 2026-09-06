import '@testing-library/jest-dom';

// Polyfill window.scrollTo if not present in jsdom
if (typeof window !== 'undefined' && typeof window.scrollTo !== 'function') {
  window.scrollTo = () => {};
}

// Polyfill Element.prototype.scrollIntoView if not present in jsdom
if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {};
}