import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tek bir tedarikçiyi sil (DELETE)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Tedarikçiye bağlı lot/stok hareketi var mı kontrol et
        const relatedLots = await prisma.lotSerial.count({ where: { supplierId: id } });
        const relatedMovements = await prisma.stockMovement.count({ where: { supplierId: id } });

        if (relatedLots > 0 || relatedMovements > 0) {
            return NextResponse.json(
                { error: "Bu tedarikçiye bağlı stok kayıtları var. Önce ilişkili kayıtları silin veya tedarikçiyi pasif yapın." },
                { status: 400 }
            );
        }

        await prisma.supplier.delete({ where: { id } });

        return NextResponse.json({ message: "Tedarikçi başarıyla silindi." });
    } catch (error: any) {
        console.error("Tedarikçi silinirken hata:", error);
        return NextResponse.json({ error: "Tedarikçi silinemedi." }, { status: 500 });
    }
}

// Tek bir tedarikçiyi getir (GET)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supplier = await prisma.supplier.findUnique({ where: { id } });

        if (!supplier) {
            return NextResponse.json({ error: "Tedarikçi bulunamadı." }, { status: 404 });
        }

        return NextResponse.json(supplier);
    } catch (error: any) {
        console.error("Tedarikçi getirilirken hata:", error);
        return NextResponse.json({ error: "Tedarikçi alınamadı." }, { status: 500 });
    }
}
