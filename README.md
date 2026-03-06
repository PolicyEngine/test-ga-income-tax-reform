# Georgia income tax & child tax credit reform calculator

An interactive calculator that lets users model the impact of Georgia's flat income tax rate and new Child Tax Credit on their household and on the state as a whole.

## Features

- **Household configuration**: Filing status, ages, dependents, and income
- **Reform parameters**: GA flat tax rate, standard deduction, CTC amount/age/refundability/phase-out
- **Household impact tab**: Net income line chart, summary metrics, marginal rate chart
- **Statewide impact tab**: Revenue change, winners/losers, poverty impact, decile analysis

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4 with @policyengine/ui-kit theme
- Recharts for charts
- React Query for data fetching
- Modal (Python) backend with policyengine-us

## Getting started

```bash
bun install
bun run dev
```

## Testing

```bash
bunx vitest run
```

## Deployment

Frontend deploys to Vercel under the `policy-engine` scope. Backend deploys to Modal.
