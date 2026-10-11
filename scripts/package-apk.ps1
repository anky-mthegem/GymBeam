<#
.SYNOPSIS
    GymBeam APK Packaging and Revisioning Script
.DESCRIPTION
    Builds the web bundle, syncs with Capacitor, builds the Android APK with Gradle,
    increments the revision number, archives the binary in distribution-apk/
    and distribution apk/, updates GymBeam-latest.apk, and logs to REVISIONS.md.
.PARAMETER Description
    A concise description of this revision (e.g., 'ui-overhaul', 'hotfix').
.EXAMPLE
    .\scripts\package-apk.ps1 -Description "timer-fix"
#>

param (
    [string]$Description = "build"
)

$ErrorActionPreference = "Stop"

# Project root directory
$ProjectRoot = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $ProjectRoot

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " GymBeam Automated APK Packaging & Revision System" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Environment Verification
$JdkPath = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
if (Test-Path $JdkPath) {
    $env:JAVA_HOME = $JdkPath
}
Write-Host "[1/6] Using JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green

# 2. Extract Version from package.json
$PackageJson = Get-Content "$ProjectRoot\package.json" | ConvertFrom-Json
$Version = $PackageJson.version
if (-not $Version) { $Version = "1.0.0" }
Write-Host "[2/6] Project Version: v$Version" -ForegroundColor Green

# 3. Determine Next Revision Number
$DistDir = "$ProjectRoot\distribution-apk"
if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir | Out-Null
}

$ExistingApks = Get-ChildItem -Path $DistDir -Filter "*.apk"
$MaxRev = 0

foreach ($apk in $ExistingApks) {
    if ($apk.Name -match "rev(\d+)") {
        $num = [int]$matches[1]
        if ($num -gt $MaxRev) {
            $MaxRev = $num
        }
    }
}

$NextRev = $MaxRev + 1
$CleanDesc = ($Description -replace "[^a-zA-Z0-9\-_]", "-").ToLower()
$OutputApkName = "GymBeam-v$Version-rev$NextRev-$CleanDesc.apk"
$OutputApkPath = Join-Path $DistDir $OutputApkName
$LatestApkPath = Join-Path $DistDir "GymBeam-latest.apk"

Write-Host "[3/6] Target Revision: rev$NextRev -> $OutputApkName" -ForegroundColor Yellow

# 4. Build Web Bundle & Sync Android
Write-Host "[4/6] Compiling Vite bundle and syncing Capacitor..." -ForegroundColor Cyan
npm run build
npx cap sync android

# 5. Build Android APK with Gradle
Write-Host "[5/6] Building Android Debug APK with Gradle..." -ForegroundColor Cyan
Push-Location "$ProjectRoot\android"
try {
    .\gradlew.bat assembleDebug
} finally {
    Pop-Location
}

$BuiltApkPath = "$ProjectRoot\android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $BuiltApkPath)) {
    throw "Build failed: output APK not found at $BuiltApkPath"
}

# 6. Archive to Distribution Folder & Update Ledger
Write-Host "[6/6] Archiving new revision to distribution folder..." -ForegroundColor Cyan
Copy-Item $BuiltApkPath -Destination $OutputApkPath -Force
Copy-Item $BuiltApkPath -Destination $LatestApkPath -Force

# Root convenience copies
Copy-Item $BuiltApkPath -Destination "$ProjectRoot\GymBeam.apk" -Force

# Hash and Size calculation
$FileHash = (Get-FileHash -Path $OutputApkPath -Algorithm SHA256).Hash
$FileSizeBytes = (Get-Item $OutputApkPath).Length
$FileSizeMB = [math]::Round($FileSizeBytes / 1MB, 1)
$DateStr = (Get-Date).ToString("yyyy-MM-dd")

# Update REVISIONS.md
$RevisionsMdPath = "$DistDir\REVISIONS.md"
if (Test-Path $RevisionsMdPath) {
    $FormattedEntry = "| **rev$NextRev** | [`$OutputApkName`](./$OutputApkName) | $DateStr | $FileSizeMB MB ($FileSizeBytes B) | " + '`' + $FileHash + '`' + " | $Description |"
    Add-Content -Path $RevisionsMdPath -Value $FormattedEntry
}

Write-Host "--------------------------------------------------" -ForegroundColor Green
Write-Host " SUCCESS: Revision rev$NextRev Created!" -ForegroundColor Green
Write-Host " Artifact: $OutputApkPath" -ForegroundColor White
Write-Host " Latest:   $LatestApkPath" -ForegroundColor White
Write-Host " Size:     $FileSizeMB MB ($FileSizeBytes bytes)" -ForegroundColor White
Write-Host " SHA256:   $FileHash" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Green
Write-Host "To install on emulator or connected device:" -ForegroundColor Yellow
Write-Host "  adb install -r `"$LatestApkPath`"" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
