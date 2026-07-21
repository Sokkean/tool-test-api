@echo off
echo Cleaning up duplicate folders in backend/src...

rmdir /s /q "backend\src\auth"
rmdir /s /q "backend\src\user"
rmdir /s /q "backend\src\workspace"
rmdir /s /q "backend\src\prisma"

echo.
echo Cleanup complete! The stray folders have been removed.
pause
