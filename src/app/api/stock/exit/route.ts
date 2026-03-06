import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerId, doctorName, patientName, surgeryDate, notes, items } = body;

        // Validasyon
        if (!customerId || !doctorName || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'Müşteri (Hastane/Bayi), Doktor ve en az bir adet malzeme girmek zorunludur.' },
                { status: 400 }
            );
        }

        // Atomik işlem: Ya ameliyat tamamen düşer ya da hata anında iptal olur.
        const result = await prisma.$transaction(async (tx) => {
            // 1. Ana Ameliyat (Surgery) Kaydı
            const surgery = await tx.surgery.create({
                data: {
                    customerId,
                    doctorName,
                    patientName: patientName || null,
                    surgeryDate: surgeryDate ? new Date(surgeryDate) : new Date(),
                    notes: notes || 'Ameliyat Çıkışı',
                    status: 'completed'
                }
            });

            const createdLines = [];
            const createdMovements = [];

            // 2. Her bir kullanılan Lot için döngü
            for (const item of items) {
                if (!item.lotSerialId || !item.quantity) {
                    throw new Error('Ürün Lot seçimi ve Miktar zorunludur.');
                }

                const qtyToDeduct = Number(item.quantity);
                if (qtyToDeduct <= 0) {
                    throw new Error('Düşülecek miktar 0\'dan büyük olmalıdır.');
                }

                // Mevcut Lot durumunu kontrol et (stok var mı?)
                const currentLot = await tx.lotSerial.findUnique({
                    where: { id: item.lotSerialId },
                    include: { product: true }
                });

                if (!currentLot) {
                    throw new Error(`Lot kaydı bulunamadı (ID: ${item.lotSerialId}).`);
                }

                if (currentLot.quantity < qtyToDeduct) {
                    throw new Error(`Yetersiz stok! ${currentLot.product.name} (Lot: ${currentLot.lotNo}) için mevcut stok ${currentLot.quantity}, fakat siz ${qtyToDeduct} çıkış yapmak istediniz.`);
                }

                // A. Lot'tan miktarı düş
                await tx.lotSerial.update({
                    where: { id: item.lotSerialId },
                    data: {
                        quantity: currentLot.quantity - qtyToDeduct
                    }
                });

                // B. SurgeryLine (Ameliyatın içindeki kalem bağlantısı)
                const line = await tx.surgeryLine.create({
                    data: {
                        surgeryId: surgery.id,
                        lotSerialId: item.lotSerialId,
                        quantity: qtyToDeduct
                    }
                });
                createdLines.push(line);

                // C. StockMovement (Log - Çıkış Miktarı)
                const movement = await tx.stockMovement.create({
                    data: {
                        type: 'OUT',
                        lotId: item.lotSerialId,
                        productId: currentLot.productId,
                        customerId: customerId,
                        quantity: qtyToDeduct,
                        documentNo: surgery.id, // Log'un referansını Ameliyat ID'sine bağlıyoruz
                        notes: `Ameliyat Çıkışı (Dr. ${doctorName})`
                    }
                });
                createdMovements.push(movement);
            }

            return { surgery, createdLines, createdMovements };
        });

        return NextResponse.json({ success: true, message: "Ameliyat stok çıkışı başarıyla tamamlandı.", data: result }, { status: 201 });

    } catch (error: any) {
        console.error('Ameliyat çıkış hatası:', error);
        return NextResponse.json(
            { error: error.message || 'Stok düşümü sırasında kritik veritabanı hatası oluştu.' },
            { status: 500 }
        );
    }
}
