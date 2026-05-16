import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tek set getir
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const kit = await prisma.surgeryKit.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true, name: true, utsCode: true,
                                dimension: true, brand: true,
                                category: { select: { name: true } },
                                setCategory: { select: { name: true } },
                            }
                        }
                    }
                }
            }
        });

        if (!kit) return NextResponse.json({ error: 'Set bulunamadı' }, { status: 404 });
        return NextResponse.json(kit);
    } catch (error) {
        return NextResponse.json({ error: 'Set getirilemedi' }, { status: 500 });
    }
}

// Set güncelle
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, items } = body;

        // Önce eski kalemleri sil, sonra yenilerini ekle (cascade replace)
        await prisma.surgeryKitItem.deleteMany({ where: { kitId: id } });

        const kit = await prisma.surgeryKit.update({
            where: { id },
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

        return NextResponse.json({ success: true, kit });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Set güncellenemedi' }, { status: 500 });
    }
}

// Set sil (soft delete)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.surgeryKit.update({
            where: { id },
            data: { isActive: false }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Set silinemedi' }, { status: 500 });
    }
}
