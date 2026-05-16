import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as xlsx from 'xlsx';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: { category: true, setCategory: true },
            orderBy: { name: 'asc' }
        });

        // Veriyi Excel formatına çevir
        const dataForExcel = products.map((p) => ({
            'ID (Silmeyin)': p.id,
            'Barkod': p.barcode || '',
            'ÜTS Kodu': p.utsCode || '',
            'Ürün Adı': p.name,
            'Marka': p.brand || '',
            'Kategori': p.category?.name || '',
            'Alış Fiyatı': p.purchasePrice || 0,
            'Satış Fiyatı': p.salesPrice || 0,
            'Kritik Stok': p.minStockLvl || 5,
            'Aktif mi?': p.isActive ? 'Evet' : 'Hayır',
        }));

        const worksheet = xlsx.utils.json_to_sheet(dataForExcel);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Urunler');

        // Buffer oluştur
        const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="urunler.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        console.error('Excel export hatası:', error);
        return NextResponse.json({ error: 'Dışa aktarım başarısız oldu' }, { status: 500 });
    }
}
