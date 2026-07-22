$ErrorActionPreference = 'Stop'

$outDir = Join-Path (Get-Location) 'outputs\public-discovery'
New-Item -ItemType Directory -Force $outDir | Out-Null
$csvOut = Join-Path $outDir 'ethiopages_public_discovery_test.csv'
$reportOut = Join-Path $outDir 'ethiopages_public_discovery_quality_report.md'
$seed = 'C:\Users\mudim\Downloads\ethiopages_ethiopian_business_listings_utf8.csv'

$cities = @{
  'Addis Ababa' = @(9.0054,38.7636); 'Bishoftu' = @(8.7522,38.9785); 'Adama' = @(8.5400,39.2700)
  'Hawassa' = @(7.0621,38.4764); 'Dire Dawa' = @(9.6000,41.8500); 'Mekelle' = @(13.4967,39.4767)
  'Gondar' = @(12.6000,37.4667); 'Bahir Dar' = @(11.5936,37.3908); 'Jimma' = @(7.6734,36.8344); 'Dessie' = @(11.1333,39.6333)
}
$categoryRules = @(
  @{ Name='Restaurants'; Match={ param($t) $t.amenity -in @('restaurant','cafe','fast_food','food_court','bar') } }
  @{ Name='Hotels & stays'; Match={ param($t) $t.tourism -in @('hotel','guest_house','hostel','motel','resort') } }
  @{ Name='Shopping'; Match={ param($t) $t.shop -ne $null -or $t.amenity -eq 'marketplace' } }
  @{ Name='Manufacturers'; Match={ param($t) $t.man_made -in @('works','industrial') -or $t.industrial -ne $null } }
  @{ Name='Real estate'; Match={ param($t) $t.office -in @('estate_agent','property_management') } }
  @{ Name='Agriculture'; Match={ param($t) $t.shop -in @('agrarian','farm','garden_centre','畜牧业') -or $t.landuse -in @('farmland','farmyard') } }
  @{ Name='Electronics'; Match={ param($t) $t.shop -in @('electronics','computer','mobile_phone','appliance') } }
  @{ Name='Wholesale'; Match={ param($t) $t.shop -in @('wholesale','trade') } }
  @{ Name='Repair services'; Match={ param($t) $t.shop -in @('repair','car_repair','mobile_phone') -or $t.craft -in @('shoemaker','tailor','repair') } }
  @{ Name='Pet care'; Match={ param($t) $t.amenity -in @('veterinary') -or $t.shop -in @('pet','pet_grooming') } }
  @{ Name='Law & attorneys'; Match={ param($t) $t.office -in @('lawyer','notary') } }
  @{ Name='Plumbing'; Match={ param($t) $t.shop -in @('hardware','trade') -or $t.craft -eq 'plumber' } }
  @{ Name='Health & medical'; Match={ $t.amenity -in @('hospital','clinic','doctors','dentist','pharmacy','health_centre') } }
  @{ Name='Professional services'; Match={ $t.office -in @('company','consulting','insurance','accountant','architect') } }
  @{ Name='Education'; Match={ $t.amenity -in @('school','college','university','kindergarten','language_school','driving_school') } }
  @{ Name='Finance & insurance'; Match={ $t.amenity -in @('bank','atm','bureau_de_change') -or $t.office -eq 'insurance' } }
  @{ Name='Travel & tourism'; Match={ $t.tourism -in @('museum','attraction','information','travel_agency') -or $t.amenity -eq 'car_rental' } }
)

function Get-Category($tags) {
  foreach ($rule in $categoryRules) { if (& $rule.Match $tags) { return $rule.Name } }
  return $null
}
function Get-Center($element) {
  if ($element.lat -and $element.lon) { return @([double]$element.lat,[double]$element.lon) }
  if ($element.center) { return @([double]$element.center.lat,[double]$element.center.lon) }
  return @($null,$null)
}
function Get-Phone($tags) { if ($tags.phone) { return $tags.phone } if ($tags.'contact:phone') { return $tags.'contact:phone' } return '' }
function Repair-Utf8([string]$value) { if ([string]::IsNullOrWhiteSpace($value)) { return $value }; try { $latin=[Text.Encoding]::GetEncoding(28591); $fixed=[Text.Encoding]::UTF8.GetString($latin.GetBytes($value)); if ($fixed -match '�') { return $value }; return $fixed } catch { return $value } }

