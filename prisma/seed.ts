import "dotenv/config";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Veritabanına örnek veriler ekleniyor...");

    // 1. Kategoriler Ekle
    const category1 = await prisma.category.create({
        data: { name: 'İmplant / Platin' },
    });

    const category2 = await prisma.category.create({
        data: { name: 'Cerrahi Sarf Malzemesi' },
    });

    // 2. Tedarikçiler Ekle
    const supplier1 = await prisma.supplier.create({
        data: {
            companyName: 'Medikal Üretim A.Ş.',
            contactPerson: 'Ahmet Yılmaz',
            phone: '0555 123 4567',
        },
    });

    // 3. Müşteri (Hastane/Kurum) Ekle
    const hospital1 = await prisma.customer.create({
        data: {
            name: 'Memorial Şişli Hastanesi',
            contactPerson: 'Satınalma Dept.',
            phone: '0212 555 1234',
        },
    });

    // 4. Ürünler Ekle
    const product1 = await prisma.product.create({
        data: {
            barcode: '8691234567890',
            utsCode: 'UTS-PLATIN-001',
            name: 'Titanyum Pedikül Vidası',
            dimension: '5.5 x 45mm', // Yeni eklenen alan
            brand: 'VK Spine PRO',
            categoryId: category1.id,
            purchasePrice: 1500,
            salesPrice: 4500,
            currency: 'TRY',
            isSterile: true,
        },
    });

    const lot1 = await prisma.lotSerial.create({
        data: {
            productId: product1.id,
            lotNo: 'LOT202603',
            expDate: new Date('2028-03-01T00:00:00Z'),
            supplierId: supplier1.id,
            quantity: 100,
            shelfLocation: 'A-12',
        },
    });

    // 6. İlk Stok Hareketi (Mal Kabul)
    await prisma.stockMovement.create({
        data: {
            lotId: lot1.id,
            productId: product1.id,
            type: 'IN',
            quantity: 100,
            documentNo: 'FAT-2026-001',
            notes: 'Tedarikçiden ilk giriş',
        },
    });

    console.log("Örnek veriler başarıyla eklendi.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
