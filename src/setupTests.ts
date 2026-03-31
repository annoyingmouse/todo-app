import "@testing-library/jest-dom";
import "vitest-axe/extend-expect";
import { configure } from "@testing-library/react";
import { vi, expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

expect.extend(axeMatchers);

// Lazy-loaded routes take longer to resolve in test environments.
// 3s gives enough headroom without slowing down negative assertions.
configure({ asyncUtilTimeout: 3000 });

class MockWorker {
  postMessage = vi.fn();
  terminate = vi.fn();
  onmessage = null;
}

vi.stubGlobal("Worker", MockWorker as unknown as typeof Worker);

HTMLDialogElement.prototype.showModal = vi.fn(function (
  this: HTMLDialogElement,
) {
  this.setAttribute("open", "");
});
HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute("open");
});
