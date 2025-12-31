/// <reference types="node" />
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers as any);

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});

// Mock crypto.randomUUID for testing environments
if (!globalThis.crypto) {
    (globalThis as any).crypto = {
        randomUUID: () => Math.random().toString(36).substring(2, 15)
    };
} else if (!globalThis.crypto.randomUUID) {
    (globalThis.crypto as any).randomUUID = () => Math.random().toString(36).substring(2, 15);
}
