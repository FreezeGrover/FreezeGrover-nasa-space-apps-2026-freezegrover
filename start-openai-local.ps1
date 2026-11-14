$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path '.\node_modules\next\dist\bin\next')) {
    npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
}
if (Get-NetTCPConnection -LocalPort 3022 -State Listen -ErrorAction SilentlyContinue) {
    throw 'Port 3022 is already running. Stop that server with Ctrl+C first. Nothing was terminated.'
}
$previousKey = $env:OPENAI_API_KEY
$previousModel = $env:OPENAI_MODEL
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
    Write-Host 'Open http://localhost:3022. AI Search uses your OpenAI API account; there is no app request-count cap.'
    node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3022
} finally {
    $env:OPENAI_API_KEY = $previousKey
    $env:OPENAI_MODEL = $previousModel
    Remove-Variable secureKey, keyPointer -ErrorAction SilentlyContinue
}
