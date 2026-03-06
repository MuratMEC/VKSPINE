import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // 1. Veritabanı boşsa (ilk kurulum), varsayılan admini oluştur.
        const userCount = await prisma.user.count();
        if (userCount === 0) {
            const hashedPassword = await bcrypt.hash("123456", 10);
            await prisma.user.create({
                data: {
                    name: "Sistem Yöneticisi",
                    email: "admin@vkspine.com",
                    password: hashedPassword,
                    role: "ADMIN",
                    isActive: true
                }
            });
        }

        // 2. Kullanıcıyı DB'den bul
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() } // e-posta yazım hatalarını tolere et
        });

        if (!user || !user.isActive) {
            return NextResponse.json(
                { error: "Böyle bir kullanıcı bulunamadı veya hesap pasif." },
                { status: 401 }
            );
        }

        // 3. Şifreyi doğrula
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Hatalı e-posta veya şifre girdiniz." },
                { status: 401 }
            );
        }

        // 4. Session oluştur
        const session = await getSession();
        session.isLoggedIn = true;
        session.username = user.name;
        // @ts-ignore - session type doesn't have role yet, but wait, session type in lib/session.ts might not accept custom fields easily. I'll just use what's there.
        await session.save();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Login Hatası:", error);
        return NextResponse.json(
            { error: "Giriş işlemi sırasında bir sunucu hatası oluştu." },
            { status: 500 }
        );
    }
}
