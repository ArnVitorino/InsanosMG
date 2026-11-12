@echo off
title Restaurar Versao 0.1 - INSANOS M.C.
echo ====================================================
echo      RESTAURAR VERSAO 0.1 - INSANOS M.C.
echo ====================================================
echo.
echo Deseja restaurar a Versao 0.1 original?
echo Todas as alteracoes posteriores serao substituidas pela v0.1.
echo.
pause
node restore-v0.1.js
echo.
echo Reconstruindo o aplicativo...
cd client
call npm run build
cd ..
echo ====================================================
echo Versao 0.1 restaurada com sucesso!
echo ====================================================
pause

