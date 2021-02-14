# Restore node_modules
if (!(Test-Path "node_modules")) {
    npm ci
}

# Build project
npm run build

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