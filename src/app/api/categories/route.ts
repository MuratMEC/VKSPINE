import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { products: true } }
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Kategoriler alınırken hata:", error);
        return NextResponse.json({ error: "Kategoriler yüklenemedi." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name || body.name.trim().length === 0) {
            return NextResponse.json({ error: "Kategori adı boş olamaz." }, { status: 400 });
        }

        const newCategory = await prisma.category.create({
            data: {
                name: body.name.trim(),
                isActive: true
            }
        });

        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("Kategori oluşturulurken hata:", error);
        return NextResponse.json({ error: "Kategori oluşturulamadı. Belki aynı isimde bir kategori zaten vardır." }, { status: 500 });
    }
}
