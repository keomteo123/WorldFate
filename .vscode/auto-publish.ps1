$ErrorActionPreference = 'Stop'

$root = [IO.Path]::GetFullPath((Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))).TrimEnd('\')
Set-Location $root

$repoRoot = [IO.Path]::GetFullPath((& git rev-parse --show-toplevel).Trim()).TrimEnd('\')
if ($LASTEXITCODE -ne 0 -or $repoRoot -ine $root) {
    throw 'WorldFate auto-publish must run from the project Git repository.'
}

$branch = (& git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -ne 'mm') {
    throw "Expected the mm branch, found '$branch'."
}

$remote = (& git remote get-url origin).Trim()
if ($LASTEXITCODE -ne 0 -or $remote -ne 'https://github.com/keomteo123/WorldFate.git') {
    throw "Unexpected origin remote: '$remote'."
}

$extensions = @('.html', '.css', '.js', '.sql', '.mp4', '.json', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.mp3', '.ogg', '.wav', '.md')
$pathspecs = @('*.html', '*.css', '*.js', '*.sql', '*.mp4', '*.json', '*.png', '*.jpg', '*.jpeg', '*.webp', '*.svg', '*.ico', '*.mp3', '*.ogg', '*.wav', '*.md')

function Get-SiteFileState {
    $files = Get-ChildItem -Path $root -File -Recurse -Force | Where-Object {
        $_.FullName -notmatch '[\\/]\.git[\\/]' -and
        $_.FullName -notmatch '[\\/]\.vscode[\\/]' -and
        $extensions -contains $_.Extension.ToLowerInvariant()
    } | Sort-Object FullName

    return (($files | ForEach-Object {
        '{0}|{1}|{2}' -f $_.FullName, $_.Length, $_.LastWriteTimeUtc.Ticks
    }) -join "`n")
}

Write-Output 'Starting WorldFate auto-publisher'
$lastState = Get-SiteFileState
$changedAt = $null
$pushPending = $false
Write-Output 'READY: WorldFate auto-publisher is watching files'

while ($true) {
    Start-Sleep -Seconds 2
    $currentState = Get-SiteFileState
    if ($currentState -ne $lastState) {
        $lastState = $currentState
        $changedAt = [DateTime]::UtcNow
    }

    if ($changedAt -and ([DateTime]::UtcNow - $changedAt).TotalSeconds -ge 8) {
        & git add -A -- @pathspecs
        if ($LASTEXITCODE -ne 0) {
            throw "git add failed with exit code $LASTEXITCODE."
        }

        & git diff --cached --quiet
        if ($LASTEXITCODE -eq 1) {
            $message = 'Auto-publish: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
            & git commit -m $message
            if ($LASTEXITCODE -ne 0) {
                throw "git commit failed with exit code $LASTEXITCODE."
            }
            $pushPending = $true
        } elseif ($LASTEXITCODE -ne 0) {
            throw "git diff failed with exit code $LASTEXITCODE."
        }
        $changedAt = $null
    }

    if ($pushPending) {
        & git push origin mm
        if ($LASTEXITCODE -eq 0) {
            Write-Output 'Published to GitHub Pages source branch mm.'
            $pushPending = $false
            $lastState = Get-SiteFileState
        } else {
            Write-Warning 'GitHub upload failed. Check authentication or remote changes; retrying in 30 seconds.'
            Start-Sleep -Seconds 30
        }
    }
}
