Add-Type -AssemblyName System.Drawing
$bitmap = New-Object System.Drawing.Bitmap 1200,630
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::FromArgb(8,8,8))
$font = New-Object System.Drawing.Font 'Arial',104,([System.Drawing.FontStyle]::Bold),([System.Drawing.GraphicsUnit]::Pixel)
$subtitleFont = New-Object System.Drawing.Font 'Arial',22
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$yellow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,214,0))
$grey = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(185,185,185))
$graphics.DrawString('TheBrand',$font,$white,100,220)
$size = $graphics.MeasureString('TheBrand',$font)
$graphics.FillEllipse($yellow,([single](100+$size.Width-8)),([single]303),([single]24),([single]24))
$graphics.DrawString('CONTENT CREATION & MARKETING STUDIO',$subtitleFont,$grey,108,365)
$bitmap.Save((Join-Path $PSScriptRoot 'dist/social-preview.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose(); $bitmap.Dispose(); $font.Dispose(); $subtitleFont.Dispose(); $white.Dispose(); $yellow.Dispose(); $grey.Dispose()
