@echo off
chcp 65001 >nul
setlocal

set "ROOT=%~dp0"
set "LOCAL_IP="
set "PORT=3000"

:: Yerel IP adresini bul (PowerShell ile)
for /f "usebackq tokens=*" %%I in (`powershell -NoLogo -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^(127|169\.254)\.' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1 -ExpandProperty IPAddress"`) do set "LOCAL_IP=%%I"

:: PowerShell bulamazsa ipconfig ile dene
if not defined LOCAL_IP (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
        for /f "tokens=1" %%b in ("%%a") do (
            if not defined LOCAL_IP set "LOCAL_IP=%%b"
        )
    )
)

:: Hala bulunamazsa localhost kullan
if not defined LOCAL_IP (
    set "LOCAL_IP=127.0.0.1"
)

cls
echo.
echo  ===========================================================
echo.
echo                SIPARIS FORMU SUNUCUSU
echo.
echo  ===========================================================
echo.
echo    Bilgisayar:  http://localhost:%PORT%
echo.
echo    Telefon:     http://%LOCAL_IP%:%PORT%
echo.
echo  ===========================================================
echo.
echo    Telefondan baglanmak icin ayni WiFi aginda olun
echo    ve yukaridaki IP adresini tarayiciya yazin.
echo.
echo    Kapatmak icin: CTRL+C veya pencereyi kapatin
echo.
echo  ===========================================================
echo.

cd /d "%ROOT%"

if not exist "node_modules" (
    echo Gerekli paketler yukleniyor. Lutfen bekleyin...
    call npm install
    if errorlevel 1 (
        echo Paketler yuklenirken bir hata olustu. Mesaji kontrol edin ve tekrar deneyin.
        pause
        exit /b 1
    )
)

:: 3 saniye sonra tarayiciyi ac
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:%PORT%/"

:: Sunucuyu baslat
npm start

echo.
echo Sunucu durdu.
pause