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
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div />,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ReferenceLine: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Cell: () => <div />,
}));

// Mock @policyengine/ui-kit components
vi.mock("@policyengine/ui-kit", () => ({
  DashboardShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-shell">{children}</div>
  ),
  Header: ({ logo }: { logo: React.ReactNode }) => (
    <header data-testid="header">{logo}</header>
  ),
  SidebarLayout: ({
    sidebar,
    children,
  }: {
    sidebar: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div data-testid="sidebar-layout">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  ),
  InputPanel: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="input-panel">
      <h2>{title}</h2>
      {children}
    </div>
  ),
  ResultsPanel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="results-panel">{children}</div>
  ),
  Tabs: ({
    children,
    defaultValue,
  }: {
    children: React.ReactNode;
    defaultValue: string;
  }) => <div data-testid={`tabs-${defaultValue}`}>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <button data-testid={`tab-${value}`}>{children}</button>,
  TabsContent: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-testid={`tab-content-${value}`}>{children}</div>,
  InputGroup: ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <fieldset>
      <legend>{label}</legend>
      {children}
    </fieldset>
  ),
  SelectInput: ({ label }: { label: string }) => (
    <div data-testid={`select-${label}`}>{label}</div>
  ),
  NumberInput: ({ label }: { label: string }) => (
    <div data-testid={`number-${label}`}>{label}</div>
  ),
  SliderInput: ({ label }: { label: string }) => (
    <div data-testid={`slider-${label}`}>{label}</div>
  ),
  CurrencyInput: ({ label }: { label: string }) => (
    <div data-testid={`currency-${label}`}>{label}</div>
  ),
  CheckboxInput: ({ label }: { label: string }) => (
    <div data-testid={`checkbox-${label}`}>{label}</div>
  ),
  ChartContainer: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div data-testid={`chart-${title}`}>
      <h3>{title}</h3>
      {children}
    </div>
  ),
  MetricCard: ({ label }: { label: string }) => (
    <div data-testid={`metric-${label}`}>{label}</div>
  ),
  formatCurrency: (v: number) => `$${v}`,
  formatPercent: (v: number) => `${v}%`,
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("Home page", () => {
  it("renders the header with title", () => {
    renderWithProviders(<Home />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(
      screen.getByText("Georgia income tax & CTC reform calculator"),
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

  it("renders the sidebar layout", () => {
    renderWithProviders(<Home />);
    expect(screen.getByTestId("sidebar-layout")).toBeInTheDocument();
    expect(screen.getByTestId("input-panel")).toBeInTheDocument();
    expect(screen.getByTestId("results-panel")).toBeInTheDocument();
  });

  it("renders filing status input", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Filing status")).toBeInTheDocument();
  });

  it("renders income slider", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Annual employment income")).toBeInTheDocument();
  });

  it("renders tax rate slider", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Flat income tax rate")).toBeInTheDocument();
  });
});
