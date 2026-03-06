# ga-income-tax-reform

Georgia income tax & child tax credit reform calculator. An interactive tool
that lets users model the impact of Georgia's flat income tax rate and new
Child Tax Credit on their household and statewide.

## Architecture

- Next.js App Router with Tailwind CSS v4 and @policyengine/ui-kit theme
- @policyengine/ui-kit for standard UI components
- Custom Modal backend (Python) using policyengine-us for household simulations and microsimulation
- Recharts for data visualization
- React Query for async state management

## Development

```bash
bun install
bun run dev
```

## Testing

```bash
bunx vitest run
```

## Build

```bash
bun run build
```

## Design standards

- Uses Tailwind CSS v4 with @policyengine/ui-kit/theme.css (single import for all tokens)
- @policyengine/ui-kit for all standard UI components
- Primary teal: `bg-teal-500` / `text-teal-500`
- Semantic colors: `bg-primary`, `text-foreground`, `text-muted-foreground`
- Font: Inter (via next/font/google)
- Sentence case for all headings
- Charts use `fill="var(--chart-1)"` for series colors

## Backend

The Modal backend is in `backend/`. Deploy with:

```bash
cd backend
modal deploy modal_app.py
```

Set the `NEXT_PUBLIC_API_URL` environment variable to the Modal endpoint URL.
