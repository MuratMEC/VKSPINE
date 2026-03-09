import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tek ürünü getir (GET)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                setCategory: true,
                _count: {
                    select: { stockMovements: true, lotSerials: true }
                }
            }
        });

        if (!product) {
            return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Ürün getirilirken hata:", error);
        return NextResponse.json({ error: "Ürün yüklenemedi.", details: error.message }, { status: 500 });
    }
}

// Ürünü güncelle (PUT) — sadece hareket görmemiş ürünler düzenlenebilir
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Ürünün var olup olmadığını kontrol et
        const existing = await prisma.product.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { stockMovements: true }
                }
            }
        });

        if (!existing) {
            return NextResponse.json({ error: "Güncellenecek ürün bulunamadı." }, { status: 404 });
        }

        // Stok hareketi olan ürünlerin düzenlenmesini engelle
        if (existing._count.stockMovements > 0) {
            return NextResponse.json({
                error: "Bu ürün stok hareketi gördüğü için düzenlenemez. Yalnızca henüz hareket görmemiş ürün kartları düzenlenebilir."
            }, { status: 403 });
        }

        const body = await request.json();
        const {
            name, categoryId, setCategoryId, utsCode, sku, barcode, dimension, sutCode,
            taxRate, brand, purchasePrice, salesPrice, currency,
            minStockLvl, isSterile, hasExpiration, description
        } = body;

        if (!name) {
            return NextResponse.json({ error: "Ürün adı zorunludur." }, { status: 400 });
        }

        // Unique alan kontrolleri (kendi id'si hariç)
        if (utsCode) {
            const dup = await prisma.product.findFirst({ where: { utsCode, NOT: { id } } });
            if (dup) return NextResponse.json({ error: "Bu ÜTS kodu başka bir üründe zaten kayıtlı." }, { status: 409 });
        }
        if (barcode) {
            const dup = await prisma.product.findFirst({ where: { barcode, NOT: { id } } });
            if (dup) return NextResponse.json({ error: "Bu barkod başka bir üründe zaten kayıtlı." }, { status: 409 });
        }
        if (sku) {
            const dup = await prisma.product.findFirst({ where: { sku, NOT: { id } } });
            if (dup) return NextResponse.json({ error: "Bu firma içi kod (SKU) başka bir üründe zaten kayıtlı." }, { status: 409 });
        }

        const updated = await prisma.product.update({
            where: { id },
            data: {
                name,
                categoryId: categoryId || null,
                setCategoryId: setCategoryId || null,
                utsCode: utsCode || null,
                sku: sku || null,
                barcode: barcode || null,
                dimension: dimension || null,
                sutCode: sutCode || null,
                taxRate: taxRate ? Number(taxRate) : 20,
                brand: brand || null,
                purchasePrice: purchasePrice ? Number(purchasePrice) : null,
                salesPrice: salesPrice ? Number(salesPrice) : null,
                currency: currency || "TRY",
                minStockLvl: minStockLvl !== undefined ? Number(minStockLvl) : 5,
                isSterile: isSterile ? true : false,
                hasExpiration: hasExpiration !== undefined ? hasExpiration : true,
                description: description || null
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Ürün güncellenirken hata:", error);
        return NextResponse.json({ error: "Ürün güncellenemedi.", details: error.message }, { status: 500 });
    }
}
