import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/app/page";

// Mock next/font/google
vi.mock("next/font/google", () => ({
  Inter: () => ({ className: "inter" }),
}));

// Mock recharts to avoid SSR issues in tests
vi.mock("recharts", () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("Home page", () => {
  it("renders the page title", () => {
    renderWithProviders(<Home />);
    expect(
      screen.getByText(
        "Georgia income tax & child tax credit reform calculator"
      )
    ).toBeInTheDocument();
  });

  it("renders both tabs", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Household impact")).toBeInTheDocument();
    expect(screen.getByText("Statewide impact")).toBeInTheDocument();
  });

  it("renders household configuration section", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Household configuration")).toBeInTheDocument();
  });

  it("renders reform parameters section", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Reform parameters")).toBeInTheDocument();
  });
});
