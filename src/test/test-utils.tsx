import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
} from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";

/**
 * Render a component wrapped in a minimal TanStack Router context + SidebarProvider.
 * `initialPath` controls which path the router starts at.
 */
export function renderWithRouter(
  ui: React.ReactElement,
  options?: RenderOptions & { initialPath?: string }
) {
  const { initialPath = "/", ...renderOpts } = options ?? {};

  const rootRoute = createRootRoute({
    component: () => ui,
  });

  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  function Wrapper() {
    return (
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    );
  }

  return render(<Wrapper />, renderOpts);
}

/**
 * Render a component with just SidebarProvider (no router).
 */
export function renderWithSidebar(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(ui, {
    wrapper: ({ children }) => <SidebarProvider>{children}</SidebarProvider>,
    ...options,
  });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";