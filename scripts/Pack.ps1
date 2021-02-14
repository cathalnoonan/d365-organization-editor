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
    /zipfile: ".\dist\$($solutionName)_$($solutionVersion).zip " `
    /folder: .\solution `
    /errorlevel: Warning `
    /nologo `
    /map: .\solution\map.xml `
    /PackageType: Both

Write-Output "`nPack complete`n"