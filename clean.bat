@echo off

echo Cleaning...

if exist .\build         echo - .\build         & rd .\build /q /s
if exist .\dist          echo - .\dist          & rd .\dist /q /s
if exist .\node_modules  echo - .\node_modules  & rd .\node_modules /q /s
if exist .\Tools         echo - .\Tools         & rd .\Tools /q /s

echo Clean complete