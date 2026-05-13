Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "public\videos"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$width = 1280
$height = 720
$frames = 72
$delayHundredths = 8
$outGif = Join-Path $outDir "hi-follow-jontaworld.gif"
$outHtml = Join-Path $outDir "hi-follow-jontaworld.html"
$outPoster = Join-Path $outDir "hi-follow-jontaworld-poster.png"

function Ease-Out-Back([double]$x) {
  $c1 = 1.70158
  $c3 = $c1 + 1
  return 1 + $c3 * [Math]::Pow($x - 1, 3) + $c1 * [Math]::Pow($x - 1, 2)
}

function Add-TextPath([System.Drawing.Drawing2D.GraphicsPath]$path, [string]$text, [string]$family, [float]$emSize, [float]$x, [float]$y) {
  $fontFamily = New-Object System.Drawing.FontFamily($family)
  $path.AddString($text, $fontFamily, [int][System.Drawing.FontStyle]::Bold, $emSize, [System.Drawing.PointF]::new($x, $y), [System.Drawing.StringFormat]::GenericDefault)
  $fontFamily.Dispose()
}

function New-Frame([int]$i) {
  $t = $i / [double]($frames - 1)
  $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $bgRect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bgRect, [System.Drawing.Color]::FromArgb(255, 5, 8, 18), [System.Drawing.Color]::FromArgb(255, 11, 28, 34), 28)
  $g.FillRectangle($bgBrush, $bgRect)
  $bgBrush.Dispose()

  $cx = $width / 2
  $cy = $height / 2
  for ($r = 0; $r -lt 22; $r++) {
    $phase = ($t * 360) + ($r * 19)
    $angle = $phase * [Math]::PI / 180
    $radius = 80 + ($r * 21) + (24 * [Math]::Sin(($t * 6.28) + $r))
    $x = $cx + [Math]::Cos($angle) * $radius
    $y = $cy + [Math]::Sin($angle * 1.17) * ($radius * .48)
    $size = 5 + (($r % 4) * 3)
    $alpha = 50 + (($r * 17) % 150)
    $spark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 36, 246, 213))
    $g.FillEllipse($spark, [float]($x - $size / 2), [float]($y - $size / 2), [float]$size, [float]$size)
    $spark.Dispose()
  }

  for ($line = 0; $line -lt $height; $line += 18) {
    $alpha = 18 + [int](14 * [Math]::Sin(($line * .04) + ($t * 18)))
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($alpha, 255, 255, 255), 1)
    $g.DrawLine($pen, 0, $line, $width, $line)
    $pen.Dispose()
  }

  $pulse = .92 + (.08 * [Math]::Sin($t * [Math]::PI * 8))
  $intro = [Math]::Min(1, $t / .28)
  $scale = [Math]::Max(.1, (Ease-Out-Back $intro) * $pulse)
  $shake = if ($t -lt .18) { (1 - $t / .18) * 28 * [Math]::Sin($t * 95) } else { 0 }

  $textPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-TextPath $textPath "HI" "Arial" 330 0 0
  $bounds = $textPath.GetBounds()
  $m = New-Object System.Drawing.Drawing2D.Matrix
  $m.Translate([float](-$bounds.X - $bounds.Width / 2), [float](-$bounds.Y - $bounds.Height / 2))
  $m.Scale([float]$scale, [float]$scale)
  $m.Translate([float]($cx + $shake), [float]($cy - 30))
  $textPath.Transform($m)
  $m.Dispose()

  $shadowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(170, 255, 49, 132), 18)
  $cyanPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(190, 28, 245, 255), 10)
  $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 255, 255, 252))
  $g.DrawPath($shadowPen, $textPath)
  $g.DrawPath($cyanPen, $textPath)
  $g.FillPath($whiteBrush, $textPath)
  $shadowPen.Dispose()
  $cyanPen.Dispose()
  $whiteBrush.Dispose()

  $slicePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(155, 255, 232, 74), 7)
  for ($s = 0; $s -lt 5; $s++) {
    $y = 230 + (($i * 19 + $s * 67) % 250)
    $g.DrawLine($slicePen, 310, $y, 970, $y - 18)
  }
  $slicePen.Dispose()

  $tagIn = [Math]::Max(0, [Math]::Min(1, ($t - .50) / .24))
  $tagEase = 1 - [Math]::Pow(1 - $tagIn, 3)
  $tagAlpha = [int](255 * $tagEase)
  $tagY = 564 - (34 * (1 - $tagEase))
  $tagText = "follow jontAWorld"
  $tagFont = New-Object System.Drawing.Font("Segoe UI", 54, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $tagFormat = New-Object System.Drawing.StringFormat
  $tagFormat.Alignment = [System.Drawing.StringAlignment]::Center
  $tagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($tagAlpha, 255, 255, 255))
  $tagGlow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb([Math]::Min(180, $tagAlpha), 24, 238, 196), 4)
  $tagPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  Add-TextPath $tagPath $tagText "Segoe UI" 54 0 0
  $tagBounds = $tagPath.GetBounds()
  $tm = New-Object System.Drawing.Drawing2D.Matrix
  $tm.Translate([float](-$tagBounds.X - $tagBounds.Width / 2), [float](-$tagBounds.Y - $tagBounds.Height / 2))
  $tm.Translate([float]$cx, [float]$tagY)
  $tagPath.Transform($tm)
  $g.DrawPath($tagGlow, $tagPath)
  $g.FillPath($tagBrush, $tagPath)
  $tagFont.Dispose()
  $tagFormat.Dispose()
  $tagBrush.Dispose()
  $tagGlow.Dispose()
  $tagPath.Dispose()
  $tm.Dispose()

  $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 255, 232, 74), 3)
  $g.DrawRectangle($borderPen, 31, 31, $width - 62, $height - 62)
  $borderPen.Dispose()

  $textPath.Dispose()
  $g.Dispose()
  return $bmp
}

