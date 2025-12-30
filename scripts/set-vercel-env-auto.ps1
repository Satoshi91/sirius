# Vercel Environment Variables Auto Setup Script
# Reads environment variables from .env.local and sets them to Vercel

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
        
        # Convert \n to actual newlines (for FIREBASE_PRIVATE_KEY only)
        if ($key -match "PRIVATE_KEY") {
            $value = $value -replace '\\n', "`n"
        } else {
            # Remove all newline characters (CRLF, LF, CR) for other variables
            $value = $value -replace "`r`n", "" -replace "`n", "" -replace "`r", ""
        }
        
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

Write-Host "`nSetting environment variables to Vercel...`n" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    Write-Host "[$key]" -ForegroundColor Cyan
    
    foreach ($env in $environments) {
        Write-Host "  -> Setting to $env environment..." -ForegroundColor Yellow -NoNewline
        
        # Write value to temporary file (UTF-8)
        # Ensure no trailing newlines for non-PRIVATE_KEY variables
        $valueToWrite = if ($key -match "PRIVATE_KEY") {
            $value
        } else {
            # Remove any trailing newlines
            $value.TrimEnd("`r", "`n")
        }
        
        $tempFile = [System.IO.Path]::GetTempFileName()
        try {
            [System.IO.File]::WriteAllText($tempFile, $valueToWrite, [System.Text.Encoding]::UTF8)
            
            # Execute vercel env add command
            # Use temporary file as standard input
            $process = Start-Process -FilePath "vercel" -ArgumentList "env", "add", $key, $env -NoNewWindow -Wait -PassThru -RedirectStandardInput $tempFile
            
            if ($process.ExitCode -eq 0) {
                Write-Host " OK" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host " Failed (ExitCode: $($process.ExitCode))" -ForegroundColor Red
                $failCount++
            }
        }
        catch {
            Write-Host " Error: $_" -ForegroundColor Red
            $failCount++
        }
        finally {
            # Remove temporary file
            if (Test-Path $tempFile) {
                Remove-Item $tempFile -ErrorAction SilentlyContinue
            }
        }
    }
    Write-Host ""
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "  Success: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  Failed: $failCount" -ForegroundColor Red
} else {
    Write-Host "  Failed: $failCount" -ForegroundColor Green
}

if ($failCount -eq 0) {
    Write-Host "`nCheck environment variables: vercel env ls" -ForegroundColor Cyan
} else {
    Write-Host "`nSome environment variables failed to set. Please set them manually." -ForegroundColor Yellow
    Write-Host "Check: vercel env ls" -ForegroundColor Cyan
}
