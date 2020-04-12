$cleanDirectories = @(
    "build",
    "dist",
    "node_modules",
    "Tools"
)

foreach ($folder in $cleanDirectories) {
    Remove-Item $folder -Recurse
}