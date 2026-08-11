@echo off
echo =========================================
echo   Sistema de Controle de Estoque
echo =========================================
echo.
echo Iniciando Backend...
cd backend
start cmd /k "npm start"
echo.
echo ✅ Backend iniciado em http://localhost:3000
echo.
echo Aguarde 3 segundos e abra o frontend...
timeout /t 3
echo.
echo =========================================
echo Abra uma nova janela do navegador em:
echo    http://localhost:5500/frontend/
echo.
echo Ou use Live Server no VS Code:
echo - Clique direito em frontend/index.html
echo - Selecione "Open with Live Server"
echo =========================================
pause
