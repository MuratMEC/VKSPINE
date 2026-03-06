import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const now = new Date();
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

        // Kritik SKT (Son 90 Gün)
        const expiringLots = await prisma.lotSerial.findMany({
            where: {
                quantity: { gt: 0 },
                expDate: { lte: ninetyDaysFromNow }
            },
            include: { product: true },
            orderBy: { expDate: 'asc' },
            take: 10
        });

        // Kritik Stok (minStockLvl altındaki ürünler)
        // Öncelikle stokları toplayalım
        const productsWithStock = await prisma.product.findMany({
            include: {
                lotSerials: {
                    where: { quantity: { gt: 0 } }
                }
            }
        });

        const lowStockProducts = productsWithStock
            .map(product => {
                const totalQuantity = product.lotSerials.reduce((sum, lot) => sum + lot.quantity, 0);
                return {
                    ...product,
                    totalQuantity
                };
            })
            .filter(p => p.totalQuantity <= p.minStockLvl)
            // lotSerials listesini dışarı atmak isterseniz burada mapping yapabilirsiniz:
            .map(p => ({
                id: p.id,
                name: p.name,
                utsCode: p.utsCode,
                totalQuantity: p.totalQuantity,
                minStockLvl: p.minStockLvl
            }))
            .slice(0, 10);

        return NextResponse.json({
            expiringList: expiringLots.map(lot => ({
                id: lot.id,
                productName: lot.product.name,
                lotNo: lot.lotNo,
                quantity: lot.quantity,
                expDate: lot.expDate,
                daysLeft: Math.ceil((new Date(lot.expDate as Date).getTime() - now.getTime()) / (1000 * 3600 * 24))
            })),
            lowStockList: lowStockProducts
        });

    } catch (error) {
        console.error("Bildirim servisi hatası:", error);
        return NextResponse.json({ error: "Bildirimler alınamadı" }, { status: 500 });
    }
}
