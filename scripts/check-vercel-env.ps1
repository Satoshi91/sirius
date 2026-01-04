# Vercel環境変数の改行文字チェックスクリプト

Write-Host "Checking Vercel environment variables for newline characters...`n" -ForegroundColor Cyan

# チェック対象の環境変数
$checkVars = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL"
)

$environments = @("production", "preview", "development")

foreach ($envVar in $checkVars) {
    Write-Host "[$envVar]" -ForegroundColor Yellow
    
    foreach ($env in $environments) {
        # vercel env lsの出力から値を取得
        $output = vercel env ls 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Error: Failed to get environment variables" -ForegroundColor Red
            exit 1
        }
        
        # JSON出力を試す
        $jsonOutput = vercel env ls --json 2>&1
        if ($LASTEXITCODE -eq 0) {
            try {
                $envVars = $jsonOutput | ConvertFrom-Json
                $found = $envVars | Where-Object { 
                    $_.key -eq $envVar -and $_.target -contains $env 
                } | Select-Object -First 1
                
                if ($found) {
                    $value = $found.value
                    $hasNewline = $value -match "`r|`n"
                    $hasWhitespace = $value -ne $value.Trim()
                    
                    if ($hasNewline -or $hasWhitespace) {
                        Write-Host "  ❌ $env`: Contains newline or whitespace" -ForegroundColor Red
                        Write-Host "     Value (hex): $(([System.Text.Encoding]::UTF8.GetBytes($value) | ForEach-Object { '{0:X2}' -f $_ }) -join ' ')" -ForegroundColor Gray
                        Write-Host "     Length: $($value.Length) chars" -ForegroundColor Gray
                    } else {
                        Write-Host "  ✓ $env`: OK" -ForegroundColor Green
                    }
                } else {
                    Write-Host "  ⚠ $env`: Not set" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "  ⚠ $env`: Could not parse JSON output" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ⚠ $env`: Could not get JSON output, trying text output..." -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

Write-Host "`nTo fix issues, run the following commands:" -ForegroundColor Cyan
Write-Host "  1. Delete the problematic variable:" -ForegroundColor Yellow
Write-Host "     vercel env rm <VAR_NAME> <ENVIRONMENT> --yes" -ForegroundColor Gray
Write-Host "  2. Re-add the variable without newlines:" -ForegroundColor Yellow
Write-Host "     `$value = 'your-value'; `$value | vercel env add <VAR_NAME> <ENVIRONMENT>" -ForegroundColor Gray
