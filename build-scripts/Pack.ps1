# Parse solution xml
$solutionXmlPath = ".\solution\Other\Solution.xml";
$solutionXml = $([xml] $(Get-Content $solutionXmlPath));
$solutionManifest = $solutionXml.ImportExportXml.SolutionManifest;

# Variables for this script
$solutionName = $solutionManifest.UniqueName;
$solutionVersion = $solutionManifest.Version -replace "[.]", "_";

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