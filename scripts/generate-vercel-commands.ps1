# Vercel環境変数設定コマンド生成スクリプト
# .env.localから環境変数を読み込んで、実行可能なコマンドを生成します

$envFile = ".env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: $envFile not found" -ForegroundColor Red
    exit 1
}

Write-Host "Loading environment variables from .env.local...`n" -ForegroundColor Cyan

# Read .env.local
$lines = Get-Content $envFile -Encoding UTF8
$envVars = @{}

foreach ($line in $lines) {
    # Skip comments and empty lines
    if ($line -match "^\s*#" -or $line -match "^\s*$") {
        continue
    }
    
    # Parse KEY=VALUE format
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes
        if ($value -match '^"(.*)"$') {
            $value = $matches[1]
        }
        
        # Convert \n to actual newlines (for FIREBASE_PRIVATE_KEY)
        $value = $value -replace '\\n', "`n"
        
        $envVars[$key] = $value
    }
}

Write-Host "Found the following environment variables:" -ForegroundColor Green
foreach ($key in $envVars.Keys) {
    $displayValue = if ($key -match "PRIVATE_KEY|SIGNATURE_KEY") {
        "*** (masked)"
    } else {
        $envVars[$key]
    }
    Write-Host "  - $key = $displayValue" -ForegroundColor Yellow
}

Write-Host "`nSelect environment:" -ForegroundColor Cyan
Write-Host "  1. Production"
Write-Host "  2. Preview"
Write-Host "  3. Development"
Write-Host "  4. All environments"

$choice = Read-Host "`nChoice (1-4)"

$environments = @()
switch ($choice) {
    "1" { $environments = @("production") }
    "2" { $environments = @("preview") }
    "3" { $environments = @("development") }
    "4" { $environments = @("production", "preview", "development") }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "PowerShell Commands" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "Copy and paste the following commands into your terminal:`n" -ForegroundColor Yellow

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    Write-Host "# Setting $key" -ForegroundColor Gray
    
    foreach ($env in $environments) {
        # For values with newlines or long values, use here-string
        if ($value -match "`n" -or $value.Length -gt 200) {
            # Use here-string for multi-line values
            Write-Host "`$value = @'" -ForegroundColor Cyan
            Write-Host $value -ForegroundColor White
            Write-Host "'@" -ForegroundColor Cyan
            Write-Host "`$value | vercel env add $key $env" -ForegroundColor White
        } else {
            # Simple value, use echo
            $escapedValue = $value -replace '"', '`"'
            Write-Host "echo `"$escapedValue`" | vercel env add $key $env" -ForegroundColor White
        }
        Write-Host ""
    }
}

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "Instructions" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "1. Copy the commands above" -ForegroundColor Yellow
Write-Host "2. Paste them into your PowerShell terminal" -ForegroundColor Yellow
Write-Host "3. Press Enter after each command" -ForegroundColor Yellow
Write-Host "4. For each command, vercel will prompt you to confirm - press Enter" -ForegroundColor Yellow
Write-Host "`nAfter setting, verify with: vercel env ls" -ForegroundColor Cyan
