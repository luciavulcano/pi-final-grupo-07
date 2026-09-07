@echo off
title FastDelivery - Projeto Academico
echo =====================================
echo        FASTDELIVERY - BACKEND
echo =====================================
echo.
where mvn >nul 2>nul
if errorlevel 1 (
    echo Maven nao foi encontrado no PATH.
    echo Abra o projeto em uma IDE com suporte a Maven ou instale o Maven.
    pause
    exit /b 1
)
call mvn spring-boot:run
pause
