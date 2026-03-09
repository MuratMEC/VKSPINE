import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const setCategories = await prisma.setCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { products: true } }
            }
        });

        return NextResponse.json(setCategories);
    } catch (error) {
        console.error("Set Kategorileri alınırken hata:", error);
        return NextResponse.json({ error: "Set Kategorileri yüklenemedi." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name || body.name.trim().length === 0) {
            return NextResponse.json({ error: "Set Kategori adı boş olamaz." }, { status: 400 });
        }

        const newSetCategory = await prisma.setCategory.create({
            data: {
                name: body.name.trim(),
                isActive: true
            }
        });

        return NextResponse.json(newSetCategory, { status: 201 });
    } catch (error) {
        console.error("Set Kategorisi oluşturulurken hata:", error);
        return NextResponse.json({ error: "Set Kategorisi oluşturulamadı." }, { status: 500 });
    }
}
