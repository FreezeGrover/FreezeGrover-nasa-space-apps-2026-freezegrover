$ErrorActionPreference = 'Stop'
$project = if (Test-Path '.\src\styles\theme.css') { (Get-Location).Path } else { Join-Path $HOME 'Documents\Nasa-SpaceApps\flames-in-freefall' }
$theme = Join-Path $project 'src\styles\theme.css'
$layout = Join-Path $project 'src\styles\layout.css'
$proportions = Join-Path $project 'src\styles\reference-proportions.css'
if (-not (Test-Path $theme)) { throw 'Open PowerShell inside the extracted flames-in-freefall folder and run this again.' }
$utf8 = New-Object System.Text.UTF8Encoding($false)
$text = [IO.File]::ReadAllText($theme)
$text = $text.Replace('font-family: "Kalam", cursive;', 'font-family: "Segoe UI", Arial, sans-serif;')
[IO.File]::WriteAllText($theme, $text, $utf8)
$text = [IO.File]::ReadAllText($layout)
if ($text -notmatch '(?s)\.brand\s*\{\s*font-family:') {
    $text = $text.Replace('.brand {', ".brand {`r`n  font-family: `"Kalam`", cursive;")
    [IO.File]::WriteAllText($layout, $text, $utf8)
}
$text = [IO.File]::ReadAllText($proportions)
$rule = '@media (min-width: 901px) { .sidebar nav button { font-size: 20px; } }'
if (-not $text.Contains($rule)) { [IO.File]::WriteAllText($proportions, $text + "`r`n" + $rule + "`r`n", $utf8) }
Write-Host 'Clean font applied. The logo stays cursive. Refresh http://localhost:3020.'
