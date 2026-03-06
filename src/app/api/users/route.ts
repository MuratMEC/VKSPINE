import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Kullanıcılar alınırken hata:", error);
        return NextResponse.json({ error: "Kullanıcılar yüklenemedi." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name || !body.email || !body.password) {
            return NextResponse.json({ error: "İsim, E-posta ve Şifre alanları zorunludur." }, { status: 400 });
        }

        // Email benzersizliği kontrolü
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Bu e-posta adresiyle zaten bir kullanıcı kayıtlı." }, { status: 400 });
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(body.password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
                role: body.role || 'USER',
                isActive: true
            },
            select: { // Şifreyi geri döndürme
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true
            }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Kullanıcı oluşturulurken hata:", error);
        return NextResponse.json({ error: "Kullanıcı oluşturulurken bir hata oluştu." }, { status: 500 });
    }
}
