import "@testing-library/jest-dom";
import { vi } from "vitest";

class MockWorker {
  postMessage = vi.fn();
  terminate = vi.fn();
  onmessage = null;
}

vi.stubGlobal("Worker", MockWorker as unknown as typeof Worker);

HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
});
HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute("open");
});
