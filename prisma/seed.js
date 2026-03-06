const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
      contactName: 'Ahmet Yılmaz',
      phone: '0555 123 4567',
    },
  });

  // 3. Müşteri (Hastane/Kurum) Ekle
  const hospital1 = await prisma.customer.create({
    data: {
      name: 'Memorial Şişli Hastanesi',
      contactName: 'Satınalma Dept.',
      phone: '0212 555 1234',
    },
  });

  // 4. Ürünler Ekle
  const product1 = await prisma.product.create({
    data: {
      barcode: '8691234567890',
      utsCode: 'UTS-PLATIN-001',
      name: 'Titanyum Pedikül Vidası 5x45mm',
      brand: 'VK Spine PRO',
      productType: 'tibbi_cihaz',
      categoryId: category1.id,
    },
  });

  // 5. Lot/Seri (Stok Girişi)
  const lot1 = await prisma.lotSerial.create({
    data: {
      productId: product1.id,
      lotNo: 'LOT202603',
      expirationDate: new Date('2028-03-01T00:00:00Z'),
      supplierId: supplier1.id,
      initialQuantity: 100,
      currentQuantity: 100,
      shelfLocation: 'A-12',
    },
  });

  // 6. İlk Stok Hareketi (Mal Kabul)
  await prisma.stockMovement.create({
    data: {
      lotSerialId: lot1.id,
      productId: product1.id,
      movementType: 'IN',
      quantity: 100,
      newQty: 100,
      referenceNo: 'FAT-2026-001',
      description: 'Tedarikçiden ilk giriş',
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
