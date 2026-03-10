"use client";

import { useState, useEffect } from 'react';
import { Package, Plus, Loader2, RefreshCcw, Search, ArrowRightToLine, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';

interface LotItem {
    id: string;
    lotNo: string;
    productId: string;
    productName: string;
    productUts: string | null;
    productDimension: string | null;
    productBarcode: string | null;
    productCategory: string | null;
    productSetCategory: string | null;
    quantity: number;
    expDate: string | null;
}

export default function StokYonetimiPage() {
    const [lots, setLots] = useState<LotItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Çoklu Alan Arama
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        dimension: '',
        category: '',
        setCategory: ''
    });

    const loadStock = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/stock/active-lots');
            if (res.ok) {
                const data = await res.json();
                setLots(data);
            }
        } catch (error) {
            console.error("Stok verisi çekilemedi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStock();
    }, []);

    const hasAnyFilter = searchFilters.name || searchFilters.dimension || searchFilters.category || searchFilters.setCategory;

    // Çoklu alan filtresi
    const filteredLots = lots.filter(lot => {
        if (!hasAnyFilter) return true;
        let match = true;
        if (searchFilters.name) {
            const term = searchFilters.name.toLowerCase();
            match = match && (
                lot.productName.toLowerCase().includes(term) ||
                lot.lotNo.toLowerCase().includes(term) ||
                !!(lot.productUts && lot.productUts.toLowerCase().includes(term)) ||
                !!(lot.productBarcode && lot.productBarcode.toLowerCase().includes(term))
            );
        }
        if (searchFilters.dimension) {
            const term = searchFilters.dimension.toLowerCase();
            match = match && !!(lot.productDimension && lot.productDimension.toLowerCase().includes(term));
        }
        if (searchFilters.category) {
            const term = searchFilters.category.toLowerCase();
            match = match && !!(lot.productCategory && lot.productCategory.toLowerCase().includes(term));
        }
        if (searchFilters.setCategory) {
            const term = searchFilters.setCategory.toLowerCase();
            match = match && !!(lot.productSetCategory && lot.productSetCategory.toLowerCase().includes(term));
        }
        return match;
    });

    // Toplam stok adedi
    const totalQuantity = filteredLots.reduce((sum, l) => sum + l.quantity, 0);

    // SKT kontrolü — 90 gün içinde sona erecek
    const now = new Date();
    const soonDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const getSktStatus = (expDate: string | null) => {
        if (!expDate) return 'none';
        const exp = new Date(expDate);
        if (exp < now) return 'expired';
        if (exp < soonDate) return 'warning';
        return 'ok';
    };

    const clearFilters = () => {
        setSearchFilters({ name: '', dimension: '', category: '', setCategory: '' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="w-6 h-6 text-blue-600" />
                        Depo Durumu
                    </h1>
                    <p className="text-slate-500 mt-1">Deponuzdaki tüm ürünlerin Lot bazlı stok durumunu görüntüleyin.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={loadStock} className="px-3 py-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" title="Yenile">
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <Link href="/stok/cikis" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <ArrowRightToLine className="w-4 h-4" /> Stok Çıkışı
                    </Link>
                    <Link href="/stok/giris" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" /> Stok Girişi
                    </Link>
                </div>
            </div>

            {/* Özet Kartlar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-slate-500 font-medium">Toplam Lot</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{filteredLots.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-slate-500 font-medium">Toplam Stok Adedi</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{totalQuantity}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-slate-500 font-medium">SKT Dikkat</div>
                    <div className="text-2xl font-bold text-amber-600 mt-1">
                        {filteredLots.filter(l => {
                            const s = getSktStatus(l.expDate);
                            return s === 'expired' || s === 'warning';
                        }).length}
                    </div>
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
                        <span className="text-sm text-slate-500">Listelenen <strong className="mx-1">{filteredLots.length}</strong> lot</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input
                        type="text"
                        placeholder="Ürün Adı / Lot No / ÜTS / Barkod"
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
                    <p className="text-slate-500 font-medium">Stok verileri yükleniyor...</p>
                </div>
            ) : filteredLots.length === 0 ? (
                <div className="bg-white rounded-b-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {hasAnyFilter ? 'Arama sonucu bulunamadı.' : 'Depoda stoğu olan ürün yok'}
                    </h3>
                    {!hasAnyFilter && (
                        <p className="text-slate-500 max-w-md pb-6">Stok girişi yaparak ürünleri depoya ekleyebilirsiniz.</p>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Ürün Adı</th>
                                    <th className="px-6 py-4">Ölçü / Boyut</th>
                                    <th className="px-6 py-4">Lot No</th>
                                    <th className="px-6 py-4">SKT</th>
                                    <th className="px-6 py-4">Barkod</th>
                                    <th className="px-6 py-4 text-center">Stok Adedi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLots.map((lot) => {
                                    const sktStatus = getSktStatus(lot.expDate);
                                    return (
                                        <tr key={lot.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{lot.productName}</div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {lot.productCategory && <span className="text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">{lot.productCategory}</span>}
                                                    {lot.productSetCategory && <span className="text-[11px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium">{lot.productSetCategory}</span>}
                                                    {lot.productUts && <span className="text-xs text-slate-400 font-mono">ÜTS: {lot.productUts}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {lot.productDimension ? (
                                                    <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium">{lot.productDimension}</span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">{lot.lotNo}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {lot.expDate ? (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                                        sktStatus === 'expired' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                                        sktStatus === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                                        'bg-emerald-50 text-emerald-700'
                                                    }`}>
                                                        {sktStatus !== 'ok' && <AlertTriangle className="w-3 h-3" />}
                                                        {new Date(lot.expDate).toLocaleDateString('tr-TR')}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-600">{lot.productBarcode || '—'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-bold min-w-[40px]">
                                                    {lot.quantity}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                        <span>Toplam <strong>{filteredLots.length}</strong> lot, <strong>{totalQuantity}</strong> adet stok</span>
                    </div>
                </div>
            )}
        </div>
    );
}
