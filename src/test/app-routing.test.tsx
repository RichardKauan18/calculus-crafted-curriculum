import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

function createTestRouter(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
}

describe("App routing", () => {
  it("resolves the index route", async () => {
    const router = createTestRouter("/");

    await router.load();

    expect(router.state.location.pathname).toBe("/");
    expect(router.state.matches.length).toBeGreaterThan(0);
  });

  it("resolves an unknown path through the root not-found boundary", async () => {
    const path = "/this-route-does-not-exist";
    const router = createTestRouter(path);

    await router.load();

    expect(router.state.location.pathname).toBe(path);
    expect(router.state.matches.length).toBeGreaterThan(0);
  });
});
