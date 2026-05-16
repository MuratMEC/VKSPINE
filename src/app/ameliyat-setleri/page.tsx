"use client";

import { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, X, Search, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, Tag, Ruler, Building2, Package, Hash } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    utsCode?: string | null;
    dimension?: string | null;
    brand?: string | null;
    category?: { name: string } | null;
    setCategory?: { name: string } | null;
}

interface KitItem {
    id?: string;
    productId: string;
    quantity: number;
    product?: Product;
}

interface SurgeryKit {
    id: string;
    name: string;
    description?: string | null;
    items: KitItem[];
}

export default function AmeliyatSetleriPage() {
    const [kits, setKits] = useState<SurgeryKit[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedKit, setExpandedKit] = useState<string | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [editingKit, setEditingKit] = useState<SurgeryKit | null>(null);
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formItems, setFormItems] = useState<KitItem[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [kR, pR] = await Promise.all([fetch('/api/surgery-kits'), fetch('/api/products')]);
            if (kR.ok) setKits(await kR.json());
            if (pR.ok) setAllProducts(await pR.json());
        } finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const openNew = () => {
        setEditingKit(null); setFormName(''); setFormDesc(''); setFormItems([]);
        setErrorMsg(''); setSuccessMsg(''); setShowModal(true);
    };

    const openEdit = (kit: SurgeryKit) => {
        setEditingKit(kit); setFormName(kit.name); setFormDesc(kit.description || '');
        setFormItems(kit.items.map(i => ({ productId: i.productId, quantity: i.quantity, product: i.product })));
        setErrorMsg(''); setSuccessMsg(''); setShowModal(true);
    };

    const filtered = allProducts.filter(p => {
        const q = productSearch.toLowerCase();
        return !q || p.name.toLowerCase().includes(q) ||
            (p.utsCode?.toLowerCase().includes(q)) ||
            (p.dimension?.toLowerCase().includes(q)) ||
            (p.brand?.toLowerCase().includes(q)) ||
            (p.category?.name.toLowerCase().includes(q));
    });

    const addProduct = (p: Product) => {
        if (formItems.find(i => i.productId === p.id)) { setErrorMsg('Bu ürün zaten eklendi.'); return; }
        setFormItems(prev => [...prev, { productId: p.id, quantity: 1, product: p }]);
        setProductSearch(''); setShowDropdown(false); setErrorMsg('');
    };

    const updateQty = (id: string, q: number) =>
        setFormItems(prev => prev.map(i => i.productId === id ? { ...i, quantity: Math.max(1, q) } : i));

    const removeItem = (id: string) => setFormItems(prev => prev.filter(i => i.productId !== id));

    const handleSubmit = async () => {
        if (!formName.trim()) { setErrorMsg('Set adı zorunludur.'); return; }
        if (!formItems.length) { setErrorMsg('En az bir ürün ekleyin.'); return; }
        setFormLoading(true); setErrorMsg('');
        try {
            const url = editingKit ? `/api/surgery-kits/${editingKit.id}` : '/api/surgery-kits';
            const method = editingKit ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: formName, description: formDesc, items: formItems }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSuccessMsg(editingKit ? 'Set güncellendi!' : 'Set oluşturuldu!');
            setShowModal(false); loadData();
        } catch (e: any) { setErrorMsg(e.message); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu seti silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/surgery-kits/${id}`, { method: 'DELETE' });
        loadData();
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* BAŞLIK */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-purple-600" /> Ameliyat Setleri
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Sık kullanılan malzeme gruplarını set olarak tanımlayın. Stok çıkışında tek tıkla yükleyin.</p>
                </div>
                <button onClick={openNew} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm shadow-purple-200">
                    <Plus className="w-4 h-4" /> Yeni Set Oluştur
                </button>
            </div>

            {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" /> {successMsg}
                </div>
            )}

            {/* SET LİSTESİ */}
            {loading ? (
                <div className="py-20 flex flex-col items-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                    <p>Setler yükleniyor...</p>
                </div>
            ) : kits.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-lg mb-1">Henüz ameliyat seti tanımlanmamış</h3>
                    <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">Sık kullanılan malzeme gruplarını set olarak kaydederek stok çıkışını hızlandırın.</p>
                    <button onClick={openNew} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700">İlk Seti Oluştur</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {kits.map(kit => (
                        <div key={kit.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Kit başlığı */}
                            <div
                                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                                onClick={() => setExpandedKit(expandedKit === kit.id ? null : kit.id)}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                        <Layers className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900">{kit.name}</div>
                                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                            {kit.description && <span className="text-xs text-slate-500">{kit.description}</span>}
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                                <Package className="w-3 h-3" /> {kit.items.length} kalem
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                    <button onClick={e => { e.stopPropagation(); openEdit(kit); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Düzenle">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); handleDelete(kit.id); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Sil">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="text-slate-300 ml-1">
                                        {expandedKit === kit.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                            </div>

                            {/* Ürün listesi */}
                            {expandedKit === kit.id && (
                                <div className="border-t border-slate-100 divide-y divide-slate-50">
                                    {kit.items.map((item, idx) => (
                                        <div key={item.id || idx} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50/50">
                                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-slate-900 text-sm">{item.product?.name}</div>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    {item.product?.dimension && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-medium">
                                                            <Ruler className="w-2.5 h-2.5" /> {item.product.dimension}
                                                        </span>
                                                    )}
                                                    {item.product?.category && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-medium">
                                                            <Tag className="w-2.5 h-2.5" /> {item.product.category.name}
                                                        </span>
                                                    )}
                                                    {item.product?.setCategory && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100 font-medium">
                                                            <Layers className="w-2.5 h-2.5" /> {item.product.setCategory.name}
                                                        </span>
                                                    )}
                                                    {item.product?.brand && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                                            <Building2 className="w-2.5 h-2.5" /> {item.product.brand}
                                                        </span>
                                                    )}
                                                    {item.product?.utsCode && (
                                                        <span className="text-[11px] text-slate-400 font-mono">ÜTS: {item.product.utsCode}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span className="inline-flex items-center gap-1 font-bold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full text-sm">
                                                    <Hash className="w-3 h-3" /> {item.quantity} adet
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
                        {/* Modal başlık */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">{editingKit ? 'Seti Düzenle' : 'Yeni Ameliyat Seti'}</h2>
                                    <p className="text-xs text-slate-500">Set adını girin ve ürünleri ekleyin</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {errorMsg && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                                </div>
                            )}

                            {/* Set Adı + Açıklama */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Set Adı <span className="text-rose-500">*</span></label>
                                    <input
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)}
                                        placeholder="Örn: Posterior Servikal Vida Seti"
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all hover:border-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Açıklama</label>
                                    <input
                                        value={formDesc}
                                        onChange={e => setFormDesc(e.target.value)}
                                        placeholder="Kullanım notu veya açıklama..."
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all hover:border-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Ürün Arama */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Sete Ürün Ekle <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={productSearch}
                                        onChange={e => { setProductSearch(e.target.value); setShowDropdown(true); }}
                                        onFocus={() => setShowDropdown(true)}
                                        placeholder="Ürün adı, ÜTS kodu, boyut veya marka ile ara..."
                                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none hover:border-slate-300"
                                    />
                                    {showDropdown && productSearch && (
                                        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-2xl max-h-60 overflow-y-auto">
                                            {filtered.length > 0 ? filtered.slice(0, 40).map(p => (
                                                <div key={p.id} onClick={() => addProduct(p)}
                                                    className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                                                    <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        {p.dimension && <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100"><Ruler className="w-2.5 h-2.5" />{p.dimension}</span>}
                                                        {p.category && <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100"><Tag className="w-2.5 h-2.5" />{p.category.name}</span>}
                                                        {p.setCategory && <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100"><Layers className="w-2.5 h-2.5" />{p.setCategory.name}</span>}
                                                        {p.brand && <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.brand}</span>}
                                                        {p.utsCode && <span className="text-[11px] text-slate-400 font-mono">ÜTS: {p.utsCode}</span>}
                                                    </div>
                                                </div>
                                            )) : <div className="p-4 text-sm text-slate-500 text-center">Sonuç bulunamadı</div>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Seçilen Ürünler */}
                            {formItems.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold text-slate-700">Sette Bulunan Ürünler ({formItems.length})</label>
                                        <span className="text-xs text-slate-500">Adet sütununu düzenleyebilirsiniz</span>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="divide-y divide-slate-100">
                                            {formItems.map((item, idx) => (
                                                <div key={item.productId} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 group">
                                                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-slate-900 text-sm truncate">{item.product?.name}</div>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {item.product?.dimension && <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-100"><Ruler className="w-2 h-2" />{item.product.dimension}</span>}
                                                            {item.product?.category && <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-100"><Tag className="w-2 h-2" />{item.product.category.name}</span>}
                                                            {item.product?.brand && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{item.product.brand}</span>}
                                                            {item.product?.utsCode && <span className="text-[10px] text-slate-400 font-mono">ÜTS: {item.product.utsCode}</span>}
                                                        </div>
                                                    </div>
                                                    {/* Adet kontrolü */}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button type="button" onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center transition-colors">−</button>
                                                        <input
                                                            type="number" min={1} value={item.quantity}
                                                            onChange={e => updateQty(item.productId, parseInt(e.target.value) || 1)}
                                                            className="w-12 text-center border border-slate-200 rounded-lg py-1 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                                        />
                                                        <button type="button" onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center transition-colors">+</button>
                                                    </div>
                                                    <button onClick={() => removeItem(item.productId)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-purple-50 px-4 py-2 border-t border-purple-100 flex items-center justify-between">
                                            <span className="text-xs text-purple-700 font-medium">Toplam {formItems.reduce((s, i) => s + i.quantity, 0)} adet malzeme</span>
                                            <span className="text-xs text-purple-600">{formItems.length} farklı ürün</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                            <span className="text-xs text-slate-500">
                                {formItems.length > 0 ? `${formItems.length} ürün seçildi` : 'Ürün eklenmedi'}
                            </span>
                            <div className="flex gap-3">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                                    İptal
                                </button>
                                <button onClick={handleSubmit} disabled={formLoading} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm shadow-purple-200">
                                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    {editingKit ? 'Güncelle' : 'Seti Kaydet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
