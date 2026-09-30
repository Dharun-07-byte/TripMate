# Contributing to TripMate

First off, thank you for considering contributing to TripMate! It's people like you that make TripMate such a great travel companion platform.

## Development Workflow

### 1. Prerequisites
- Node.js 20+
- npm (Node Package Manager)
- Git

### 2. Fork & Clone
```bash
git clone https://github.com/Dharun-07-byte/TripMate.git
cd TripMate
```

### 3. Installation
Install root, backend, and frontend dependencies:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 4. Running Locally
Run backend and frontend servers:
```bash
# Terminal 1 (Backend - Port 5000)
cd backend && npm run dev

# Terminal 2 (Frontend - Port 5173)
cd frontend && npm run dev
```

### 5. Running Tests & Linters
Before submitting a PR, make sure all tests pass:
```bash
# Backend tests
cd backend && npm test

# Frontend tests & linting
cd frontend && npm test
npm run lint
```

## Pull Request Guidelines
- Follow Conventional Commits format (`feat:`, `fix:`, `docs:`, `test:`, `ci:`, `refactor:`).
- Keep pull requests focused on a single responsibility.
- Include descriptive titles and details explaining the rationale.
