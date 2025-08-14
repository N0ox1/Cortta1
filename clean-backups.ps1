# Script para remover pastas de backup com DATABASE_URLs reais
Write-Host "🧹 Removendo pastas de backup..." -ForegroundColor Yellow

# Listar pastas de backup
$backupDirs = Get-ChildItem -Directory | Where-Object {$_.Name -like "backup-*"}
Write-Host "Pastas encontradas:" -ForegroundColor Cyan
$backupDirs | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }

# Remover cada pasta
foreach ($dir in $backupDirs) {
    Write-Host "Removendo $($dir.Name)..." -ForegroundColor Red
    Remove-Item -Recurse -Force $dir.FullName -ErrorAction SilentlyContinue
    if (Test-Path $dir.FullName) {
        Write-Host "  ❌ Falhou ao remover $($dir.Name)" -ForegroundColor Red
    } else {
        Write-Host "  ✅ $($dir.Name) removida com sucesso" -ForegroundColor Green
    }
}

Write-Host "🧹 Limpeza concluída!" -ForegroundColor Green
