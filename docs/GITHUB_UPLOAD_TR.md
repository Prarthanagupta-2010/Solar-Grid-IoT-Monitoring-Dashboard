# GitHub'a Yükleme

## 1. GitHub'da repository oluşturun

GitHub'da **New repository** seçeneğine tıklayın.

- Repository name: `solargrid-iot-monitoring-dashboard`
- Visibility: Public
- README, `.gitignore` veya License eklemeyin; bunlar projede hazırdır.

## 2. Proje klasöründe PowerShell açın

ZIP dosyasını çıkardıktan sonra `solargrid-iot-monitoring-dashboard` klasörüne girin. Adres çubuğuna `powershell` yazıp Enter'a basın.

## 3. Git komutlarını çalıştırın

`KULLANICI_ADINIZ` bölümünü kendi GitHub kullanıcı adınızla değiştirin.

```powershell
git init -b main
git add .
git commit -m "Build SolarGrid IoT monitoring platform"
git remote add origin https://github.com/KULLANICI_ADINIZ/solargrid-iot-monitoring-dashboard.git
git push -u origin main
```

## 4. GitHub açıklaması

Repository açıklaması olarak şunu kullanabilirsiniz:

```text
A full-stack smart solar grid platform that streams IoT telemetry, detects anomalies, generates alerts, and visualizes energy production and device health.
```

Önerilen topic'ler:

```text
java spring-boot react postgresql websocket iot smart-grid solar-energy cybersecurity docker anomaly-detection
```

