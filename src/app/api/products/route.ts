import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tüm ürünleri getir (GET)
export async function GET() {
    try {
        console.log("--> API /products GET cagrildi.");
        const products = await prisma.product.findMany({
            include: {
                category: true, // Kategori modeli Schema.prisma'da tanimli
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log("--> API /products GET basarili, dondurulen satir sayisi:", products.length);
        return NextResponse.json(products);
    } catch (error: any) {
        console.error("====== URUNLER GETIRILIRKEN HATA ======");
        console.error("Hata Detayi:", error.message);
        return NextResponse.json({ error: "Ürünler listelenemedi", details: error.message }, { status: 500 });
    }
}

// Yeni ürün ekle (POST)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name, categoryId, utsCode, sku, barcode, dimension, sutCode,
            taxRate, brand, purchasePrice, salesPrice, currency,
            minStockLvl, isSterile, hasExpiration, description
        } = body;

        // Basit validasyon
        if (!name || !categoryId) {
            return NextResponse.json({ error: "Ürün adı ve Kategorisi zorunludur" }, { status: 400 });
        }

        // ÜTS kodunun benzersiz olup olmadığını kontrol et
        if (utsCode) {
            const existingByUts = await prisma.product.findFirst({ where: { utsCode } });
            if (existingByUts) {
                return NextResponse.json({ error: "Bu ÜTS kodu ile sistemde kayıtlı bir ürün zaten var." }, { status: 409 });
            }
        }

        // SKU/Barkod kontrolü (Opsiyonel ama varsa unique olmalı Prisma şemasında)
        if (barcode) {
            const existingByBarcode = await prisma.product.findFirst({ where: { barcode } });
            if (existingByBarcode) {
                return NextResponse.json({ error: "Bu barkod ile kayıtlı bir ürün zaten var." }, { status: 409 });
            }
        }

        if (sku) {
            const existingBySku = await prisma.product.findFirst({ where: { sku } });
            if (existingBySku) {
                return NextResponse.json({ error: "Bu firma içi kod (SKU) ile kayıtlı bir ürün zaten var." }, { status: 409 });
            }
        }

        // Ürünü veritabanına kaydet
        const newProduct = await prisma.product.create({
            data: {
                name,
                categoryId,
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
                minStockLvl: minStockLvl ? Number(minStockLvl) : 5,
                isSterile: isSterile ? true : false,
                hasExpiration: hasExpiration !== undefined ? hasExpiration : true,
                description: description || null
            }
        });

        return NextResponse.json(newProduct, { status: 201 });

    } catch (error: any) {
        console.error("Ürün eklenirken hata:", error);
        return NextResponse.json({ error: "Ürün kaydedilemedi", details: error.message }, { status: 500 });
    }
}
