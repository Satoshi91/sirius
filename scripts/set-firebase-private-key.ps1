# FIREBASE_PRIVATE_KEY設定用スクリプト
# 複数行の値を確実に設定するためのスクリプト

Write-Host "Setting FIREBASE_PRIVATE_KEY to Vercel...`n" -ForegroundColor Cyan

# .env.localからFIREBASE_PRIVATE_KEYを読み込む
$envFile = ".env.local"
$lines = Get-Content $envFile -Encoding UTF8
$privateKey = $null

foreach ($line in $lines) {
    if ($line -match "^FIREBASE_PRIVATE_KEY=(.*)$") {
        $value = $matches[1].Trim()
        # 引用符を削除
        if ($value -match '^"(.*)"$') {
            $value = $matches[1]
        }
        # \nを実際の改行に変換
        $privateKey = $value -replace '\\n', "`n"
        break
    }
}

if (-not $privateKey) {
    Write-Host "Error: FIREBASE_PRIVATE_KEY not found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "Select environment:" -ForegroundColor Cyan
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

Write-Host "`nSetting FIREBASE_PRIVATE_KEY...`n" -ForegroundColor Cyan

foreach ($env in $environments) {
    Write-Host "Setting to $env environment..." -ForegroundColor Yellow
    
    # 一時ファイルに値を書き込む
    $tempFile = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($tempFile, $privateKey, [System.Text.Encoding]::UTF8)
        
        Write-Host "  Executing: vercel env add FIREBASE_PRIVATE_KEY $env" -ForegroundColor Gray
        Write-Host "  (The value will be read from the temporary file)" -ForegroundColor Gray
        Write-Host "  Press Enter when prompted to confirm...`n" -ForegroundColor Yellow
        
        # vercel env addコマンドを実行
        # 標準入力から値を読み取る
        Get-Content $tempFile -Raw | vercel env add FIREBASE_PRIVATE_KEY $env
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Successfully set to $env" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to set to $env (ExitCode: $LASTEXITCODE)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
    }
    finally {
        # 一時ファイルを削除
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
    Write-Host ""
}

Write-Host "Done! Verify with: vercel env ls" -ForegroundColor Green

