# Diagnose.ps1 - Diagnostic script for Little Logic Heroes Expo app

Write-Host "=== Little Logic Heroes Diagnostic Tool ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js and npm
Write-Host "Checking Node.js and npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js or npm not found. Please install Node.js." -ForegroundColor Red
    exit
}
Write-Host ""

# 2. Check installed packages
Write-Host "Checking required packages..." -ForegroundColor Yellow
$packages = @(
    "lottie-react-native",
    "expo-av",
    "@react-native-async-storage/async-storage",
    "react-native-gesture-handler",
    "react-native-reanimated"
)
$missingPackages = @()
foreach ($pkg in $packages) {
    $pkgJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $found = ($pkgJson.dependencies.$pkg -or $pkgJson.devDependencies.$pkg)
    if ($found) {
        Write-Host "✅ $pkg" -ForegroundColor Green
    } else {
        Write-Host "❌ $pkg" -ForegroundColor Red
        $missingPackages += $pkg
    }
}
if ($missingPackages.Count -gt 0) {
    Write-Host "`nMissing packages: $($missingPackages -join ', ')" -ForegroundColor Red
    Write-Host "Install them with:" -ForegroundColor Yellow
    Write-Host "npx expo install $($missingPackages -join ' ')" -ForegroundColor White
} else {
    Write-Host "`nAll required packages are installed." -ForegroundColor Green
}
Write-Host ""

# 3. Check asset directories and files
Write-Host "Checking asset files..." -ForegroundColor Yellow
$animDir = "src\assets\animations"
$soundDir = "src\assets\sounds"
$requiredAnimFiles = @("acorn.json", "mushroom.json", "star.json")
$requiredSoundFiles = @("count.mp3", "success.mp3", "gentle_error.mp3")
$missingAnim = @()
$missingSound = @()

if (Test-Path $animDir) {
    Write-Host "✅ animations directory exists" -ForegroundColor Green
    foreach ($file in $requiredAnimFiles) {
        if (Test-Path "$animDir\$file") {
            Write-Host "  ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file" -ForegroundColor Red
            $missingAnim += $file
        }
    }
} else {
    Write-Host "❌ animations directory not found at $animDir" -ForegroundColor Red
    $missingAnim = $requiredAnimFiles
}

if (Test-Path $soundDir) {
    Write-Host "✅ sounds directory exists" -ForegroundColor Green
    foreach ($file in $requiredSoundFiles) {
        if (Test-Path "$soundDir\$file") {
            Write-Host "  ✅ $file" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file" -ForegroundColor Red
            $missingSound += $file
        }
    }
} else {
    Write-Host "❌ sounds directory not found at $soundDir" -ForegroundColor Red
    $missingSound = $requiredSoundFiles
}

if ($missingAnim.Count -gt 0 -or $missingSound.Count -gt 0) {
    Write-Host "`nSome asset files are missing." -ForegroundColor Red
    if ($missingAnim.Count -gt 0) {
        Write-Host "Missing animations: $($missingAnim -join ', ')" -ForegroundColor Yellow
        Write-Host "Placeholder JSON content for these files is provided in the documentation. Create them manually." -ForegroundColor Yellow
    }
    if ($missingSound.Count -gt 0) {
        Write-Host "Missing sounds: $($missingSound -join ', ')" -ForegroundColor Yellow
        Write-Host "You can download free sound effects from freesound.org or use silent MP3 files." -ForegroundColor Yellow
    }
} else {
    Write-Host "`nAll asset files are present." -ForegroundColor Green
}
Write-Host ""

# 4. Check babel.config.js for reanimated plugin
Write-Host "Checking babel.config.js..." -ForegroundColor Yellow
if (Test-Path "babel.config.js") {
    $babelContent = Get-Content "babel.config.js" -Raw
    if ($babelContent -match "react-native-reanimated/plugin") {
        Write-Host "✅ react-native-reanimated/plugin found in babel.config.js" -ForegroundColor Green
    } else {
        Write-Host "❌ react-native-reanimated/plugin NOT found in babel.config.js" -ForegroundColor Red
        Write-Host "Add the plugin to your babel.config.js:" -ForegroundColor Yellow
        Write-Host @"
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
"@ -ForegroundColor White
    }
} else {
    Write-Host "❌ babel.config.js not found" -ForegroundColor Red
}
Write-Host ""

# 5. Check app.json for proper configuration (basic)
Write-Host "Checking app.json..." -ForegroundColor Yellow
if (Test-Path "app.json") {
    Write-Host "✅ app.json exists" -ForegroundColor Green
    # Could add more checks if needed
} else {
    Write-Host "❌ app.json not found" -ForegroundColor Red
}
Write-Host ""

# 6. Offer to clear cache
$clearCache = Read-Host "Do you want to clear Expo cache? (y/n)"
if ($clearCache -eq 'y') {
    Write-Host "Clearing cache..." -ForegroundColor Yellow
    npx expo start --clear
} else {
    Write-Host "Skipping cache clear." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Diagnostic Complete ===" -ForegroundColor Cyan
Write-Host "If the problem persists, check the Metro bundler logs for specific errors." -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")