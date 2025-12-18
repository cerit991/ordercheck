# Order Check

Bu proje, restoran satın alma süreçlerinde ürün taleplerini toplamak ve PDF ile e-posta üzerinden paylaşmak için hazırlanmış basit bir web uygulamasıdır.

## Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/cerit991/ordercheck.git
   cd ordercheck
   ```
2. `.env` dosyanızı aşağıdaki örneğe göre oluşturun:
   ```env
   SENDER_EMAIL=kendi mailini gireceksin 
   SENDER_PASSWORD=https://myaccount.google.com/apppasswords ## bu bağlantıdan uygulama şifresi alınacak size özel verilen şifreyi bu kısma girmeniz yeterli.
   RECIPIENT_EMAIL=buraya şirket maili girebilirsin departmanlar siparişleri bu mail e gönderecek program vasıtası ile 
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   ```
3. Windows'ta `start-order-app.bat` dosyasını çalıştırın. Script gerekli bağımlılıkları yükler, sunucuyu başlatır ve tarayıcıyı doğru adrese yönlendirir.

> Not: Sunucuyu ilk defa çalıştırıyorsanız Windows güvenlik duvarının Node.js bağlantısına izin verdiğinden emin olun.

## Manuel Başlatma (isteğe bağlı)

`start-order-app.bat` yerine manuel olarak çalıştırmak isterseniz:

```bash
npm install
npm start
```

Uygulama varsayılan olarak `http://localhost:3000/` adresinde çalışır.

## PDF ve E-posta

- Önce ürünleri listeden seçin, miktarları girin ve PDF ön izlemesini açın.
- `Mail Gönder` butonu, `.env` dosyasındaki SMTP bilgilerini kullanarak PDF'yi ekli halde gönderir.
- Gönderilen her sipariş `orders/` klasörüne tarih ve departman bilgisiyle `.txt` dosyası olarak kaydedilir (git'e dahil edilmez).