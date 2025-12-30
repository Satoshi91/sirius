# Vercel環境変数設定コマンド生成スクリプト
# .env.localから環境変数を読み込んで、Vercel CLIコマンドを生成します

$envFile = ".env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "エラー: $envFile が見つかりません" -ForegroundColor Red
    exit 1
}

Write-Host ".env.localから環境変数を読み込んでいます..." -ForegroundColor Cyan

# .env.localを読み込む
$lines = Get-Content $envFile
$envVars = @{}

foreach ($line in $lines) {
    # コメント行と空行をスキップ
    if ($line -match "^\s*#" -or $line -match "^\s*$") {
        continue
    }
    
    # KEY=VALUE形式をパース
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # 引用符を削除
        if ($value -match '^"(.*)"$') {
            $value = $matches[1]
        }
        
        $envVars[$key] = $value
    }
}

Write-Host "`n以下の環境変数が見つかりました:" -ForegroundColor Green
foreach ($key in $envVars.Keys) {
    Write-Host "  - $key" -ForegroundColor Yellow
}

Write-Host "`n環境を選択してください:" -ForegroundColor Cyan
Write-Host "  1. Production"
Write-Host "  2. Preview"
Write-Host "  3. Development"
Write-Host "  4. すべての環境"

$choice = Read-Host "`n選択 (1-4)"

$environments = @()
switch ($choice) {
    "1" { $environments = @("production") }
    "2" { $environments = @("preview") }
    "3" { $environments = @("development") }
    "4" { $environments = @("production", "preview", "development") }
    default {
        Write-Host "無効な選択です" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n=== Vercel CLIコマンド ===" -ForegroundColor Green
Write-Host "以下のコマンドを実行して環境変数を設定してください:`n" -ForegroundColor Yellow

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    # 機密情報の場合は表示をマスク
    $displayValue = if ($key -match "PRIVATE_KEY|SIGNATURE_KEY") {
        "*** (マスクされています)"
    } else {
        $value
    }
    
    Write-Host "# $key" -ForegroundColor Gray
    Write-Host "# 値: $displayValue" -ForegroundColor DarkGray
    
    foreach ($env in $environments) {
        # 値に改行が含まれる場合は、一時ファイルを使用する方法を提案
        if ($value -match "`n" -or $value.Length -gt 200) {
            Write-Host "# 長い値の場合は、以下のように設定してください:" -ForegroundColor DarkGray
            Write-Host "# echo '$value' | vercel env add $key $env" -ForegroundColor White
        } else {
            # 値に特殊文字が含まれる場合はエスケープ
            $escapedValue = $value -replace '"', '\"'
            Write-Host "echo `"$escapedValue`" | vercel env add $key $env" -ForegroundColor White
        }
    }
    Write-Host ""
}

Write-Host "`n=== または、PowerShellで以下のように実行 ===" -ForegroundColor Green
Write-Host ""

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    foreach ($env in $environments) {
        # PowerShellの場合は変数を使用
        Write-Host "`$value = @'`n$value`n'@" -ForegroundColor Cyan
        Write-Host "`$value | vercel env add $key $env" -ForegroundColor White
        Write-Host ""
    }
}

Write-Host "`n完了！上記のコマンドをコピー&ペーストして実行してください。" -ForegroundColor Green

