@echo off
title Barbearia SaaS - Iniciando Sistema
color 0A

echo.
echo ========================================
echo    BARBEARIA SAAS - INICIANDO SISTEMA
echo ========================================
echo.

echo Configurando variaveis de ambiente...
set DATABASE_URL=postgresql://postgres:Vitor160201!@localhost:5432/barbearia_saas

echo.
echo Iniciando servidor...
echo.
echo Aguarde, o sistema esta sendo iniciado...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Páginas disponíveis:
echo - Home: http://localhost:3000
echo - Contato: http://localhost:3000/contact
echo - Login: http://localhost:3000/login
echo - Cadastro: http://localhost:3000/register
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

cd /d "C:\Users\Usuário\CURSOR"
npm run dev

pause 