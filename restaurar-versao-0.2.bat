@echo off
title Restaurar Versao 0.2 - INSANOS M.C.
echo ====================================================
echo      RESTAURAR VERSAO 0.2 - INSANOS M.C.
echo   (Versao com o Fundo Oficial da Divisao Mogi Guacu)
echo ====================================================
echo.
echo Deseja restaurar a Versao 0.2?
echo.
pause
node restore-v0.2.js
echo.
echo Reconstruindo o aplicativo...
cd client
call npm run build
cd ..
echo ====================================================
echo Versao 0.2 restaurada com sucesso!
echo ====================================================
pause

