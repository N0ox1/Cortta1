# scripts/test_smoke.ps1
param(
  [string]$BaseUrl = "https://cortta1-afg9.vercel.app",
  [string]$Tenant = "tenant-default"
)
$H = "$BaseUrl/api/barbershop/public/cortes-premium"

"Health:"
curl.exe -si -H "X-Tenant-Id: $Tenant" "$BaseUrl/api/health" | Select-Object -First 5

"`nPrimeira (DB esperado):"
curl.exe -si -H "X-Tenant-Id: $Tenant" $H | Select-String -Pattern "HTTP/|X-Cache-Source|Cache-Control|X-Tenant-Id"

"`nSegunda (Redis/CDN esperado):"
curl.exe -si -H "X-Tenant-Id: $Tenant" $H | Select-String -Pattern "HTTP/|X-Cache-Source|Cache-Control|X-Tenant-Id"
