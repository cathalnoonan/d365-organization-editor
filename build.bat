@echo off

call npm --prefix .\src install
call npm --prefix .\src run build
call dotnet build .\src\solution
