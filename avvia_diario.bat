@echo off
title Il Grimorio delle Memorie
echo ==========================================================
echo        AVVIO DEL GRIMORIO DELLE MEMORIE...
echo ==========================================================
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
