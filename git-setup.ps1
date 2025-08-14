# Script para configurar Git com novo repositório
Write-Host "Configurando Git para novo repositório..." -ForegroundColor Green

# Remover remote atual
git remote remove origin
Write-Host "Remote 'origin' removido" -ForegroundColor Yellow

# Adicionar novo remote
git remote add origin https://github.com/N0ox1/Cortta1.git
Write-Host "Novo remote 'origin' adicionado" -ForegroundColor Green

# Verificar remotes
Write-Host "Remotes configurados:" -ForegroundColor Cyan
git remote -v

# Fazer push para o novo repositório
Write-Host "Fazendo push para o novo repositório..." -ForegroundColor Green
git push -u origin main

Write-Host "Configuração concluída!" -ForegroundColor Green
