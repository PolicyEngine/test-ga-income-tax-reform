.PHONY: dev dev-frontend dev-backend deploy-worker
.PHONY: build test lint clean

# Deploy workers, then start gateway + frontend together
dev:
	@echo "Deploying worker functions..."
	@unset MODAL_TOKEN_ID MODAL_TOKEN_SECRET && modal deploy backend/app.py
	@echo "Starting gateway (ephemeral)..."
	@modal serve backend/modal_app.py & MODAL_PID=$$!; \
	sleep 5; \
	MODAL_URL="https://policyengine--ga-income-tax-reform-fastapi-app-dev.modal.run"; \
	PORT=4000; while [ $$PORT -le 4100 ] && nc -z 127.0.0.1 $$PORT 2>/dev/null; do PORT=$$((PORT + 1)); done; \
	echo "Gateway: $$MODAL_URL"; \
	echo "Frontend: http://localhost:$$PORT"; \
	NEXT_PUBLIC_API_URL=$$MODAL_URL PORT=$$PORT bun run dev; \
	kill $$MODAL_PID 2>/dev/null

# Frontend only (uses production API or NEXT_PUBLIC_API_URL if set)
dev-frontend:
	@PORT=4000; while [ $$PORT -le 4100 ] && nc -z 127.0.0.1 $$PORT 2>/dev/null; do PORT=$$((PORT + 1)); done; \
	echo "Starting dev server on http://localhost:$$PORT"; \
	PORT=$$PORT bun run dev

# Backend only (gateway in dev mode — workers must already be deployed)
dev-backend:
	modal serve backend/modal_app.py

# Deploy worker functions to Modal (required before gateway can spawn jobs)
deploy-worker:
	unset MODAL_TOKEN_ID MODAL_TOKEN_SECRET && modal deploy backend/app.py

build:
	bun run build

test:
	bunx vitest run

lint:
	bun run lint

clean:
	rm -rf .next node_modules
