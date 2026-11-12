# Windows'ta Çalıştırma

## En kolay yöntem

1. Bilgisayarınızda Docker Desktop kurulu değilse kurun.
2. Docker Desktop'ı açın ve sol altta **Engine running** yazmasını bekleyin.
3. Proje klasöründeki `start_windows.bat` dosyasına çift tıklayın.
4. İlk kurulumda imajlar indirileceği için birkaç dakika bekleyin.
5. Tarayıcı otomatik açılmazsa `http://localhost:3000` adresine gidin.

Demo yönetici girişi:

```text
E-posta: admin@solargrid.local
Şifre: Admin123!
```

## Projeyi durdurma

`stop_windows.bat` dosyasına çift tıklayın. Bu işlem veritabanı verilerini silmez.

## Durumu kontrol etme

Proje klasöründe PowerShell açıp şu komutu çalıştırın:

```powershell
docker compose ps
```

Üç servisin de çalıştığını görmelisiniz: `postgres`, `backend`, `frontend`.

## Hata kayıtları

```powershell
docker compose logs --tail=200
```

Sadece backend kayıtları:

```powershell
docker compose logs backend --tail=200
```

## Temiz kurulum

Aşağıdaki işlem kayıtlı demo verilerini siler ve sistemi ilk hâline döndürür:

```powershell
docker compose down -v
docker compose up --build -d
```

