import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { supplierId, invoiceNo, entryDate, notes, items } = body;

        // Validasyon
        if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'Tedarikçi ve en az bir kalem ürün eklemek zorunludur.' },
                { status: 400 }
            );
        }

        // Atomik işlem (Transaction): Ya hepsi kaydolur, ya hiçbiri.
        const result = await prisma.$transaction(async (tx) => {
            const createdLots = [];
            const createdMovements = [];

            for (const item of items) {
                if (!item.productId || !item.quantity) {
                    throw new Error('Ürün ve Miktar zorunludur. (Eksik satır var)');
                }

                const qty = Number(item.quantity);
                if (qty <= 0) {
                    throw new Error('Miktar 0\'dan büyük olmalıdır.');
                }

                // lotNo yoksa otomatik oluştur
                const lotNo = item.lotNo || `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

                // 1. LotSerial Kaydı (Parti Oluşturma)
                const lot = await tx.lotSerial.create({
                    data: {
                        productId: item.productId,
                        supplierId: supplierId,
                        lotNo: lotNo,
                        expDate: item.expDate ? new Date(item.expDate) : null,
                        invoiceNo: invoiceNo,
                        entryDate: entryDate ? new Date(entryDate) : new Date(),
                        quantity: qty,
                    },
                });
                createdLots.push(lot);

                // 2. StockMovement Kaydı (Tarihçe)
                const movement = await tx.stockMovement.create({
                    data: {
                        type: 'IN', // 'GİRİŞ' yerine Prisma enum/standart uyumu için 'IN' kullanıldı (schema uyumu)
                        lotId: lot.id,
                        productId: item.productId,
                        supplierId: supplierId,
                        quantity: qty,
                        documentNo: invoiceNo,
                        notes: notes || 'Fatura ile Mal Kabul',
                    },
                });
                createdMovements.push(movement);

                // 3. (Opsiyonel) Ürünün ana alış fiyatını güncelleme
                if (item.purchasePrice) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { purchasePrice: Number(item.purchasePrice) }
                    });
                }
            }

            return { createdLots, createdMovements };
        });

        return NextResponse.json({ success: true, message: "Stok girişi başarıyla faturalandı.", data: result }, { status: 201 });

    } catch (error: any) {
        console.error('Stok giriş hatası:', error);
        return NextResponse.json(
            { error: error.message || 'Stok girişi sırasında bir veritabanı hatası oluştu.' },
            { status: 500 }
        );
    }
}
