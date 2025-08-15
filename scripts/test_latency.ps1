# scripts/test_latency.ps1
param(
  [string]$Url = "https://cortta1-afg9.vercel.app/api/barbershop/public/cortes-premium",
  [string]$Tenant = "tenant-default",
  [int]$N = 50
)
$times = @()
for ($i=1; $i -le $N; $i++) {
  $o = curl.exe -s -H "X-Tenant-Id: $Tenant" -o NUL -w "%{time_total}" $Url
  $times += [double]$o
}
$avg = ($times | Measure-Object -Average).Average
$sorted = $times | Sort-Object
$p95Index = [int]([math]::Floor(0.95 * $N)) - 1
if ($p95Index -lt 0) { $p95Index = 0 }
$p95 = $sorted[$p95Index]
"avg(s): {0:N4}" -f $avg
"p95(s): {0:N4}" -f $p95
