# Variables for this script
$solutionName = "organizationeditor"
$solutionXmlPath = ".\solution\Other\Solution.xml";
$solutionVersion = $([xml] $(Get-Content $solutionXmlPath)).ImportExportXml.SolutionManifest.Version -replace "[.]", "_";


# Install node_modules, run build
if (![System.IO.Directory]::Exists("node_modules")) {
    npm install;
} else {
    Write-Output "`nnode_modules found`n"
}
npm run build;


# Get SolutionPackager if it doesn't exist
if (![System.IO.File]::Exists("Tools/CoreTools/SolutionPackager.exe")) {
    .\GetTools.ps1;
} else {
    Write-Output "`nSolutionPackager found`n"
}


# Build unmanaged
Write-Output "Packing unmanaged solution"
Tools/CoreTools/SolutionPackager.exe `
    /action: Pack `
    /zipfile: ".\build\$($solutionName)_$($solutionVersion).zip " `
    /folder: .\solution `
    /errorlevel: Warning `
    /nologo `
    /map: .\solution\map.xml `
    /PackageType: Unmanaged

# Build managed
Write-Output "Packing managed solution"
Tools/CoreTools/SolutionPackager.exe `
    /action: Pack `
    /zipfile: ".\build\$($solutionName)_$($solutionVersion)_managed.zip " `
    /folder: .\solution `
    /errorlevel: Warning `
    /nologo `
    /map: .\solution\map.xml `
    /PackageType: Managed


Write-Output "`nPack complete`n"