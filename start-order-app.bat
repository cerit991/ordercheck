@echo off
chcp 65001 >nul
setlocal

set "ROOT=%~dp0"
set "LOCAL_IP="
set "PORT=3000"
set "DEFAULT_REMOTE_NAME=origin"
set "DEFAULT_REMOTE_URL=https://github.com/cerit991/ordercheck.git"

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

if exist ".git" (
    call :UpdateGitRepo || goto :GitError
)

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

goto :eof

:GitError
pause
exit /b 1

:UpdateGitRepo
set "FIRST_REMOTE="
for /f "usebackq tokens=1" %%R in (`git remote 2^>nul`) do (
    set "FIRST_REMOTE=%%R"
    goto :UpdateGitRepoHasRemote
)
if not defined FIRST_REMOTE (
    if defined DEFAULT_REMOTE_URL (
        echo Git remote bulunamadi. Varsayilan uzak depo ekleniyor...
        git remote add %DEFAULT_REMOTE_NAME% %DEFAULT_REMOTE_URL%
        if errorlevel 1 (
            echo Uzak depo ekleme basarisiz oldu.
            exit /b 1
        )
        set "FIRST_REMOTE=%DEFAULT_REMOTE_NAME%"
        goto :UpdateGitRepoHasRemote
    )
    echo Git remote bulunamadigi icin guncelleme atlandi.
    exit /b 0
)

:UpdateGitRepoHasRemote
echo Depodan en son degisiklikler cekiliyor...
git pull %FIRST_REMOTE%
if errorlevel 1 (
    echo Git guncellemesi basarisiz oldu. Lutfen mesajlari kontrol edin.
    exit /b 1
)
exit /b 0