import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Set kategorisini güncelle
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!body.name || body.name.trim().length === 0) {
            return NextResponse.json({ error: "Set Kategori adı boş olamaz." }, { status: 400 });
        }

        const updatedSetCategory = await prisma.setCategory.update({
            where: { id },
            data: { name: body.name.trim() }
        });

        return NextResponse.json(updatedSetCategory);
    } catch (error) {
        console.error("Set Kategorisi güncellenirken hata:", error);
        return NextResponse.json({ error: "Set Kategorisi güncellenemedi." }, { status: 500 });
    }
}

// Set kategorisini sil
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Set kategorisine bağlı ürün var mı kontrol et
        const productCount = await prisma.product.count({
            where: { setCategoryId: id }
        });

        if (productCount > 0) {
            return NextResponse.json(
                { error: "Bu set kategorisine bağlı ürünler var. Silmek için önce ürünlerin set kategorisini değiştirin." },
                { status: 400 }
            );
        }

        await prisma.setCategory.delete({ where: { id } });

        return NextResponse.json({ message: "Set Kategorisi silindi." });
    } catch (error) {
        console.error("Set Kategorisi silinirken hata:", error);
        return NextResponse.json({ error: "Set Kategorisi silinemedi." }, { status: 500 });
    }
}
