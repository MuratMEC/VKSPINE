# VK Spine MediStock — Sistem Dokümantasyonu

> Bu belge, sistemin nasıl çalıştığını, hangi teknolojileri kullandığını, tüm modül ve API'lerin ne yaptığını ve başka bir bilgisayara nasıl kurulacağını kapsamlı şekilde açıklar.

---

## 1. Genel Bakış

**VK Spine MediStock**, tıbbi cihaz ve cerrahi implant ürünlerinin stok takibini, lot/seri bazlı izlenebilirliğini ve ameliyat bazlı tüketim kaydını yöneten web tabanlı bir uygulamadır.

### Temel Özellikler
- Ürün tanımlama (ÜTS, barkod, SKT, SUT kodu desteği)
- Lot/Seri bazlı stok giriş (her lot için ayrı SKT ve fatura bilgisi)
- Ameliyat bazlı stok çıkış (Lot seçerek hasta/doktor kaydıyla)
- Çoklu alan arama (Ürün Adı, Barkod, Ölçü, Kategori, Set Kategorisi)
- Tedarikçi, Müşteri, Kategori ve Set Kategorisi yönetimi
- SKT alarmları (süresi yaklaşan/geçen ürünler)
- Kullanıcı yönetimi (Admin/User/Viewer rolleri)
- Veritabanı yedeği indirme
- Excel'den ürün içe aktarma ve XLSX dışa aktarma

---

## 2. Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Sürüm |
|--------|-----------|-------|
| **Framework** | Next.js (App Router) | 16.x |
| **UI Kütüphanesi** | Mantine UI | 8.x |
| **İkonlar** | Lucide React | 0.575+ |
| **CSS** | Tailwind CSS | 4.x |
| **Veritabanı** | SQLite (dosya tabanlı) | — |
| **ORM** | Prisma | 5.x |
| **Auth** | iron-session (cookie tabanlı) | 8.x |
| **Şifreleme** | bcryptjs | 3.x |
| **Excel İşlemleri** | xlsx (SheetJS) | 0.18+ |
| **Grafikler** | Recharts + Mantine Charts | — |
| **Runtime** | Node.js | 20+ LTS |

### Neden SQLite?
Sistem lokal (tek bilgisayarda) çalışacak şekilde tasarlanmıştır. SQLite, kurulum gerektirmeden `dev.db` dosyası olarak çalışır. Yedekleme = dosya kopyalama.

---

## 3. Proje Yapısı

```
VK-Spine-Stok-main/
├── prisma/
│   ├── schema.prisma      ← Veritabanı şeması (tüm tablolar)
│   └── seed.ts             ← İlk veri oluşturma scripti
├── src/
│   ├── app/
│   │   ├── api/            ← Tüm API endpoint'leri (REST)
│   │   │   ├── auth/       ← Login/Logout
│   │   │   ├── categories/ ← Kategori CRUD
│   │   │   ├── customers/  ← Müşteri CRUD
│   │   │   ├── products/   ← Ürün CRUD
│   │   │   ├── suppliers/  ← Tedarikçi CRUD
│   │   │   ├── stock/      ← Stok giriş/çıkış/hareketler/alarmlar
│   │   │   ├── users/      ← Kullanıcı yönetimi
│   │   │   ├── backup/     ← Veritabanı yedek indirme
│   │   │   ├── dashboard/  ← Dashboard istatistikleri
│   │   │   └── notifications/ ← Bildirimler
│   │   ├── ayarlar/        ← Sistem Ayarları (Kategori Yönetimi, Firma, Log, Backup)
│   │   ├── kullanicilar/   ← Kullanıcı yönetimi ekranı
│   │   ├── login/          ← Giriş sayfası
│   │   ├── musteriler/     ← Müşteri listesi ve yeni kayıt
│   │   ├── skt-alarmlari/  ← SKT (son kullanma) alarmları
│   │   ├── stok/           ← Stok mevcut, giriş, çıkış, hareketler
│   │   ├── tedarikciler/   ← Tedarikçi listesi ve yeni kayıt
│   │   ├── urunler/        ← Ürün listesi, yeni kayıt, düzenleme, Excel import
│   │   ├── layout.tsx      ← Ana layout (Sidebar + Header)
│   │   ├── page.tsx        ← Dashboard (ana sayfa)
│   │   └── globals.css     ← Global stiller
│   ├── components/
│   │   ├── Sidebar.tsx     ← Sol navigasyon menüsü
│   │   └── Header.tsx      ← Üst header
│   ├── lib/
│   │   └── prisma.ts       ← Prisma client singleton
│   └── middleware.ts       ← Auth middleware (oturum kontrolü)
├── .env                    ← Veritabanı bağlantı bilgisi
├── package.json            ← Bağımlılıklar ve script'ler
├── kurulum.bat             ← Windows kurulum batch dosyası
├── baslat.bat              ← Windows başlatma batch dosyası
└── dev.db                  ← SQLite veritabanı dosyası
```

