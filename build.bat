@echo off

cd .\src
call npm .\src install --no-audit --ignore-scripts --no-fund
call npm audit --prod
call npm run build
cd ..\

call dotnet build .\src\solution
