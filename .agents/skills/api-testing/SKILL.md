---
name: API Testing
description: Instructions and guidelines for testing APIs within this workspace.
---

# API Testing Skill

When asked to test APIs or add new features to the API testing tool in this repository, follow these guidelines:

## Architecture Overview

This project uses an enterprise-grade modular architecture for both frontend and backend:

### Backend Structure (`backend/src/`)
- `config/`: Configuration files (e.g. app, database, jwt).
- `common/`: Cross-cutting concerns (decorators, dto, guards, interceptors, interfaces, utils).
- `database/`: Database configuration (prisma, migrations).
- `modules/`: Feature modules, separating domain concerns (auth, users, workspace, collections, requests).
- `shared/`: Shared infrastructure services (logger, cache, mail).

### Frontend Structure (`frontend/`)
- `assets/`: Static assets.
- `components/`: Global components (common, ui, layouts).
- `features/`: Domain-driven feature modules (auth, users, requests, workspaces), containing their own components, composables, services, stores, and types.
- `layouts/`, `pages/`, `middleware/`, `plugins/`, `stores/`, `utils/`, `constants/`, `api/`: Global Nuxt directories.

## Testing Flow

1. Make sure both the Nuxt frontend and Nest backend are running.
2. The frontend sends a `POST` request to `http://localhost:3001/proxy` (managed in `requests` module).
3. The payload should include the target `url`, the HTTP `method`, and any `headers` or `body`.
4. The backend uses Axios to forward the request and returns the status, headers, data, and latency, logging it to `RequestHistory`.

## Adding Features

- **Styling**: Always use Vanilla CSS in `frontend/assets/` or feature-specific styles. Maintain the premium dark-mode, glassmorphic aesthetics. Avoid generic colors.
- **Backend Logic**: Add features into the appropriate `modules/` folder. Use `common/` for shared interfaces and DTOs.
