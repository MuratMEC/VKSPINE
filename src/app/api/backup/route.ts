import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
    try {
        // SQLite dosyasının bulunduğu yol (dev.db)
        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

        // Dosyayı oku
        const dbBuffer = readFileSync(dbPath);

        // Response olarak döndür
        const headers = new Headers();
        headers.append('Content-Disposition', `attachment; filename="vk_spine_backup_${new Date().toISOString().slice(0, 10)}.db"`);
        headers.append('Content-Type', 'application/octet-stream');

        return new NextResponse(dbBuffer, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error("Yedekleme hatası:", error);
        return NextResponse.json({ error: "Veritabanı yedeği oluşturulamadı." }, { status: 500 });
    }
}
