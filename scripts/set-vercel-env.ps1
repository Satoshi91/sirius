# Vercel環境変数設定スクリプト
# .env.localから環境変数を読み込んでVercelに設定します

$envFile = ".env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "エラー: $envFile が見つかりません" -ForegroundColor Red
    exit 1
}

Write-Host "`.env.local`から環境変数を読み込んでいます..." -ForegroundColor Cyan

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
        
        # 改行文字を削除（CRLF、LF、CRのすべて）
        # FIREBASE_PRIVATE_KEYの場合は改行を保持する必要があるため、特別処理
        if ($key -notmatch "PRIVATE_KEY") {
            $value = $value -replace "`r`n", "" -replace "`n", "" -replace "`r", ""
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

Write-Host "`nVercelに環境変数を設定します..." -ForegroundColor Cyan
Write-Host "注意: 各環境変数について、値を入力するかEnterキーで現在の値をそのまま使用します`n" -ForegroundColor Yellow

foreach ($key in $envVars.Keys) {
    $currentValue = $envVars[$key]
    
    # 機密情報の場合は表示をマスク
    $displayValue = if ($key -match "PRIVATE_KEY|SIGNATURE_KEY") {
        "*** (マスクされています)"
    } else {
        $currentValue
    }
    
    Write-Host "`n[$key]" -ForegroundColor Cyan
    Write-Host "現在の値: $displayValue" -ForegroundColor Gray
    
    foreach ($env in $environments) {
        Write-Host "  → $env に設定中..." -ForegroundColor Yellow
        
        # 一時ファイルに値を書き込む
        # 改行文字を確実に削除してから書き込む（FIREBASE_PRIVATE_KEYは除く）
        $valueToWrite = if ($key -match "PRIVATE_KEY") {
            $currentValue
        } else {
            # 改行文字を完全に削除
            $currentValue -replace "`r`n", "" -replace "`n", "" -replace "`r", ""
        }
        
        $tempFile = [System.IO.Path]::GetTempFileName()
        [System.IO.File]::WriteAllText($tempFile, $valueToWrite, [System.Text.Encoding]::UTF8)
        
        # vercel env addコマンドを実行
        # 注意: vercel env addは対話的で、パイプからの入力を受け付けない場合があります
        # そのため、PowerShellのStart-Processを使用します
        $process = Start-Process -FilePath "vercel" -ArgumentList "env", "add", $key, $env, "--force" -NoNewWindow -Wait -PassThru -RedirectStandardInput $tempFile
        
        if ($process.ExitCode -eq 0) {
            Write-Host "    ✓ 設定完了" -ForegroundColor Green
        } else {
            Write-Host "    ✗ 設定失敗 (手動で設定してください)" -ForegroundColor Red
        }
        
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}

Write-Host "`n完了しました！" -ForegroundColor Green
Write-Host "注意: vercel env addは対話的なコマンドのため、上記の方法では完全に自動化できない場合があります。" -ForegroundColor Yellow
Write-Host "手動で設定する場合は、以下のコマンドを実行してください:" -ForegroundColor Yellow
Write-Host ""
foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "# $key" -ForegroundColor Gray
    foreach ($env in $environments) {
        Write-Host "vercel env add $key $env" -ForegroundColor White
    }
    Write-Host ""
}