function New-PropertyItem([int]$id, [short]$type, [byte[]]$value) {
  $item = [System.Runtime.Serialization.FormatterServices]::GetUninitializedObject([System.Drawing.Imaging.PropertyItem])
  $item.Id = $id
  $item.Type = $type
  $item.Len = $value.Length
  $item.Value = $value
  return $item
}

$gifCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/gif" } | Select-Object -First 1
$encoder = [System.Drawing.Imaging.Encoder]::SaveFlag
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)

$delayBytes = New-Object byte[] ($frames * 4)
for ($i = 0; $i -lt $frames; $i++) {
  [BitConverter]::GetBytes([int]$delayHundredths).CopyTo($delayBytes, $i * 4)
}

$first = New-Frame 0
try {
  $first.SetPropertyItem((New-PropertyItem 0x5100 4 $delayBytes))
  $first.SetPropertyItem((New-PropertyItem 0x5101 3 ([byte[]](0, 0))))
} catch {
  Write-Warning "GIF timing metadata could not be applied; the animation will still render."
}

$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long][System.Drawing.Imaging.EncoderValue]::MultiFrame)
$first.Save($outGif, $gifCodec, $encoderParams)

for ($i = 1; $i -lt $frames; $i++) {
  $frame = New-Frame $i
  $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long][System.Drawing.Imaging.EncoderValue]::FrameDimensionTime)
  $first.SaveAdd($frame, $encoderParams)
  $frame.Dispose()
}

$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long][System.Drawing.Imaging.EncoderValue]::Flush)
$first.SaveAdd($encoderParams)
$first.Dispose()
$encoderParams.Dispose()

$poster = New-Frame 56
$poster.Save($outPoster, [System.Drawing.Imaging.ImageFormat]::Png)
$poster.Dispose()

$html = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HI - follow jontAWorld</title>
  <style>
    html, body { margin: 0; min-height: 100%; background: #050812; display: grid; place-items: center; }
    img { width: min(100vw, 1280px); height: auto; display: block; }
  </style>
</head>
<body>
  <img src="./hi-follow-jontaworld.gif" alt="Animated HI intro saying follow jontAWorld" />
</body>
</html>
"@

Set-Content -LiteralPath $outHtml -Value $html -Encoding UTF8

Write-Output $outGif
Write-Output $outHtml
Write-Output $outPoster
