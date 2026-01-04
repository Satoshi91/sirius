.PHONY: dev fix check build help

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev     - Start development server"
	@echo "  make fix     - Auto-fix linting, formatting, and unused code issues"
	@echo "  make check   - Run all checks (type-check, lint, format, knip, secretlint)"
	@echo "  make build   - Build for production (Vercel simulation)"

# Start development server
dev:
	npm run dev

# Auto-fix all fixable issues
fix:
	@echo "Running auto-fix..."
	npm run fix

# Run all checks (final inspection)
check:
	@echo "Running all checks..."
	npm run check

# Build for production (Vercel simulation)
build:
	@echo "Building for production (Vercel simulation)..."
	npm run build:vercel
