$runs = [int]($args[0]); if (-not $runs) { $runs = 3 }
$url = if ($args[1]) { $args[1] } else { "http://localhost:3000" }
$dir = "$env:TEMP\lh"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
for ($i = 1; $i -le $runs; $i++) {
  $out = "$dir\run$i.json"
  npx --yes lighthouse@13 $url --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=$out --chrome-flags="--headless=new --no-sandbox" --quiet 2>&1 | Out-Null
  $r = Get-Content $out -Raw | ConvertFrom-Json
  $p = [math]::Round($r.categories.'performance'.score * 100)
  $a = [math]::Round($r.categories.accessibility.score * 100)
  $b = [math]::Round($r.categories.'best-practices'.score * 100)
  $s = [math]::Round($r.categories.seo.score * 100)
  $lcpEl = ""
  try { $lcpEl = $r.audits.'lcp-breakdown-insight'.details.items[1].node.nodeLabel } catch {}
  $failing = ($r.categories.'performance'.auditRefs | ForEach-Object { $au = $r.audits.($_.id); if ($au -and $au.score -ne $null -and $au.score -lt 1 -and $_.weight -gt 0) { "$($_.id)=$($au.displayValue)" } }) -join " "
  Write-Host "run$i P=$p A=$a B=$b S=$s | FCP=$($r.audits.'first-contentful-paint'.displayValue) LCP=$($r.audits.'largest-contentful-paint'.displayValue) TBT=$($r.audits.'total-blocking-time'.displayValue) SI=$($r.audits.'speed-index'.displayValue) CLS=$($r.audits.'cumulative-layout-shift'.displayValue)"
  Write-Host "     main=$($r.audits.'mainthread-work-breakdown'.displayValue) failing=[ $failing ] lcpEl=$lcpEl"
}
