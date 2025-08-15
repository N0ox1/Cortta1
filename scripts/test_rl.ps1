# scripts/test_rl.ps1
param(
  [string]$Url = "https://cortta1-afg9.vercel.app/api/barbershop/public/cortes-premium",
  [string]$Tenant = "tenant-default",
  [int]$N = 80
)
$ok = 0; $blocked = 0
for ($i=1; $i -le $N; $i++) {
  $code = curl.exe -s -H "X-Tenant-Id: $Tenant" -o NUL -w "%{http_code}" $Url
  if ($code -eq "200") { $ok++ } else { $blocked++ }
}
"OK: $ok"
"429: $blocked"