---

## 4. Veritabanı Şeması

### Tablolar

| Tablo | Açıklama |
|-------|----------|
| **Category** | Ürün kategorileri (Omurga İmplantları, Travma vb.) |
| **Product** | Ürün kartları (ÜTS, barkod, SKU, fiyat, KDV vb.) |
| **Supplier** | Tedarikçi firmalar |
| **Customer** | Müşteriler / Hastaneler |
| **LotSerial** | Lot/Seri kayıtları (her giriş esnasında oluşturulur) |
| **StockMovement** | Stok hareketleri (GİRİŞ / ÇIKIŞ kayıtları) |
| **Surgery** | Ameliyat kayıtları (hasta, doktor, tarih) |
| **SurgeryLine** | Ameliyatta kullanılan malzeme satırları |
| **User** | Kullanıcı hesapları (e-posta, şifre, rol) |

### Stok Hesaplama Mantığı
Stok miktarı doğrudan tutulmaz. `LotSerial.quantity` alanı üzerinden hareket bazlı olarak güncellenir:
- **Giriş:** quantity artar
- **Çıkış:** quantity azalır

---

## 5. API Endpoint Listesi

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Kullanıcı girişi |
| POST | `/api/auth/logout` | Oturum sonlandırma |
| GET | `/api/categories` | Tüm kategoriler (ürün sayısıyla) |
| POST | `/api/categories` | Yeni kategori ekle |
| PUT | `/api/categories/:id` | Kategori güncelle |
| DELETE | `/api/categories/:id` | Kategori sil (bağlı ürün yoksa) |
| GET | `/api/products` | Tüm ürünler (kategori dahil) |
| POST | `/api/products` | Yeni ürün ekle |
| GET | `/api/products/:id` | Tek ürün detayı (hareket sayısıyla) |
| PUT | `/api/products/:id` | Ürün güncelle (hareket görmemişse) |
| GET | `/api/products/search` | Ürün arama |
| POST | `/api/products/import` | Excel'den toplu ürün içe aktarma |
| GET | `/api/suppliers` | Tüm tedarikçiler |
| POST | `/api/suppliers` | Yeni tedarikçi ekle |
| DELETE | `/api/suppliers/:id` | Tedarikçi sil |
| GET | `/api/customers` | Tüm müşteriler |
| POST | `/api/customers` | Yeni müşteri ekle |
| POST | `/api/stock/entry` | Stok girişi (fatura bazlı, çoklu kalem) |
| POST | `/api/stock/exit` | Stok çıkışı (ameliyat bazlı) |
| GET | `/api/stock/movements` | Stok hareketleri listesi |
| GET | `/api/stock/active-lots` | Stoğu olan aktif lotlar |
| GET | `/api/stock/alarms` | SKT alarmları |
| GET | `/api/dashboard/stats` | Dashboard istatistikleri |
| GET | `/api/backup` | Veritabanı yedeği indir |
| GET | `/api/users` | Kullanıcı listesi |
| POST | `/api/users` | Yeni kullanıcı oluştur |
| GET | `/api/notifications` | Bildirimler |

---

## 6. Yapılan Geliştirmeler Özeti

### İlk Kurulum
- Next.js + Prisma + SQLite altyapısı kuruldu
- Mantine UI ile modern arayüz tasarlandı
- Auth sistemi (iron-session + bcryptjs) eklendi
- Tüm temel modüller (ürün, stok, tedarikçi, müşteri) oluşturuldu

### Sonraki Geliştirmeler
- **Müşteri ve Tedarikçi Yönetimi**: Düzenleme ve güvenli silme (bağlı kayıt kontrolü) eklendi.
- **Set Kategorisi Modülü**: Tamamen yeni bir kategori katmanı eklendi ve ayarlar sayfasından yönetilebilir hale getirildi.
- **Çoklu Alan Araması**: Ürün, Depo, Giriş ve Çıkış ekranlarına 4 farklı kriterle (Ad/Barkod, Ölçü, Kategori, Set Kategori) anlık arama eklendi.
- **SKT (Son Kullanma Tarihi)**: Ürün bazlı sabit tarih yerine, **Stok Giriş** anında lot bazlı girilecek şekilde dinamikleştirildi.
- **Tarih Filtreleme**: Stok hareketleri için başlangıç ve bitiş tarihi bazlı raporlama eklendi.
- **Gelişmiş Validasyonlar**: Stokta olmayan ürünün çıkışının engellenmesi ve silme işlemi öncesi ilişki kontrolleri gibi kritik iş kuralları API seviyesinde güçlendirildi.

---

## 7. Yeni Bilgisayara Kurulum Rehberi

