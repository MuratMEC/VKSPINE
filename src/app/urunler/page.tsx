"use client";

import { useState, useEffect } from 'react';
import { Package, Plus, Upload, Loader2, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@prisma/client';

export default function UrunlerPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Sayfa açıldığında ürünleri API'dan çek
    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Veri çekme hatası:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="w-6 h-6 text-blue-600" />
                        Ürün Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-1">Sistemdeki cihaz, platin ve sarf malzemelerini görüntüleyin ve yönetin.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={loadProducts} className="px-3 py-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" title="Yenile">
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <Link href="/urunler/import" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Excel'den İçe Aktar
                    </Link>
                    <Link href="/urunler/yeni" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" /> Yeni Ürün Ekle
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Veritabanından ürünler yükleniyor...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Henüz kayıtlı ürün yok</h3>
                    <p className="text-slate-500 max-w-md pb-6">Manuel olarak ürün ekleyebilir veya topluca Excel üzerinden veritabanına yükleyebilirsiniz.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">ÜTS Barkodu</th>
                                    <th className="px-6 py-4">Ürün Adı</th>
                                    <th className="px-6 py-4">Marka</th>
                                    <th className="px-6 py-4">Stok Düşük Sınırı</th>
                                    <th className="px-6 py-4">SKT Takibi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((urun) => (
                                    <tr key={urun.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4 font-mono text-slate-600 text-xs">{urun.utsCode}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{urun.name}</td>
                                        <td className="px-6 py-4 text-slate-500">{urun.brand || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 font-medium text-slate-700 text-xs">
                                                {urun.minStockLvl}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {urun.hasExpiration ? (
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Evet</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">Hayır</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
