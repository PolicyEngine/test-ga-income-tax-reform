.PHONY: dev dev-frontend dev-backend
.PHONY: build test lint clean

# Start Modal backend + Next.js frontend together
dev:
	@echo "Starting Modal backend (ephemeral)..."
	@modal serve backend/modal_app.py & MODAL_PID=$$!; \
	sleep 5; \
	MODAL_URL=$$(modal app list --json 2>/dev/null | \
	  python3 -c "import sys,json; apps=json.load(sys.stdin); \
	  print(next((a['url'] for a in apps \
	  if 'ga-income-tax-reform' in a.get('name','')), ''))"); \
	if [ -z "$$MODAL_URL" ]; then \
	  MODAL_URL="https://policyengine--ga-income-tax-reform-fastapi-app-dev.modal.run"; \
	fi; \
	PORT=4000; while [ $$PORT -le 4100 ] && nc -z 127.0.0.1 $$PORT 2>/dev/null; do PORT=$$((PORT + 1)); done; \
	echo "Modal backend: $$MODAL_URL"; \
	echo "Frontend: http://localhost:$$PORT"; \
	NEXT_PUBLIC_API_URL=$$MODAL_URL PORT=$$PORT bun run dev; \
	kill $$MODAL_PID 2>/dev/null

# Frontend only (uses production API or NEXT_PUBLIC_API_URL if set)
dev-frontend:
	@PORT=4000; while [ $$PORT -le 4100 ] && nc -z 127.0.0.1 $$PORT 2>/dev/null; do PORT=$$((PORT + 1)); done; \
	echo "Starting dev server on http://localhost:$$PORT"; \
	PORT=$$PORT bun run dev

# Backend only
dev-backend:
	modal serve backend/modal_app.py

build:
	bun run build

test:
	bunx vitest run

lint:
	bun run lint

clean:
	rm -rf .next node_modules
