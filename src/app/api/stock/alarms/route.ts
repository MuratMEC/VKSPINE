import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const today = new Date();
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(today.getDate() + 90);

        // STOKTA OLAN VE SKT'Sİ YAKLAŞAN/GEÇEN ÜRÜNLERİ GETİR
        const lots = await prisma.lotSerial.findMany({
            where: {
                quantity: { gt: 0 },
                expDate: { not: null }
            },
            include: {
                product: {
                    select: { name: true, sku: true, brand: true, category: { select: { name: true } } }
                }
            },
            orderBy: {
                expDate: 'asc'
            }
        });

        // Veriyi Kategorize Et
        const expired: any[] = [];          // SKT Geçmiş
        const critical: any[] = [];         // 30 Günden az kalmış
        const warning: any[] = [];          // 30-90 Gün arası kalmış

        lots.forEach((lot) => {
            if (!lot.expDate) return;

            const expDate = new Date(lot.expDate);
            const timeDiff = expDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

            const alarmItem = {
                id: lot.id,
                productId: lot.productId,
                productName: lot.product.name,
                sku: lot.product.sku,
                brand: lot.product.brand,
                category: lot.product.category?.name,
                lotNo: lot.lotNo,
                quantity: lot.quantity,
                expDate: lot.expDate,
                daysLeft: daysLeft
            };

            if (daysLeft < 0) {
                expired.push(alarmItem);
            } else if (daysLeft <= 30) {
                critical.push(alarmItem);
            } else if (daysLeft <= 90) {
                warning.push(alarmItem);
            }
        });

        return NextResponse.json({
            summary: {
                expiredCount: expired.length,
                criticalCount: critical.length,
                warningCount: warning.length
            },
            expired,
            critical,
            warning
        });

    } catch (error) {
        console.error("SKT Alarmları alınırken hata:", error);
        return NextResponse.json({ error: "SKT Alarmları yüklenemedi." }, { status: 500 });
    }
}
