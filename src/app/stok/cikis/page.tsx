"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Loader2, CheckCircle, AlertCircle, Building2, PlusCircle, Trash2, ArrowRightToLine, X, Layers, Boxes, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StokCikisPage() {
    const router = useRouter();

    // Data State
    const [activeLots, setActiveLots] = useState<any[]>([]);
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [surgeryKits, setSurgeryKits] = useState<any[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showKitModal, setShowKitModal] = useState(false);

    // Üst Bilgi
    const [headerData, setHeaderData] = useState({
        customerId: '',
        selectedCustomerName: '',
        movementDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Müşteri Arama
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    // Ürün Arama Filtreleri
    const [searchFilters, setSearchFilters] = useState({ name: '', dimension: '', category: '', setCategory: '' });
    const [showDropdown, setShowDropdown] = useState(false);

    // Aktif Satır
    const [itemData, setItemData] = useState({ lotSerialId: '', selectedProductName: '', lotNo: '', maxQuantity: 0, quantity: 1 });

    // Sepet
    const [addedItems, setAddedItems] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            fetch('/api/stock/active-lots').then(res => res.json()),
            fetch('/api/customers').then(res => res.json()),
            fetch('/api/surgery-kits').then(res => res.json())
        ]).then(([lots, customers, kits]) => {
            if (Array.isArray(lots)) setActiveLots(lots);
            if (Array.isArray(customers)) setAllCustomers(customers);
            if (Array.isArray(kits)) setSurgeryKits(kits);
        }).catch(err => console.error("Veri çekme hatası:", err));
    }, []);

    const filteredLots = activeLots.filter(l => {
        const hasFilters = searchFilters.name || searchFilters.dimension || searchFilters.category || searchFilters.setCategory;
        if (!hasFilters) return true;
        let match = true;
        if (searchFilters.name) {
            const term = searchFilters.name.toLowerCase();
            match = match && (
                (l.productName && l.productName.toLowerCase().includes(term)) ||
                (l.lotNo && l.lotNo.toLowerCase().includes(term)) ||
                (l.productUts && l.productUts.toLowerCase().includes(term))
            );
        }
        if (searchFilters.dimension) match = match && !!(l.productDimension && l.productDimension.toLowerCase().includes(searchFilters.dimension.toLowerCase()));
        return match;
    });

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemData.lotSerialId || itemData.quantity <= 0) return;
        if (addedItems.find(i => i.lotSerialId === itemData.lotSerialId)) {
            setErrorMsg("Bu Lot zaten eklendi.");
            return;
        }
        setAddedItems(prev => [...prev, { id: Date.now().toString(), ...itemData }]);
        setItemData({ lotSerialId: '', selectedProductName: '', lotNo: '', maxQuantity: 0, quantity: 1 });
        setSearchFilters({ name: '', dimension: '', category: '', setCategory: '' });
        setErrorMsg('');
    };

    const handleKitLoad = (kit: any) => {
        const newItems: any[] = [];
        const missingProducts: string[] = [];
        
        kit.items.forEach((ki: any) => {
            // FEFO: En yakın SKT'li ve yeterli miktarı olan Lot'u bul
            const availableLots = activeLots
                .filter(l => l.productId === ki.productId && l.quantity >= ki.quantity)
                .sort((a, b) => {
                    if (!a.expDate) return 1;
                    if (!b.expDate) return -1;
                    return new Date(a.expDate).getTime() - new Date(b.expDate).getTime();
                });

            const bestLot = availableLots[0];

            if (bestLot) {
                // Sepette zaten var mı kontrol et
                const alreadyInCart = addedItems.some(i => i.lotSerialId === bestLot.id);
                if (!alreadyInCart) {
                    newItems.push({
                        id: Math.random().toString(),
                        lotSerialId: bestLot.id,
                        selectedProductName: bestLot.productName,
                        lotNo: bestLot.lotNo,
                        maxQuantity: bestLot.quantity,
                        quantity: ki.quantity
                    });
                }
            } else {
                missingProducts.push(ki.product?.name || "Bilinmeyen Ürün");
            }
        });

        if (newItems.length > 0) {
            setAddedItems(prev => [...prev, ...newItems]);
            setSuccess(`${newItems.length} kalem ürün sete göre eklendi.`);
        }

        if (missingProducts.length > 0) {
            setErrorMsg(`Eksik Stok: ${missingProducts.join(", ")} ürünleri stokta (yeterli miktarda) bulunamadığı için eklenemedi.`);
        } else {
            setErrorMsg('');
        }

        setShowKitModal(false);
    };

    const handleBulkSubmit = async () => {
        if (!headerData.customerId) { setErrorMsg("Lütfen önce müşteri seçin."); return; }
        if (addedItems.length === 0) { setErrorMsg("Lütfen çıkış yapılacak ürün ekleyin."); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/stock/exit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...headerData, surgeryDate: headerData.movementDate, items: addedItems, isSimpleExit: true })
            });
            if (!res.ok) throw new Error("Çıkış yapılamadı.");
            setSuccess("Stok çıkışı başarıyla tamamlandı!");
            setTimeout(() => router.push('/stok/hareketler'), 1500);
        } catch (err: any) { setErrorMsg(err.message); } finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <ArrowRightToLine className="w-8 h-8 text-rose-600" /> Yeni Stok Çıkışı
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Ürünlerin çıkışını hızlıca gerçekleştirin.</p>
                </div>
                <Link href="/stok/hareketler" className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Hareketler
                </Link>
            </div>

            {(success || errorMsg) && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-300 ${success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                    {success ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                    <p className="font-bold text-sm leading-relaxed">{success || errorMsg}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-500" />
                    <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">1. Müşteri ve Çıkış Bilgileri</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative">
                        <label className="text-sm font-bold text-slate-700">Müşteri / Kurum Seçimi <span className="text-rose-500">*</span></label>
                        {headerData.selectedCustomerName ? (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex justify-between items-center">
                                <span className="font-bold text-rose-900 text-sm truncate">{headerData.selectedCustomerName}</span>
                                <button onClick={() => setHeaderData({...headerData, customerId: '', selectedCustomerName: ''})} className="text-rose-600 font-bold text-xs">DEĞİŞTİR</button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input type="text" placeholder="Müşteri ara..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500" value={customerSearch} onChange={(e) => {setCustomerSearch(e.target.value); setShowCustomerDropdown(true);}} onFocus={() => setShowCustomerDropdown(true)} />
                                {showCustomerDropdown && (
                                    <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                        {allCustomers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                                            <div key={c.id} className="p-3 hover:bg-rose-50 cursor-pointer text-sm font-medium border-b border-slate-50" onClick={() => {setHeaderData({...headerData, customerId: c.id, selectedCustomerName: c.name}); setShowCustomerDropdown(false);}}>{c.name}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Çıkış Tarihi</label>
                        <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500" value={headerData.movementDate} onChange={(e) => setHeaderData({...headerData, movementDate: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Boxes className="w-5 h-5 text-slate-500" />
                        <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">2. Ürün Seçimi ve Çıkış Kalemleri</h2>
                    </div>
                    <button onClick={() => setShowKitModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">
                        <Layers size={14} /> Hazır Set Yükle
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleAddItem} className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Ürün Ara (Filtreleyerek Bul)</label>
                            {itemData.lotSerialId ? (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex justify-between items-center animate-in slide-in-from-top-2 duration-200">
                                    <div>
                                        <p className="font-bold text-blue-900">{itemData.selectedProductName}</p>
                                        <p className="text-xs text-blue-600 font-medium">Lot: <span className="font-black">{itemData.lotNo}</span> • Depoda: <span className="font-black text-blue-700">{itemData.maxQuantity} Adet</span></p>
                                    </div>
                                    <button type="button" onClick={() => setItemData({lotSerialId: '', selectedProductName: '', lotNo: '', maxQuantity: 0, quantity: 1})} className="text-blue-600 font-black text-xs px-3 py-1.5 bg-white rounded-lg border border-blue-200 shadow-sm">DEĞİŞTİR</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
                                    <div className="relative">
                                        <input type="text" placeholder="Ürün Adı / Lot" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500" value={searchFilters.name} onChange={(e) => {setSearchFilters({...searchFilters, name: e.target.value}); setShowDropdown(true);}} onFocus={() => setShowDropdown(true)} />
                                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                                    </div>
                                    <input type="text" placeholder="Ölçü" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none" value={searchFilters.dimension} onChange={(e) => setSearchFilters({...searchFilters, dimension: e.target.value})} />
                                    <input type="text" placeholder="Kategori" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none" value={searchFilters.category} onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})} />
                                    <input type="text" placeholder="Set" className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none" value={searchFilters.setCategory} onChange={(e) => setSearchFilters({...searchFilters, setCategory: e.target.value})} />
                                    {showDropdown && (searchFilters.name || searchFilters.dimension) && (
                                        <div className="absolute z-50 w-full top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden">
                                            {filteredLots.map(l => (
                                                <div key={l.id} className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex justify-between items-center group transition-colors" onClick={() => {
                                                    setItemData({ lotSerialId: l.id, selectedProductName: l.productName, lotNo: l.lotNo, maxQuantity: l.quantity, quantity: 1 });
                                                    setShowDropdown(false);
                                                }}>
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <p className="font-bold text-slate-900 text-sm truncate group-hover:text-rose-600 transition-colors">{l.productName}</p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 rounded">LOT: {l.lotNo}</span>
                                                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 rounded">{l.productDimension}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-rose-600 text-sm">{l.quantity}</p>
                                                        <p className="text-[9px] text-slate-400 font-black uppercase">STOK</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-end gap-4">
                            <div className="w-40">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Miktar</label>
                                <input type="number" className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-center font-black text-xl outline-none focus:ring-2 focus:ring-rose-500" value={itemData.quantity} onChange={(e) => setItemData({...itemData, quantity: Math.min(parseInt(e.target.value) || 1, itemData.maxQuantity)})} disabled={!itemData.lotSerialId} />
                            </div>
                            <button type="submit" disabled={!itemData.lotSerialId} className="flex-1 p-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                <PlusCircle size={18} /> Listeye Al
                            </button>
                        </div>
                    </form>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Çıkış Yapılacak Ürünler ({addedItems.length})</h3>
                        <div className="overflow-hidden border border-slate-100 rounded-2xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr><th className="p-4">Ürün</th><th className="p-4">Lot</th><th className="p-4 text-center">Adet</th><th className="p-4 text-right">İşlem</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {addedItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4"><p className="font-bold text-slate-800">{item.selectedProductName}</p></td>
                                            <td className="p-4"><span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{item.lotNo}</span></td>
                                            <td className="p-4 text-center"><span className="font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full">{item.quantity}</span></td>
                                            <td className="p-4 text-right"><button onClick={() => setAddedItems(prev => prev.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={18}/></button></td>
                                        </tr>
                                    ))}
                                    {addedItems.length === 0 && (
                                        <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">Henüz ürün eklenmedi.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <button onClick={handleBulkSubmit} disabled={loading || addedItems.length === 0} className="w-full p-5 bg-rose-600 text-white rounded-[2.5rem] font-black text-lg hover:bg-rose-700 shadow-2xl shadow-rose-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <ArrowRightToLine />}
                        STOK ÇIKIŞINI ONAYLA
                    </button>
                </div>
            </div>

            {/* SET SEÇİM MODALI - GELİŞTİRİLMİŞ */}
            {showKitModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 space-y-6 shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase">Hazır Set Yükle</h2>
                                <p className="text-xs text-slate-400 font-medium">İçeriği kontrol edin ve stoktaki ürünleri ekleyin.</p>
                            </div>
                            <button onClick={() => setShowKitModal(false)} className="text-slate-400 hover:text-rose-600 transition-colors"><X /></button>
                        </div>
                        
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                            {surgeryKits.map(kit => (
                                <div key={kit.id} className="p-5 bg-slate-50 border border-slate-200 rounded-[2rem] hover:border-indigo-400 transition-all flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-black text-slate-800 text-base uppercase">{kit.name}</p>
                                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{kit.items.length} KALEM İÇERİK</p>
                                        </div>
                                        <button 
                                            onClick={() => handleKitLoad(kit)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                                        >
                                            SETİ YÜKLE
                                        </button>
                                    </div>
                                    
                                    {/* Set İçeriği Önizleme */}
                                    <div className="grid grid-cols-1 gap-1.5 p-3 bg-white/50 rounded-2xl border border-slate-100">
                                        {kit.items.map((ki: any, idx: number) => {
                                            const lot = activeLots.find(l => l.productId === ki.productId && l.quantity >= ki.quantity);
                                            return (
                                                <div key={idx} className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-slate-600 truncate max-w-[180px]">
                                                        • {ki.product?.name}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400">{ki.quantity} Adet</span>
                                                        {lot ? (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> Stok Var
                                        <div className="w-2 h-2 rounded-full bg-rose-500 ml-2" /> Stok Yok
                                    </div>
                                </div>
                            ))}
                            {surgeryKits.length === 0 && <p className="text-center py-10 text-slate-400 italic">Kayıtlı set bulunamadı.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
