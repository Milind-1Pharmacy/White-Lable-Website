/**
 * @file vitest.setup.ts
 * @description Global test setup: registers jest-dom matchers (toBeInTheDocument,
 *  etc.) and stubs browser APIs the modules touch (matchMedia) so jsdom renders
 *  don't throw.
 * @author WhiteLabel Platform Team
 * @created 2026-06-24
 */
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Modules read prefers-reduced-motion / useIsMobile via matchMedia; jsdom lacks it.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
