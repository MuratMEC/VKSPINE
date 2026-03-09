import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Kategori güncelle
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!body.name || body.name.trim().length === 0) {
            return NextResponse.json({ error: "Kategori adı boş olamaz." }, { status: 400 });
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: { name: body.name.trim() }
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("Kategori güncellenirken hata:", error);
        return NextResponse.json({ error: "Kategori güncellenemedi." }, { status: 500 });
    }
}

// Kategori sil
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Kategoriye bağlı ürün var mı kontrol et
        const productCount = await prisma.product.count({
            where: { categoryId: id }
        });

        if (productCount > 0) {
            return NextResponse.json(
                { error: "Bu kategoriye bağlı ürünler var. Silmek için önce ürünlerin kategorisini değiştirin." },
                { status: 400 }
            );
        }

        await prisma.category.delete({ where: { id } });

        return NextResponse.json({ message: "Kategori silindi." });
    } catch (error) {
        console.error("Kategori silinirken hata:", error);
        return NextResponse.json({ error: "Kategori silinemedi." }, { status: 500 });
    }
}
