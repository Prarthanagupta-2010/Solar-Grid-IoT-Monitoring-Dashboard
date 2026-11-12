@echo off
setlocal
cd /d "%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker Desktop bulunamadi. Lutfen Docker Desktop kurun ve yeniden deneyin.
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo Docker Desktop calismiyor. Docker Desktop'i acip yeniden deneyin.
  pause
  exit /b 1
)

echo SolarGrid baslatiliyor...
docker compose up --build -d
if errorlevel 1 (
  echo Proje baslatilamadi. Hata ayrintilari icin: docker compose logs
  pause
  exit /b 1
)

echo.
echo Uygulama: http://localhost:3010
echo API Docs : http://localhost:8080/swagger-ui.html
echo Giris    : admin@solargrid.local / Admin123!
start "" http://localhost:3010
pause

