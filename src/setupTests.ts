import { vi } from "vitest";
import { server } from "./__tests__/mocks/server";

class MockWorker {
  postMessage = vi.fn();
  terminate = vi.fn();
  onmessage = null;
}

vi.stubGlobal("Worker", MockWorker as unknown as typeof Worker);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
