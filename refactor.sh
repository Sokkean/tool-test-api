#!/bin/bash
echo "Starting Backend Refactor..."
cd backend/src

# Create Backend Directories
mkdir -p config
mkdir -p common/{constants,decorators,dto,enums,exceptions,filters,guards,interceptors,interfaces,middleware,pipes,services,types,utils}
mkdir -p database/{prisma,migrations,seed}
mkdir -p modules/{auth,users,workspace,collections,requests,environments,history,settings,monitoring}
mkdir -p shared/{logger,cache,mail}

# Move Backend Files
mv auth/* modules/auth/ 2>/dev/null
mv user/* modules/users/ 2>/dev/null
mv workspace/* modules/workspace/ 2>/dev/null
mv prisma/* database/prisma/ 2>/dev/null
mv app.controller.ts modules/requests/ 2>/dev/null
mv app.service.ts modules/requests/ 2>/dev/null

# Clean up old empty backend directories
rmdir auth user workspace prisma 2>/dev/null
cd ../..

echo "Starting Frontend Refactor..."
cd frontend

# Create Frontend Directories
mkdir -p assets
mkdir -p components/{common,ui,layouts}
mkdir -p features/{auth,users,requests,workspaces}/{components,composables,services,stores,types}
mkdir -p layouts middleware pages plugins stores types utils constants api

# Move Frontend Files
mv index.css assets/index.css 2>/dev/null
mv stores/auth.ts features/auth/stores/auth.ts 2>/dev/null

echo "Refactoring Script Complete!"
