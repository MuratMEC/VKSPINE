import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tüm setleri getir
export async function GET() {
    try {
        const kits = await prisma.surgeryKit.findMany({
            where: { isActive: true },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                utsCode: true,
                                dimension: true,
                                brand: true,
                                category: { select: { name: true } },
                                setCategory: { select: { name: true } },
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(kits);
    } catch (error) {
        console.error('Setler getirilemedi:', error);
        return NextResponse.json({ error: 'Setler listelenemedi' }, { status: 500 });
    }
}

// Yeni set oluştur
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, items } = body;

        if (!name) {
            return NextResponse.json({ error: 'Set adı zorunludur.' }, { status: 400 });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Set en az bir ürün içermelidir.' }, { status: 400 });
        }

        const kit = await prisma.surgeryKit.create({
            data: {
                name,
                description: description || null,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: Number(item.quantity) || 1,
                        notes: item.notes || null,
                    }))
                }
            },
            include: { items: { include: { product: true } } }
        });

        return NextResponse.json({ success: true, kit }, { status: 201 });
    } catch (error: any) {
        console.error('Set oluşturma hatası:', error);
        return NextResponse.json({ error: error.message || 'Set oluşturulamadı' }, { status: 500 });
    }
}
