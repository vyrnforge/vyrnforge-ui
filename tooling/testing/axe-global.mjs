import axeCore from 'axe-core';

// Transitional compatibility for browser specs migrated from direct axe injection.
// New and touched tests should use @axe-core/playwright directly.
globalThis.axeCore = axeCore;
