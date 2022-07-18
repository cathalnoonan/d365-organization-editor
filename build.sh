#!/bin/sh

npm --prefix ./src install --no-audit --ignore-scripts --no-fund
npm --prefix ./src audit --prod
npm --prefix ./src run build

dotnet build ./src/solution
