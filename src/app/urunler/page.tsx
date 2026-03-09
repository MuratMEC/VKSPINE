"use client";

import { useState, useEffect } from 'react';
import { Package, Plus, Upload, Loader2, RefreshCcw, Search, Edit, Tag, X } from 'lucide-react';
import Link from 'next/link';

interface ProductWithCategory {
    id: string;
    name: string;
    sku: string | null;
    barcode: string | null;
    utsCode: string | null;
    dimension: string | null;
    brand: string | null;
    minStockLvl: number;
    hasExpiration: boolean;
    category: { id: string; name: string } | null;
    setCategory: { id: string; name: string } | null;
}

export default function UrunlerPage() {
    const [products, setProducts] = useState<ProductWithCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Çoklu Alan Arama
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        dimension: '',
        category: '',
        setCategory: ''
    });

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

    const hasAnyFilter = searchFilters.name || searchFilters.dimension || searchFilters.category || searchFilters.setCategory;

    // Çoklu alan filtresi
    const filteredProducts = products.filter(p => {
        if (!hasAnyFilter) return true;
        let match = true;
        if (searchFilters.name) {
            const term = searchFilters.name.toLowerCase();
            match = match && !!(
                p.name.toLowerCase().includes(term) ||
                (p.utsCode && p.utsCode.toLowerCase().includes(term)) ||
                (p.barcode && p.barcode.toLowerCase().includes(term)) ||
                (p.sku && p.sku.toLowerCase().includes(term)) ||
                (p.brand && p.brand.toLowerCase().includes(term))
            );
        }
        if (searchFilters.dimension) {
            const term = searchFilters.dimension.toLowerCase();
            match = match && !!(p.dimension && p.dimension.toLowerCase().includes(term));
        }
        if (searchFilters.category) {
            const term = searchFilters.category.toLowerCase();
            match = match && !!(p.category?.name && p.category.name.toLowerCase().includes(term));
        }
        if (searchFilters.setCategory) {
            const term = searchFilters.setCategory.toLowerCase();
            match = match && !!(p.setCategory?.name && p.setCategory.name.toLowerCase().includes(term));
        }
        return match;
    });

    const clearFilters = () => {
        setSearchFilters({ name: '', dimension: '', category: '', setCategory: '' });
    };

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

            {/* ÇOKLU ALAN ARAMA */}
            <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <Search className="w-4 h-4 text-slate-400" />
                        Ürün Ara (Birden Çok Alana Göre)
                    </div>
                    <div className="flex items-center gap-3">
                        {hasAnyFilter && (
                            <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                <X className="w-3 h-3" /> Filtreleri Temizle
                            </button>
                        )}
                        <span className="text-sm text-slate-500">Toplam <strong className="mx-1">{filteredProducts.length}</strong> ürün</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input
                        type="text"
                        placeholder="Ürün Adı / Barkod / ÜTS / Marka"
                        value={searchFilters.name}
                        onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Ölçü / Boyut"
                        value={searchFilters.dimension}
                        onChange={(e) => setSearchFilters({ ...searchFilters, dimension: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Kategori"
                        value={searchFilters.category}
                        onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Set Kategorisi"
                        value={searchFilters.setCategory}
                        onChange={(e) => setSearchFilters({ ...searchFilters, setCategory: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-b-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Veritabanından ürünler yükleniyor...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-b-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {hasAnyFilter ? 'Arama sonucu bulunamadı.' : 'Henüz kayıtlı ürün yok'}
                    </h3>
                    {!hasAnyFilter && (
                        <p className="text-slate-500 max-w-md pb-6">Manuel olarak ürün ekleyebilir veya topluca Excel üzerinden veritabanına yükleyebilirsiniz.</p>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Ürün Adı</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Set Kategorisi</th>
                                    <th className="px-6 py-4">Ölçü / Boyut</th>
                                    <th className="px-6 py-4">Barkod</th>
                                    <th className="px-6 py-4">Marka</th>
                                    <th className="px-6 py-4">SKT</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((urun) => (
                                    <tr key={urun.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{urun.name}</div>
                                            {urun.sku && <div className="text-xs text-slate-400 mt-0.5 font-mono">SKU: {urun.sku}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {urun.category ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    <Tag className="w-3 h-3" />
                                                    {urun.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {urun.setCategory ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                    <Tag className="w-3 h-3" />
                                                    {urun.setCategory.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{urun.dimension || '—'}</td>
                                        <td className="px-6 py-4 font-mono text-slate-600 text-xs">{urun.barcode || '—'}</td>
                                        <td className="px-6 py-4 text-slate-500">{urun.brand || '—'}</td>
                                        <td className="px-6 py-4">
                                            {urun.hasExpiration ? (
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Evet</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">Hayır</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/urunler/${urun.id}/duzenle`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 justify-end"
                                            >
                                                <Edit className="w-3.5 h-3.5" /> Düzenle
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                        <span>Toplam <strong>{filteredProducts.length}</strong> ürün kaydı bulunuyor.</span>
                    </div>
                </div>
            )}
        </div>
    );
}
