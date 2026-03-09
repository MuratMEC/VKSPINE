"use client";

import { useState, useEffect } from 'react';
import { Stethoscope, ArrowLeft, Search, Loader2, CheckCircle, AlertCircle, Building2, Calendar, PlusCircle, Trash2, UserRound, ArrowRightToLine, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StokCikisPage() {
    const router = useRouter();

    // Data State
    const [activeLots, setActiveLots] = useState<any[]>([]); // Sadece stoğu >0 olan lotlar
    const [allCustomers, setAllCustomers] = useState<any[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Üst Bilgi (Ameliyat / Müşteri)
    const [headerData, setHeaderData] = useState({
        customerId: '',
        selectedCustomerName: '',
        doctorName: '',
        patientName: '',
        surgeryDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Müşteri Arama State
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    // Çoklu Alan Arama State
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        dimension: '',
        category: '',
        setCategory: ''
    });
    const [showDropdown, setShowDropdown] = useState(false);

    // Aktif Girilen Satır
    const [itemData, setItemData] = useState({
        lotSerialId: '',
        selectedProductName: '',
        lotNo: '',
        maxQuantity: 0,
        quantity: 1
    });

    // Sepet (Kullanılan Kalemler)
    const [addedItems, setAddedItems] = useState<any[]>([]);

    useEffect(() => {
        // Stoğu olan Lotları Çek
        fetch('/api/stock/active-lots')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setActiveLots(data); })
            .catch(err => console.error(err));

        // Müşterileri Çek
        fetch('/api/customers')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setAllCustomers(data); })
            .catch(err => console.error(err));
    }, []);

    const filteredCustomers = allCustomers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase())
    );

    const hasAnySearchFilter = searchFilters.name || searchFilters.dimension || searchFilters.category || searchFilters.setCategory;

    const filteredLots = activeLots.filter(l => {
        if (!hasAnySearchFilter) return true;
        let match = true;
        if (searchFilters.name) {
            const term = searchFilters.name.toLowerCase();
            match = match && (
                (l.productName && l.productName.toLowerCase().includes(term)) ||
                (l.lotNo && l.lotNo.toLowerCase().includes(term)) ||
                (l.productUts && l.productUts.toLowerCase().includes(term)) ||
                (l.productBarcode && l.productBarcode.toLowerCase().includes(term))
            );
        }
        if (searchFilters.dimension) {
            const term = searchFilters.dimension.toLowerCase();
            match = match && !!(l.productDimension && l.productDimension.toLowerCase().includes(term));
        }
        if (searchFilters.category) {
            const term = searchFilters.category.toLowerCase();
            match = match && !!(l.productCategory && l.productCategory.toLowerCase().includes(term));
        }
        if (searchFilters.setCategory) {
            const term = searchFilters.setCategory.toLowerCase();
            match = match && !!(l.productSetCategory && l.productSetCategory.toLowerCase().includes(term));
        }
        return match;
    });

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();

        if (!itemData.lotSerialId || itemData.quantity <= 0) {
            setErrorMsg("Geçerli bir ürün Lot'u seçilmeli ve miktar 0'dan büyük olmalıdır.");
            return;
        }

        if (itemData.quantity > itemData.maxQuantity) {
            setErrorMsg(`Depoda bu lottan sadece ${itemData.maxQuantity} adet var. Daha fazla çıkış yapamazsınız.`);
            return;
        }

        // Aynı Lot'tan zaten eklendiyse uyar
        const alreadyExists = addedItems.find(i => i.lotSerialId === itemData.lotSerialId);
        if (alreadyExists) {
            setErrorMsg("Bu Lot numarası zaten listeye eklendi. Gerekirse listedeki kaydı silip tekrar ekleyin.");
            return;
        }

        const newItem = {
            id: Date.now().toString(),
            ...itemData
        };

        setAddedItems(prev => [...prev, newItem]);
        setErrorMsg('');

        // Formu satır bazlı sıfırla
        setItemData({
            lotSerialId: '',
            selectedProductName: '',
            lotNo: '',
            maxQuantity: 0,
            quantity: 1
        });
        setSearchFilters({ name: '', dimension: '', category: '', setCategory: '' });
    };

    const handleRemoveItem = (id: string) => {
        setAddedItems(prev => prev.filter(item => item.id !== id));
    };

    const handleBulkSubmit = async () => {
        if (!headerData.customerId || !headerData.doctorName) {
            setErrorMsg("Müşteri (Hastane/Bayi) ve Doktor adı girmek zorunludur.");
            return;
        }

        if (addedItems.length === 0) {
            setErrorMsg("Ameliyatta kullanılan hiçbir malzeme eklenmedi.");
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setSuccess('');

        try {
            const payload = {
                customerId: headerData.customerId,
                doctorName: headerData.doctorName,
                patientName: headerData.patientName,
                surgeryDate: headerData.surgeryDate,
                notes: headerData.notes,
                items: addedItems
            };

            const res = await fetch('/api/stock/exit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Ameliyat çıkışı yapılamadı.');
            }

            setSuccess(data.message || 'Stok çıkışı ve Ameliyat kaydı başarıyla tamamlandı!');

            // Ekranı Temizle
            setAddedItems([]);
            setHeaderData({ ...headerData, doctorName: '', patientName: '', notes: '' });

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
                    <ArrowRightToLine className="w-6 h-6 text-rose-600" />
                    Ameliyat / Stok Çıkış
                </h1>
                <p className="text-slate-500 mt-1">Hastanede kullanılan malzemeleri ilgili Lot üzerinden sistemden (stoktan) düşün.</p>
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

                {/* 1. ÜST BİLGİ ALANI (AMELİYAT BİLGİLERİ) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-rose-500">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-slate-700" />
                        <h2 className="font-semibold text-slate-800">1. Ameliyat / Müşteri Bilgileri</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                Müşteri / Hastane <span className="text-rose-500">*</span>
                            </label>
                            {headerData.selectedCustomerName ? (
                                <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                                    <span className="font-semibold text-rose-900 text-sm truncate pr-2">{headerData.selectedCustomerName}</span>
                                    <button type="button" onClick={() => setHeaderData({ ...headerData, customerId: '', selectedCustomerName: '' })} className="text-rose-600 hover:text-rose-800 font-medium text-xs whitespace-nowrap">Değiştir</button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setShowCustomerDropdown(true);
                                        }}
                                        onFocus={() => setShowCustomerDropdown(true)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 hover:border-slate-300 outline-none transition-all text-sm"
                                        placeholder="Müşteri / kurum ara ve seç..."
                                    />
                                    {showCustomerDropdown && (
                                        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-xl max-h-48 overflow-y-auto">
                                            {filteredCustomers.length > 0 ? (
                                                filteredCustomers.map(c => (
                                                    <div
                                                        key={c.id}
                                                        onClick={() => {
                                                            setHeaderData({ ...headerData, customerId: c.id, selectedCustomerName: c.name });
                                                            setCustomerSearch('');
                                                            setShowCustomerDropdown(false);
                                                        }}
                                                        className="px-3 py-2 hover:bg-rose-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                    >
                                                        <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
                                                        {c.contactPerson && <div className="text-[11px] text-slate-500 mt-0.5">{c.contactPerson}</div>}
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
                                <UserRound className="w-4 h-4 text-slate-400" />
                                Doktor Adı <span className="text-rose-500">*</span>
                            </label>
                            <input
                                value={headerData.doctorName}
                                onChange={e => setHeaderData({ ...headerData, doctorName: e.target.value })}
                                type="text"
                                placeholder="Örn: Dr. Ahmet Yılmaz"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 hover:border-slate-300 text-sm outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <UserRound className="w-4 h-4 text-slate-400" />
                                Hasta Adı (Opsiyonel)
                            </label>
                            <input
                                value={headerData.patientName}
                                onChange={e => setHeaderData({ ...headerData, patientName: e.target.value })}
                                type="text"
                                placeholder="İsmi veya Dosya No"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 hover:border-slate-300 text-sm outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                Ameliyat Tarihi
                            </label>
                            <input
                                value={headerData.surgeryDate}
                                onChange={e => setHeaderData({ ...headerData, surgeryDate: e.target.value })}
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 hover:border-slate-300 text-sm outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. KULLANILAN KALEMLER */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-slate-700" />
                            <h2 className="font-semibold text-slate-800">2. Kullanılan Malzemeler (Stoktan Düşülecekler)</h2>
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

                                {itemData.lotSerialId ? (
                                    <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono font-bold shrink-0">{itemData.lotNo}</span>
                                            <span className="font-semibold text-blue-900 text-sm truncate">{itemData.selectedProductName}</span>
                                            <span className="text-xs text-blue-600 border border-blue-200 px-2 rounded-full shrink-0">Depodaki: {itemData.maxQuantity} Adet</span>
                                        </div>
                                        <button type="button" onClick={() => setItemData({ lotSerialId: '', selectedProductName: '', lotNo: '', maxQuantity: 0, quantity: 1 })} className="text-blue-600 hover:text-blue-800 font-medium text-xs whitespace-nowrap ml-2">Değiştir</button>
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
                                                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm outline-none"
                                                    placeholder="Ürün Adı / Lot / Barkod"
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
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm outline-none"
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
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm outline-none"
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
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm outline-none"
                                                    placeholder="Set Kategorisi"
                                                />
                                            </div>
                                        </div>

                                        {showDropdown && hasAnySearchFilter && (
                                            <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-h-60 overflow-y-auto">
                                                {filteredLots.length > 0 ? (
                                                    filteredLots.map(lot => (
                                                        <div
                                                            key={lot.id}
                                                            onClick={() => {
                                                                setItemData({
                                                                    lotSerialId: lot.id,
                                                                    selectedProductName: `${lot.productName}${lot.productDimension ? ' — ' + lot.productDimension : ''}`,
                                                                    lotNo: lot.lotNo,
                                                                    maxQuantity: lot.quantity,
                                                                    quantity: 1
                                                                });
                                                                setShowDropdown(false);
                                                            }}
                                                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center group"
                                                        >
                                                            <div className="flex-1 min-w-0 pr-4">
                                                                <div className="font-semibold text-slate-900 text-sm truncate group-hover:text-blue-700">{lot.productName}</div>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">LOT: {lot.lotNo}</span>
                                                                    {lot.productDimension && <span className="text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">{lot.productDimension}</span>}
                                                                    {lot.productCategory && <span className="text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">{lot.productCategory}</span>}
                                                                    {lot.productSetCategory && <span className="text-[11px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium">{lot.productSetCategory}</span>}
                                                                    {lot.productUts && <span className="text-[11px] font-mono text-slate-400 px-1.5 py-0.5">ÜTS: {lot.productUts}</span>}
                                                                    {lot.expDate && <span className="text-[11px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">SKT: {new Date(lot.expDate).toLocaleDateString('tr-TR')}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="text-sm font-bold text-slate-700">{lot.quantity} <span className="text-xs font-normal">Adet</span></div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-sm text-slate-500 text-center">Girilen kritere uyan ve stoğu olan Lot bulunamadı.</div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Çıkış Miktarı ve Buton */}
                            <div className="flex items-end gap-4">
                                <div className="w-48">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Miktar (Kullanılan)</label>
                                    <div className="flex items-center">
                                        <input
                                            required
                                            value={itemData.quantity}
                                            onChange={e => setItemData({ ...itemData, quantity: Math.min(parseInt(e.target.value) || 1, itemData.maxQuantity) })}
                                            type="number"
                                            min="1"
                                            max={itemData.maxQuantity || 999}
                                            disabled={!itemData.lotSerialId}
                                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-l-lg focus:ring-2 focus:ring-rose-500 text-sm font-bold outline-none disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                        <div className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2.5 rounded-r-lg text-slate-500 text-sm font-medium">
                                            / {itemData.maxQuantity}
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={!itemData.lotSerialId} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm">
                                    Listeye Al
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Ameliyat Çıkış Sepeti */}
                    <div className="px-6 py-4">
                        {addedItems.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                <Stethoscope className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                Henüz çıkış yapılacak bir ürün eklenmedi.<br />Yukarıdan stokta olan Lot'ları aratarak ekleyebilirsiniz.
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs font-bold tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4 w-10">#</th>
                                            <th className="py-3 px-4">Ürün Adı</th>
                                            <th className="py-3 px-4">Lot No (Seçilen)</th>
                                            <th className="py-3 px-4 text-center">Çıkış Yapılan Adet</th>
                                            <th className="py-3 px-4 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {addedItems.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                                                <td className="py-3 px-4 font-medium text-slate-400">{index + 1}</td>
                                                <td className="py-3 px-4 font-semibold text-slate-800">{item.selectedProductName}</td>
                                                <td className="py-3 px-4 font-mono text-xs">
                                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">{item.lotNo}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="font-bold bg-rose-100 px-3 py-1 rounded-full text-rose-800">{item.quantity}</span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-rose-500 bg-white border border-rose-100 rounded-md hover:bg-rose-50 transition-colors">
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
                            {addedItems.length > 0 && <><span className="font-bold text-rose-700">{addedItems.length}</span> kalem ürün stoktan düşülecek</>}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => router.push('/stok/hareketler')} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-100 transition-colors">Vazgeç</button>
                            <button onClick={handleBulkSubmit} disabled={loading || addedItems.length === 0} className="px-6 py-2.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 flex items-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightToLine className="w-5 h-5" />}
                                Ameliyat Çıkışını Onayla ve Stoktan Düş
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
