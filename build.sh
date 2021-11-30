#!/bin/sh

npm --prefix ./src install
npm --prefix ./src run build
dotnet build ./src/solution
