# Vercel環境変数設定コマンド表示スクリプト
# .env.localから環境変数を読み込んで、実行可能なコマンドを表示します

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

Write-Host "Found " $envVars.Count " environment variables`n" -ForegroundColor Green

# Generate commands for all environments
$environments = @("production", "preview", "development")

Write-Host "========================================" -ForegroundColor Green
Write-Host "PowerShell Commands for All Environments" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    Write-Host "# $key" -ForegroundColor Gray
    
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

Write-Host "========================================" -ForegroundColor Green
Write-Host "Instructions" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "1. Copy the commands above" -ForegroundColor Yellow
Write-Host "2. Paste them into your PowerShell terminal one by one" -ForegroundColor Yellow
Write-Host "3. Press Enter after each command" -ForegroundColor Yellow
Write-Host "4. When vercel prompts, press Enter to confirm" -ForegroundColor Yellow
Write-Host "`nAfter setting, verify with: vercel env ls" -ForegroundColor Cyan

