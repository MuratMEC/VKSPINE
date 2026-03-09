"use client";

import { useState, useEffect } from 'react';
import { PackagePlus, ArrowLeft, Search, Loader2, CheckCircle, AlertCircle, Building2, Receipt, Calendar, PlusCircle, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StokGirisPage() {
    const router = useRouter();

    // Uygulama & Data State
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Üst Bilgi (Fatura / Tedarikçi) State
    const [headerData, setHeaderData] = useState({
        supplierId: '',
        selectedSupplierName: '',
        docNo: '', // invoiceNo (opsiyonel)
        entryDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Tedarikçi Arama State
    const [supplierSearch, setSupplierSearch] = useState('');
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

    // Çoklu Alan Arama State
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        dimension: '',
        category: '',
        setCategory: ''
    });
    const [showDropdown, setShowDropdown] = useState(false);

    // Aktif Girilen Satır State
    const [itemData, setItemData] = useState({
        productId: '',
        selectedProductName: '',
        quantity: 1,
        expDate: '',
    });

    // Sepet State
    const [addedItems, setAddedItems] = useState<any[]>([]);

    useEffect(() => {
        // Ürünleri Çek
        fetch('/api/products')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setAllProducts(data); })
            .catch(err => console.error(err));

        // Tedarikçileri Çek
        fetch('/api/suppliers')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setAllSuppliers(data); })
            .catch(err => console.error(err));
    }, []);

    const filteredSuppliers = allSuppliers.filter(s =>
        s.companyName.toLowerCase().includes(supplierSearch.toLowerCase())
    );

    const hasAnySearchFilter = searchFilters.name || searchFilters.dimension || searchFilters.category || searchFilters.setCategory;

    const filteredProducts = allProducts.filter(p => {
        if (!hasAnySearchFilter) return true;
        let match = true;
        if (searchFilters.name) {
            const term = searchFilters.name.toLowerCase();
            match = match && (
                p.name.toLowerCase().includes(term) ||
                (p.utsCode && p.utsCode.toLowerCase().includes(term)) ||
                (p.barcode && p.barcode.toLowerCase().includes(term))
            );
        }
        if (searchFilters.dimension) {
            const term = searchFilters.dimension.toLowerCase();
            match = match && (p.dimension && p.dimension.toLowerCase().includes(term));
        }
        if (searchFilters.category) {
            const term = searchFilters.category.toLowerCase();
            match = match && (p.category?.name && p.category.name.toLowerCase().includes(term));
        }
        if (searchFilters.setCategory) {
            const term = searchFilters.setCategory.toLowerCase();
            match = match && (p.setCategory?.name && p.setCategory.name.toLowerCase().includes(term));
        }
        return match;
    });

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemData.productId || itemData.quantity <= 0) {
            setErrorMsg("Ürün seçimi ve sıfırdan büyük Miktar zorunludur.");
            return;
        }

        const newItem = {
            id: Date.now().toString(), // Benzersiz UI ID'si
            ...itemData
        };

        setAddedItems(prev => [...prev, newItem]);
        setErrorMsg('');

        // Sadece satır bilgisini sıfırla, üst bilgi (fatura vb.) kalsın
        setItemData({
            productId: '',
            selectedProductName: '',
            quantity: 1,
            expDate: '',
        });
        setSearchFilters({ name: '', dimension: '', category: '', setCategory: '' });
    };

    const handleRemoveItem = (id: string) => {
        setAddedItems(prev => prev.filter(item => item.id !== id));
    };

    const handleBulkSubmit = async () => {
        if (!headerData.supplierId) {
            setErrorMsg("Lütfen önce Üst Bilgi alanından Tedarikçi seçin.");
            return;
        }

        if (addedItems.length === 0) {
            setErrorMsg("Faturada kaydedilecek ürün (kalem) yok.");
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setSuccess('');

        try {
            const payload = {
                supplierId: headerData.supplierId,
                invoiceNo: headerData.docNo || undefined,
                entryDate: headerData.entryDate,
                notes: headerData.notes,
                items: addedItems
            };

            const res = await fetch('/api/stock/entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Stok girişi faturası kaydedilemedi.');
            }

            setSuccess(data.message || `${addedItems.length} kalemlik fatura başarıyla stoğa işlendi!`);

            // Ekranı temizle
            setAddedItems([]);
            setHeaderData({ ...headerData, docNo: '', notes: '' });

            // 2 Saniye sonra listeye yönlendir
            setTimeout(() => {
                router.push('/stok/hareketler');
            }, 2000);

        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const clearSearchFilters = () => {
        setSearchFilters({ name: '', dimension: '', category: '', setCategory: '' });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link href="/stok/hareketler" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" /> Stok Hareketlerine Dön
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <PackagePlus className="w-6 h-6 text-blue-600" />
                    Yeni Stok Girişi (Fatura / Mal Kabul)
                </h1>
                <p className="text-slate-500 mt-1">Gelen faturadaki tüm ürünleri tek seferde (aynı fatura altında) sisteme girin.</p>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <p className="font-medium">{success}</p>
                </div>
            )}
            {errorMsg && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <p className="font-medium">{errorMsg}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">

                {/* 1. ÜST BİLGİ ALANI (FATURA BAŞLIĞI) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-slate-500" />
                        <h2 className="font-semibold text-slate-800">1. Fatura ve Tedarikçi Bilgileri</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                Tedarikçi Seçimi <span className="text-rose-500">*</span>
                            </label>
                            {headerData.selectedSupplierName ? (
                                <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                                    <span className="font-semibold text-blue-900 text-sm truncate pr-2">{headerData.selectedSupplierName}</span>
                                    <button type="button" onClick={() => setHeaderData({ ...headerData, supplierId: '', selectedSupplierName: '' })} className="text-blue-600 hover:text-blue-800 font-medium text-xs whitespace-nowrap">Değiştir</button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={supplierSearch}
                                        onChange={(e) => {
                                            setSupplierSearch(e.target.value);
                                            setShowSupplierDropdown(true);
                                        }}
                                        onFocus={() => setShowSupplierDropdown(true)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                        placeholder="Tedarikçi ara ve seç..."
                                    />
                                    {showSupplierDropdown && (
                                        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-xl max-h-48 overflow-y-auto">
                                            {filteredSuppliers.length > 0 ? (
                                                filteredSuppliers.map(s => (
                                                    <div
                                                        key={s.id}
                                                        onClick={() => {
                                                            setHeaderData({ ...headerData, supplierId: s.id, selectedSupplierName: s.companyName });
                                                            setSupplierSearch('');
                                                            setShowSupplierDropdown(false);
                                                        }}
                                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                    >
                                                        <div className="font-semibold text-slate-900 text-sm">{s.companyName}</div>
                                                        {s.contactPerson && <div className="text-[11px] text-slate-500 mt-0.5">{s.contactPerson}</div>}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-3 text-xs text-slate-500">Sonuç bulunamadı...</div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-slate-400" />
                                Fatura / İrsaliye No <span className="text-slate-400 text-xs">(Opsiyonel)</span>
                            </label>
                            <input
                                value={headerData.docNo}
                                onChange={e => setHeaderData({ ...headerData, docNo: e.target.value.toUpperCase() })}
                                type="text"
                                placeholder="Örn: FAT-2024..."
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm uppercase outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                Kabul Tarihi
                            </label>
                            <input
                                value={headerData.entryDate}
                                onChange={e => setHeaderData({ ...headerData, entryDate: e.target.value })}
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. SATIR (KALEM) EKLEME ALANI */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PackagePlus className="w-5 h-5 text-slate-500" />
                            <h2 className="font-semibold text-slate-800">2. Fatura Kalemleri (Ürünler)</h2>
                        </div>
                    </div>

                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <form onSubmit={handleAddItem} className="space-y-4">
                            {/* Çoklu Alan Arama */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold text-slate-600">Ürün Ara (Birden Çok Alana Göre) <span className="text-rose-500">*</span></label>
                                    {hasAnySearchFilter && (
                                        <button type="button" onClick={clearSearchFilters} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                            <X className="w-3 h-3" /> Filtreleri Temizle
                                        </button>
                                    )}
                                </div>

                                {itemData.selectedProductName ? (
                                    <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                                        <span className="font-semibold text-blue-900 text-sm truncate pr-2">{itemData.selectedProductName}</span>
                                        <button type="button" onClick={() => setItemData({ ...itemData, productId: '', selectedProductName: '' })} className="text-blue-600 hover:text-blue-800 font-medium text-xs whitespace-nowrap">Değiştir</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={searchFilters.name}
                                                    onChange={(e) => {
                                                        setSearchFilters({ ...searchFilters, name: e.target.value });
                                                        setShowDropdown(true);
                                                    }}
                                                    onFocus={() => setShowDropdown(true)}
                                                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                                                    placeholder="Ürün Adı / Barkod"
                                                />
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={searchFilters.dimension}
                                                    onChange={(e) => {
                                                        setSearchFilters({ ...searchFilters, dimension: e.target.value });
                                                        setShowDropdown(true);
                                                    }}
                                                    onFocus={() => setShowDropdown(true)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                                                    placeholder="Ölçü / Boyut"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={searchFilters.category}
                                                    onChange={(e) => {
                                                        setSearchFilters({ ...searchFilters, category: e.target.value });
                                                        setShowDropdown(true);
                                                    }}
                                                    onFocus={() => setShowDropdown(true)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                                                    placeholder="Kategori"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={searchFilters.setCategory}
                                                    onChange={(e) => {
                                                        setSearchFilters({ ...searchFilters, setCategory: e.target.value });
                                                        setShowDropdown(true);
                                                    }}
                                                    onFocus={() => setShowDropdown(true)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                                                    placeholder="Set Kategorisi"
                                                />
                                            </div>
                                        </div>

                                        {showDropdown && hasAnySearchFilter && (
                                            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-h-48 overflow-y-auto">
                                                {filteredProducts.length > 0 ? (
                                                    filteredProducts.map(p => (
                                                        <div
                                                            key={p.id}
                                                            onClick={() => {
                                                                setItemData({ ...itemData, productId: p.id, selectedProductName: `${p.name}${p.dimension ? ' — ' + p.dimension : ''}` });
                                                                setShowDropdown(false);
                                                            }}
                                                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                        >
                                                            <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                                                            <div className="flex flex-wrap gap-2 mt-0.5">
                                                                {p.dimension && <span className="text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">{p.dimension}</span>}
                                                                {p.category?.name && <span className="text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">{p.category.name}</span>}
                                                                {p.setCategory?.name && <span className="text-[11px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium">{p.setCategory.name}</span>}
                                                                {p.barcode && <span className="text-[11px] font-mono text-slate-500">BC: {p.barcode}</span>}
                                                                {p.utsCode && <span className="text-[11px] font-mono text-slate-400">ÜTS: {p.utsCode}</span>}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-3 text-xs text-slate-500">Sonuç bulunamadı...</div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                             {/* SKT ve Miktar */}
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Son Kullanma Tarihi (SKT)</label>
                                    <input 
                                        value={itemData.expDate} 
                                        onChange={e => setItemData({ ...itemData, expDate: e.target.value })} 
                                        type="date" 
                                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none" 
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Adet</label>
                                    <input required value={itemData.quantity} onChange={e => setItemData({ ...itemData, quantity: parseInt(e.target.value) || 1 })} type="number" min="1" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none" />
                                </div>
                                <button type="submit" disabled={!itemData.productId} className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                                    <PlusCircle className="w-4 h-4" /> Satır Ekle
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Fatura / Sepet Listesi */}
                    <div className="px-6 py-4">
                        {addedItems.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                                Henüz faturaya kalem eklemediniz. Yukarıdaki formu kullanarak ürünleri listeye ekleyin.
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs font-bold tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4 w-10">#</th>
                                            <th className="py-3 px-4">Ürün Adı</th>
                                            <th className="py-3 px-4">SKT</th>
                                            <th className="py-3 px-4 text-center">Miktar</th>
                                            <th className="py-3 px-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {addedItems.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-slate-400">{index + 1}</td>
                                                 <td className="py-3 px-4 font-semibold text-slate-800">{item.selectedProductName}</td>
                                                <td className="py-3 px-4">
                                                    {item.expDate ? (
                                                        <span className="text-xs font-mono bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100">
                                                            {new Date(item.expDate).toLocaleDateString('tr-TR')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">{item.quantity}</span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-rose-500 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Alt Onay Alanı */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 rounded-b-xl">
                        <div className="text-sm text-slate-500">
                            {addedItems.length > 0 && <><span className="font-bold text-blue-700">{addedItems.length}</span> kalem ürün stoğa eklenecek</>}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => router.push('/stok/hareketler')} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-100 transition-colors">Vazgeç</button>
                            <button onClick={handleBulkSubmit} disabled={loading || addedItems.length === 0} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                Faturayı Stoğa Al ve Kaydet
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
