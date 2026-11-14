$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path '.\node_modules\next\dist\bin\next')) {
    npm ci
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
}
if (Get-NetTCPConnection -LocalPort 3022 -State Listen -ErrorAction SilentlyContinue) {
    throw 'Port 3022 is already running. Stop that server with Ctrl+C first. Nothing was terminated.'
}
$previousKey = $env:OPENAI_API_KEY
$previousModel = $env:OPENAI_MODEL
$previousLimit = $env:AI_MAX_REQUESTS
try {
    if (-not $env:OPENAI_API_KEY) {
        $secureKey = Read-Host 'Enter your existing OpenAI API key (hidden; not saved to disk)' -AsSecureString
        $keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
        try { $env:OPENAI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer) }
        finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer) }
    }
    if (-not $env:OPENAI_API_KEY.Trim()) { throw 'No key supplied.' }
    $model = Read-Host 'OpenAI model ID [Enter for gpt-5.4-mini]'
    $env:OPENAI_MODEL = if ($model.Trim()) { $model.Trim() } else { 'gpt-5.4-mini' }
    $approved = Read-Host 'Approve maximum paid Search attempts for this server session (1-100; Enter for 1)'
    $attempts = 1
    if ($approved.Trim() -and (-not [int]::TryParse($approved, [ref]$attempts))) { throw 'Enter a whole number.' }
    if ($attempts -lt 1 -or $attempts -gt 100) { throw 'Choose 1 to 100 attempts.' }
    $env:AI_MAX_REQUESTS = [string]$attempts
    Write-Host "Open http://localhost:3022. Each explicit Search can use one paid OpenAI attempt; cap: $attempts."
    Write-Host 'Failures count too. Restarting resets the attempt counter. This is not a dollar spending cap.'
    node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3022
} finally {
    $env:OPENAI_API_KEY = $previousKey
    $env:OPENAI_MODEL = $previousModel
    $env:AI_MAX_REQUESTS = $previousLimit
    Remove-Variable secureKey, keyPointer -ErrorAction SilentlyContinue
}
