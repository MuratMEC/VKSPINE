# VK Spine Stok - Yeni Bilgisayara (Windows 11) Kurulum Rehberi

Bu belge, sistemi ilk defa bir müşteri veya personel bilgisayarına kurmanız gerektiğinde izlemeniz gereken 3 basit adımı anlatmaktadır.

## Adım 1: Node.js (Altyapı) Kurulumu

Sistemin çalışabilmesi için bilgisayarda **Node.js** yüklü olmak zorundadır.

1. Şu linke tıklayarak resmi web sitesine gidin: **[Node.js İndirme Sayfası (LTS Sürümü)](https://nodejs.org/en/download/prebuilt-installer)**
2. Sayfada "Windows Installer" veya "Download Node.js (LTS)" yazan (Şu anki önerilen kararlı sürüm **v20.x** veya **v22.x** LTS) butonuna basarak indirin.
3. İnen `.msi` dosyasına çift tıklayın ve hiçbir ayarı değiştirmeden sürekli **Next (İleri)** diyerek kurulumu bitirin.

## Adım 2: Proje Dosyalarını Taşıma

1. Kurulumu tamamladıktan sonra, bu bulunduğunuz klasörü (Yani `VK Spine Stok` klasörünü) müşterinin bilgisayarında silinmeyecek kalıcı bir yere (Örneğin: `Belgelerim` klasörüne) kopyalayın.

## Adım 3: Sistemi Hazırlama (İlk ve Tek Seferlik)

Sistemi bilgisayara tanıtmak, paketleri indirmek ve veritabanını ayağa kaldırmak için hazırladığım `kurulum.bat` dosyasını çalıştıracağız.

1. Taşıdığınız proje klasörüne (`VK Spine Stok`) girin.
2. Klasör içindeki **`kurulum.bat`** isimli dosyaya çift tıklayın.
3. Siyah bir komut ekranı açılacak ve sırasıyla işlemleri yapacak. (İnternet hızınıza göre 1-3 dakika sürebilir).
4. Ekranda _"Kurulum Tamamlandi!"_ yazısını görene kadar bekleyin ve pencereyi onaylayıp kapatın.

---

## 🚀 Sistemi Kullanmaya Başlama (Günlük Kullanım)

Artık kurulum bitti! Müşteriniz veya personeliniz sisteme girmek istediğinde sadece şu iki adımı uygulayacak:

1. Proje klasöründeki **`baslat.bat`** dosyasına çift tıklayacak. (Arka planda siyah bir servis penceresi açılır, **bunu kapatmamalıdır**)
2. İstediği herhangi bir web tarayıcısını (Chrome, Edge, Safari vb.) açıp adres çubuğuna şunu yazacak:

   👉 **`http://localhost:3000`**

Giriş ekranı açıldıktan sonra ilk olarak e-posta: `admin@vkspine.com` ve şifre `123456` yazarak sisteme giriş yapılabilir. Sistem, ilk girişte bu yönetici hesabını otomatik olarak kalıcı bir şekilde veritabanına kaydedecektir.
