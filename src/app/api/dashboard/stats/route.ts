import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, subDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';

export async function GET() {
    try {
        const now = new Date();

        // 1. En Çok Giden Ürünler (Son 30 Gün)
        const thirtyDaysAgo = subDays(now, 30);
        const topProductsRaw = await prisma.stockMovement.groupBy({
            by: ['productId'],
            where: {
                type: 'OUT',
                createdAt: { gte: thirtyDaysAgo }
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        // Ürün isimlerini eşleştirmek için
        const productIds = topProductsRaw.map(p => p.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, utsCode: true }
        });

        const topProducts = topProductsRaw.map(tp => {
            const prod = products.find(p => p.id === tp.productId);
            // İsimleri biraz kısaltalım ki grafikte güzel dursun
            let shortName = prod?.name || 'Bilinmeyen Ürün';
            if (shortName.length > 25) shortName = shortName.substring(0, 25) + '...';

            return {
                name: shortName,
                uts: prod?.utsCode,
                miktar: tp._sum.quantity || 0
            };
        });

        // 2. Haftalık Stok Aktivitesi (Son 7 Günlük IN/OUT Karşılaştırması)
        const weeklyStats = [];
        for (let i = 6; i >= 0; i--) {
            const targetDate = subDays(now, i);
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

            const dailyMovements = await prisma.stockMovement.groupBy({
                by: ['type'],
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                _sum: { quantity: true }
            });

            const inQty = dailyMovements.find(m => m.type === 'IN')?._sum.quantity || 0;
            const outQty = dailyMovements.find(m => m.type === 'OUT')?._sum.quantity || 0;

            weeklyStats.push({
                date: format(startOfDay, 'dd MMM', { locale: tr }),
                Giriş: inQty,
                Çıkış: outQty
            });
        }

        // 3. Kritik SKT Sayısı ve Yaklaşanlar
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

        const expiringLots = await prisma.lotSerial.findMany({
            where: {
                quantity: { gt: 0 },
                expDate: { lte: ninetyDaysFromNow }
            },
            include: { product: true },
            orderBy: { expDate: 'asc' },
            take: 5
        });

        const criticalExpCount = await prisma.lotSerial.count({
            where: {
                quantity: { gt: 0 },
                expDate: { lte: ninetyDaysFromNow }
            }
        });

        // 4. Genel İstatistikler
        const activeLotCount = await prisma.lotSerial.count({ where: { quantity: { gt: 0 } } });
        const hospitalCount = await prisma.customer.count({ where: { isActive: true } });

        // Bu ayki ameliyat/çıkış sayısı
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const surgeryCount = await prisma.stockMovement.count({
            where: {
                type: 'OUT',
                createdAt: { gte: startOfMonth }
            }
        });

        return NextResponse.json({
            stats: {
                activeLots: activeLotCount,
                criticalExpiring: criticalExpCount,
                surgeriesThisMonth: surgeryCount,
                hospitals: hospitalCount
            },
            charts: {
                topProducts,
                weeklyStats
            },
            expiringList: expiringLots.map(lot => ({
                id: lot.id,
                productName: lot.product.name,
                uts: lot.product.utsCode,
                lotNo: lot.lotNo,
                quantity: lot.quantity,
                expDate: lot.expDate,
                daysLeft: Math.ceil((new Date(lot.expDate as Date).getTime() - now.getTime()) / (1000 * 3600 * 24))
            }))
        });

    } catch (error) {
        console.error("Dashboard veri hatası:", error);
        return NextResponse.json({ error: "Dashboard verileri alınamadı" }, { status: 500 });
    }
}
