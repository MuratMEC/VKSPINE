"use client";

import { useState, useEffect } from 'react';
import { PackagePlus, ArrowLeft, Search, Loader2, CheckCircle, AlertCircle, Building2, Receipt, Calendar, PlusCircle, Trash2 } from 'lucide-react';
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
        docNo: '', // invoiceNo
        entryDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Satır Ekleme (Arama) State
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Aktif Girilen Satır State
    const [itemData, setItemData] = useState({
        productId: '',
        selectedProductName: '',
        lotNo: '',
        expDate: '',
        quantity: 1,
        purchasePrice: ''
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

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.utsCode?.includes(searchTerm)
    );

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemData.productId || !itemData.lotNo || itemData.quantity <= 0) {
            setErrorMsg("Ürün seçimi, Lot No ve sıfırdan büyük Miktar zorunludur.");
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
            lotNo: '',
            expDate: '',
            quantity: 1,
            purchasePrice: ''
        });
        setSearchTerm('');
    };

    const handleRemoveItem = (id: string) => {
        setAddedItems(prev => prev.filter(item => item.id !== id));
    };

    const handleBulkSubmit = async () => {
        if (!headerData.supplierId || !headerData.docNo) {
            setErrorMsg("Lütfen önce Üst Bilgi alanından Tedarikçi ve Fatura Numarasını doldurun.");
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
                invoiceNo: headerData.docNo,
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
                <p className="text-slate-500 mt-1">Gelen faturadaki tüm ürünleri Lot bazlı olarak tek seferde (aynı fatura altında) sisteme girin.</p>
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
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-slate-500" />
                        <h2 className="font-semibold text-slate-800">1. Fatura ve Tedarikçi Bilgileri</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                Tedarikçi Seçimi <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={headerData.supplierId}
                                onChange={e => setHeaderData({ ...headerData, supplierId: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                            >
                                <option value="">-- Tedarikçi Seçiniz --</option>
                                {allSuppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.companyName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-slate-400" />
                                Fatura / İrsaliye No <span className="text-rose-500">*</span>
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
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PackagePlus className="w-5 h-5 text-slate-500" />
                            <h2 className="font-semibold text-slate-800">2. Fatura Kalemleri (Ürünler)</h2>
                        </div>
                    </div>

                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                                {/* Ürün Arama */}
                                <div className="md:col-span-5 relative">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Cihaz / Malzeme <span className="text-rose-500">*</span></label>
                                    {itemData.selectedProductName ? (
                                        <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                                            <span className="font-semibold text-blue-900 text-sm truncate pr-2">{itemData.selectedProductName}</span>
                                            <button type="button" onClick={() => setItemData({ ...itemData, productId: '', selectedProductName: '' })} className="text-blue-600 hover:text-blue-800 font-medium text-xs whitespace-nowrap">Değiştir</button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setShowDropdown(e.target.value.length > 0);
                                                }}
                                                onFocus={() => setShowDropdown(searchTerm.length > 0 || allProducts.length > 0)}
                                                className="w-full pl-3 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                                                placeholder="Ürün Ara..."
                                            />
                                            {showDropdown && (
                                                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-xl max-h-48 overflow-y-auto">
                                                    {filteredProducts.length > 0 ? (
                                                        filteredProducts.map(p => (
                                                            <div
                                                                key={p.id}
                                                                onClick={() => {
                                                                    setItemData({ ...itemData, productId: p.id, selectedProductName: p.name });
                                                                    setSearchTerm('');
                                                                    setShowDropdown(false);
                                                                }}
                                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                            >
                                                                <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                                                                {p.utsCode && <div className="text-[11px] text-slate-500 font-mono mt-0.5">{p.utsCode}</div>}
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

                                {/* Lot No */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Lot / Parti No <span className="text-rose-500">*</span></label>
                                    <input required value={itemData.lotNo} onChange={e => setItemData({ ...itemData, lotNo: e.target.value })} type="text" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono outline-none" placeholder="LOT-XXX" />
                                </div>

                                {/* SKT */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">SKT</label>
                                    <input value={itemData.expDate} onChange={e => setItemData({ ...itemData, expDate: e.target.value })} type="date" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none" />
                                </div>

                                {/* Birim Fiyat (Opsiyonel) */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Alış Fiyatı (₺)</label>
                                    <input value={itemData.purchasePrice} onChange={e => setItemData({ ...itemData, purchasePrice: e.target.value })} type="number" step="0.01" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none" placeholder="Opsiyonel" />
                                </div>

                                {/* Miktar ve Buton */}
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Adet</label>
                                    <div className="flex gap-2">
                                        <input required value={itemData.quantity} onChange={e => setItemData({ ...itemData, quantity: parseInt(e.target.value) || 1 })} type="number" min="1" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button type="submit" disabled={!itemData.productId || !itemData.lotNo} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2">
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
                                            <th className="py-3 px-4">Lot No</th>
                                            <th className="py-3 px-4">SKT</th>
                                            <th className="py-3 px-4 text-right">Fiyat</th>
                                            <th className="py-3 px-4 text-center">Miktar</th>
                                            <th className="py-3 px-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {addedItems.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-slate-400">{index + 1}</td>
                                                <td className="py-3 px-4 font-semibold text-slate-800">{item.selectedProductName}</td>
                                                <td className="py-3 px-4 font-mono text-xs text-blue-700 bg-blue-50/50 rounded inline-block mt-2 ml-4">{item.lotNo}</td>
                                                <td className="py-3 px-4">{item.expDate || '-'}</td>
                                                <td className="py-3 px-4 text-right">{item.purchasePrice ? `₺${item.purchasePrice}` : '-'}</td>
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
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={() => router.push('/stok/hareketler')} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-100 transition-colors">Vazgeç</button>
                        <button onClick={handleBulkSubmit} disabled={loading || addedItems.length === 0} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            Faturayı Stoğa Al ve Kaydet
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