$rows = [System.Collections.Generic.List[object]]::new()
$seen = @{}
$overpassEndpoints = @('https://overpass.kumi.systems/api/interpreter','https://overpass-api.de/api/interpreter')
foreach ($city in $cities.Keys) {
  $lat,$lon = $cities[$city]
  $query = "[out:json][timeout:90];(nwr(around:20000,$lat,$lon)[name];);out center tags;"
  $result = $null
  foreach ($endpoint in $overpassEndpoints) {
    try { $result = Invoke-RestMethod -Uri $endpoint -Method Post -Body @{ data=$query } -ContentType 'application/x-www-form-urlencoded' -Headers @{ 'User-Agent'='EthioPages-public-discovery/0.1 contact=admin@ethiopages.com'; 'Accept'='application/json' }; break } catch { Write-Warning "OSM query failed for ${city} at ${endpoint}: $($_.Exception.Message)"; Start-Sleep -Seconds 4 }
  }
  if (-not $result) { Write-Warning "No public OSM result for ${city}"; continue }
  Start-Sleep -Seconds 3
  $cityCounts = @{}
  foreach ($element in $result.elements) {
    $tags = $element.tags
    if (-not $tags -or -not $tags.name) { continue }
    $category = Get-Category $tags
    if (-not $category) { continue }
    if (-not $cityCounts[$category]) { $cityCounts[$category] = 0 }
    if ($cityCounts[$category] -ge 20) { continue }
    $center = Get-Center $element
    $key = (($tags.name -replace '\s+',' ').Trim().ToLower() + '|' + $city.ToLower())
    if ($seen.ContainsKey($key)) { continue }
    $seen[$key] = $true; $cityCounts[$category]++
    $id = 'OSM-' + $element.type.ToUpper() + '-' + $element.id
    $website = if ($tags.website) { $tags.website } elseif ($tags.'contact:website') { $tags.'contact:website' } else { '' }
    $sourceUrl = "https://www.openstreetmap.org/$($element.type)/$($element.id)"
    $rows.Add([pscustomobject]@{ external_id=$id; name=(Repair-Utf8 $tags.name); category=$category; subcategory=(Repair-Utf8 (($tags.shop,$tags.amenity,$tags.tourism,$tags.office,$tags.craft,$tags.industrial | Where-Object { $_ } | Select-Object -First 1))); description=''; city=$city; region=''; neighborhood=(Repair-Utf8 $tags.'addr:suburb'); address=(Repair-Utf8 ((($tags.'addr:street'),($tags.'addr:housenumber') | Where-Object { $_ }) -join ' ')); landmark=''; latitude=$center[0]; longitude=$center[1]; phone=(Get-Phone $tags); whatsapp=($tags.'contact:whatsapp'); telegram=($tags.'contact:telegram'); email=$tags.email; website=$website; facebook=$tags.'contact:facebook'; instagram=$tags.'contact:instagram'; tiktok=''; opening_hours=$tags.opening_hours; price_range=''; services=''; amenities=''; image_url_1=''; image_url_2=''; image_url_3=''; image_credit=''; google_maps_url=''; tripadvisor_url=''; rating=''; review_count=''; source='OpenStreetMap'; source_url=$sourceUrl; verified='no'; status='draft'; featured='no' })
  }
}

# Preserve existing seed records, then add public-source discoveries without overwriting them.
$all = [System.Collections.Generic.List[object]]::new()
if (Test-Path $seed) { foreach ($r in (Import-Csv -LiteralPath $seed)) { $all.Add($r) } }
$existing = @{}; foreach ($r in $all) { $existing[(($r.name -replace '\s+',' ').Trim().ToLower() + '|' + $r.city.ToLower())] = $true }
foreach ($r in $rows) { $key=(($r.name -replace '\s+',' ').Trim().ToLower() + '|' + $r.city.ToLower()); if (-not $existing.ContainsKey($key)) { $all.Add($r); $existing[$key]=$true } }

$all | Export-Csv -LiteralPath $csvOut -NoTypeInformation -Encoding utf8
$data = Import-Csv $csvOut
$byCity = $data | Group-Object city | Sort-Object Name
$byCategory = $data | Group-Object category | Sort-Object Name
$bySource = $data | Group-Object source | Sort-Object Name
$missing = @{
  phone = @($data | Where-Object { [string]::IsNullOrWhiteSpace($_.phone) }).Count
  website = @($data | Where-Object { [string]::IsNullOrWhiteSpace($_.website) }).Count
  coordinates = @($data | Where-Object { [string]::IsNullOrWhiteSpace($_.latitude) -or [string]::IsNullOrWhiteSpace($_.longitude) }).Count
  hours = @($data | Where-Object { [string]::IsNullOrWhiteSpace($_.opening_hours) }).Count
  images = @($data | Where-Object { [string]::IsNullOrWhiteSpace($_.image_url_1) }).Count
}
$report = @('# EthioPages Public-Source Discovery Quality Report','',"Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')",'',"- Total rows: $($data.Count)","- Unique business/city records: $(($data | ForEach-Object { ($_.name.ToLower().Trim() + '|' + $_.city.ToLower().Trim()) } | Sort-Object -Unique).Count)","- New OpenStreetMap discoveries: $($rows.Count)","- Existing seed records retained: $((Import-Csv $seed).Count)","- Duplicate IDs: $((($data | Group-Object external_id | Where-Object Count -gt 1)).Count)",'', '## Missing fields',"- Missing phone: $($missing.phone)","- Missing website: $($missing.website)","- Missing coordinates: $($missing.coordinates)","- Missing opening hours: $($missing.hours)","- Missing images: $($missing.images)",'', '## Businesses per city')
foreach ($g in $byCity) { $report += "- $($g.Name): $($g.Count)" }
$report += @('', '## Businesses per category')
foreach ($g in $byCategory) { $report += "- $($g.Name): $($g.Count)" }
$report += @('', '## Results per source')
foreach ($g in $bySource) { $report += "- $($g.Name): $($g.Count)" }
$report += @('', '## Review notes','- All imported and discovered records are marked `draft`.','- OpenStreetMap data is source-linked; no Google Maps or TripAdvisor content was copied.','- Image fields remain blank unless a permitted image URL was available in the source.','- OSM coverage is uneven and is an estimate of public-source availability, not a complete Ethiopian business census.','- Recommended next step: add additional permitted official directories and business submissions, then run admin review before publishing.')
Set-Content -LiteralPath $reportOut -Value ($report -join "`n") -Encoding utf8
Write-Output "CSV: $csvOut"
Write-Output "REPORT: $reportOut"
Write-Output "TOTAL: $($data.Count)"
Write-Output "NEW_OSM: $($rows.Count)"
