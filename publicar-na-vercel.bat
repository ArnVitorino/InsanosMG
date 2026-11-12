@echo off
title Publicar INSANOS M.C. na Vercel
color 0A
cls
echo ==============================================================
echo       INSANOS M.C. - PUBLICAR SITE/APP NA VERCEL (ONLINE 24H)
echo ==============================================================
echo.
echo Este script vai publicar o aplicativo diretamente na Vercel,
echo sem precisar passar pelo GitHub!
echo.
echo INSTRUCOES RAPIDAS:
echo 1. Se pedir login, selecione Email ou GitHub (ele abrira o navegador).
echo 2. Nas perguntas que aparecerem no terminal, basta apertar [ENTER] em cada uma.
echo.
pause
call npx vercel --prod
echo.
echo ==============================================================
echo Processo finalizado! O link oficial do seu site esta acima (Production).
echo ==============================================================
pause

