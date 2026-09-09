Add-Type -AssemblyName System.Drawing

function Make-Bitmap($size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.Clear([System.Drawing.Color]::FromArgb(20, 20, 30))
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(201, 168, 76))
    $fontSize = [int]($size * 0.55)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $g.DrawString("L", $font, $brush, $rect, $sf)
    $g.Dispose()
    return $bmp
}

# Save a 256x256 PNG for the public folder
$png256 = Make-Bitmap 256
$png256.Save("public\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$png256.Dispose()

# Build ICO with multiple sizes: 16, 32, 48, 64, 128, 256
$sizes = @(16, 32, 48, 64, 128, 256)
$bitmaps = $sizes | ForEach-Object { Make-Bitmap $_ }

$icoPath = "build\icon.ico"
New-Item -ItemType Directory -Force -Path "build" | Out-Null

$ms = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter($ms)

# ICO header
$writer.Write([uint16]0)      # reserved
$writer.Write([uint16]1)      # type: icon
$writer.Write([uint16]$sizes.Count)

# Compute data offset: 6 (header) + 16 * count (directory)
$dataOffset = 6 + 16 * $sizes.Count
$imageStreams = @()

foreach ($bmp in $bitmaps) {
    $imgMs = New-Object System.IO.MemoryStream
    $bmp.Save($imgMs, [System.Drawing.Imaging.ImageFormat]::Png)
    $imageStreams += $imgMs
}

# Write directory entries
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $sz = $sizes[$i]
    $imgSize = $imageStreams[$i].Length
    if ($sz -eq 256) { $wh = [byte]0 } else { $wh = [byte]$sz }
    $writer.Write($wh)   # width (0 = 256)
    $writer.Write($wh)   # height
    $writer.Write([byte]0)    # color count
    $writer.Write([byte]0)    # reserved
    $writer.Write([uint16]1)  # color planes
    $writer.Write([uint16]32) # bits per pixel
    $writer.Write([uint32]$imgSize)
    $writer.Write([uint32]$dataOffset)
    $dataOffset += $imgSize
}

# Write image data
foreach ($imgMs in $imageStreams) {
    $writer.Write($imgMs.ToArray())
    $imgMs.Dispose()
}

$writer.Flush()
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$ms.Dispose()

foreach ($bmp in $bitmaps) { $bmp.Dispose() }

Write-Host "ICO created at $icoPath"