### Gereksinimler
- **Windows 10/11** (veya macOS/Linux)
- **Node.js 20+ LTS** — [nodejs.org](https://nodejs.org) adresinden indir

### Adım 1: Node.js Kurulumu
1. [Node.js İndirme Sayfası](https://nodejs.org) adresine git ve **LTS** sürümünü indir.
2. Kurulumu "varsayılan" ayarlarla tamamlayın.
3. Bilgisayarı yeniden başlatmanız gerekebilir.

### Adım 2: Proje Dosyalarını Kopyalama
1. `VK-Spine-Stok-main` klasörünü hedef bilgisayarın kalıcı bir yerine kopyalayın (örn: `Belgelerim`)

#### Yöntem A: Tam Otomatik Kurulum (Önerilen)
1. Proje klasöründeki `Tam_Otomatik_Kurulum.bat` dosyasına çift tıklayın.
2. Bu dosya; paketleri yükleyecek, veritabanını hazırlayacak ve sistemi otomatik başlatacaktır.

#### Yöntem B: Manuel Kurulum
1. Terminal/CMD açın ve proje klasörüne gidin.
2. `npm install` komutunu çalıştırın.
3. `npx prisma db push` komutunu çalıştırın.
4. `npm run dev` ile sistemi başlatın.

Tarayıcıda açın: **http://localhost:3000**

### Adım 6: Otomatik Başlatma (Her Açılışta)
Uygulamanın bilgisayar her açıldığında arka planda otomatik çalışmasını isterseniz:
1. `OTOMATIK_BASLAT_AYARLA.bat` dosyasına çift tıklayın.
2. Bu işlem, Windows Başlangıç klasörüne bir kısayol ekleyecektir.
3. Artık bilgisayar her açıldığında sistem otomatik olarak çalışacak ve siz sadece tarayıcıdan adrese girerek kullanabileceksiniz.

### Adım 5: İlk Giriş
- **E-posta:** `admin@vkspine.com`
- **Şifre:** `123456`

### Veritabanı Taşıma
Mevcut verilerinizi taşımak isterseniz, eski bilgisayardan `dev.db` dosyasını kopyalayıp yeni bilgisayardaki proje klasörüne yapıştırın. (`prisma/` dizinine değil, ana dizine veya `prisma/` içine — `.env` dosyasındaki `DATABASE_URL` yoluna göre).

---

## 8. Ortam Değişkenleri (.env)

```env
DATABASE_URL="file:./prisma/dev.db"
```

SQLite dosya yolu. PostgreSQL veya başka bir veritabanına geçmek için bu değeri ve `schema.prisma` içindeki `provider` alanını değiştirin.

---

## 9. Güncelleme ve Bakım

### Veritabanı Yedeği
Ayarlar → Veritabanı Yedeği sekmesinden `dev.db` dosyasının anlık kopyasını indirebilirsiniz.

### Güncelleme
```bash
git pull origin main
npm install
npx prisma generate
npx prisma db push
```
Veya `3_Guncelle_Silmeden.bat` kullanın.

---

## 10. Bilinen Kurallar ve Kısıtlamalar

| Kural | Açıklama |
|-------|----------|
| Ürün düzenleme | Sadece stok hareketi görmemiş ürünler düzenlenebilir |
| Kategori silme | Bağlı ürünü olan kategoriler silinemez |
| Tedarikçi silme | İlişkili lot/hareket yoksa silinebilir |
| ÜTS, SKU, Barkod | Benzersiz (unique) olmalıdır, çift kayıt engellidir |
| Ameliyat kaydı | Oluşturulduktan sonra silinemez (izlenebilirlik) |

---

## 11. Önerilen Geliştirmeler ve Eksiklikler

Sistemin daha profesyonel ve hatasız çalışması için şu özellikler gelecekte eklenebilir:

1.  **Barkod Okuyucu Entegrasyonu**: Kamera veya el terminali ile doğrudan barkod okutarak ürün seçimi yapılması (Hız sağlar).
2.  **Dashboard Kritik Stok Kartları**: Sadece tabloda değil, ana ekranda "Kritik Stoktaki Ürünler" ve "Bugünkü Ameliyatlar" gibi anlık bilgi kartları.
3.  **PDF Raporlama**: Excel'e ek olarak, hastaneye teslim edilecek ameliyat tüketim formlarının PDF formatında çıktısının alınması.
4.  **Bulut Yedekleme**: Veritabanının sadece yerel değil, Google Drive veya Dropbox gibi bir servise otomatik yedeklenmesi.
5.  **Gelişmiş Firma Ayarları**: Dashboard'da ve raporlarda görünecek firma logosunun ve başlığının ayarlar sayfasından değiştirilebilmesi.
6.  **Bildirim Sistemi**: SKT'si geçen ürünler için tarayıcı bildirimi veya e-posta gönderimi.
