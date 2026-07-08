Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

$audioDir = Join-Path $PSScriptRoot "audio"
if (-not (Test-Path $audioDir)) {
    New-Item -ItemType Directory -Path $audioDir | Out-Null
}

$metadataPath = Join-Path $PSScriptRoot "dialogues.txt"
if (-not (Test-Path $metadataPath)) {
    Write-Error "dialogues.txt not found."
    Exit 1
}

# Read file safely as UTF-8
$lines = [System.IO.File]::ReadAllLines($metadataPath, [System.Text.Encoding]::UTF8)

foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $parts = $line.Split("|")
    if ($parts.Count -lt 2) { continue }
    
    $fileName = $parts[0].Trim()
    $text = $parts[1].Trim()
    
    $filePath = Join-Path $audioDir $fileName
    Write-Host "Synthesizing: $fileName -> $text"
    
    $synth.SetOutputToWaveFile($filePath)
    $synth.Speak($text)
}

$synth.Dispose()
Write-Host "Successfully completed native Windows voice generation."
