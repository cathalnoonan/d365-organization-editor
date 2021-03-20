# Check if yarn is installed
yarn
if ($LASTEXITCODE -ne 0) {
    npm install -g yarn
    yarn
}

# Build project
yarn build
if ($LASTEXITCODE -ne 0) {
    exit 1
}

# Restore solution packager
if (![System.IO.File]::Exists(".\Tools\CoreTools\SolutionPackager.exe")) {
    & "$PSScriptRoot\GetTools.ps1"

    # Delete Microsoft telemetry
    $telemetryPath = ".\Tools\CoreTools\pacTelemetryUpload.exe"
    if (Test-Path $telemetryPath) {
        Remove-Item $telemetryPath
    }
}

# Pack solution
& "$PSScriptRoot\Pack.ps1"