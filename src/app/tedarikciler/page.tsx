"use client";

import { useState, useEffect } from 'react';
import { Building2, Plus, Upload, Search, Loader2, Trash2, Edit, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Supplier {
    id: string;
    companyName: string;
    taxOffice: string | null;
    taxNumber: string | null;
    contactPerson: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    isActive: boolean;
}

export default function TedarikcilerPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/suppliers');
            if (!res.ok) throw new Error('Tedarikçiler yüklenemedi.');
            const data = await res.json();
            setSuppliers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleDelete = async (id: string, companyName: string) => {
        if (!confirm(`"${companyName}" tedarikçisini silmek istediğinize emin misiniz?`)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Silme işlemi başarısız.');
            }
            // Listeden kaldır
            setSuppliers(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            alert('Hata: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    // İstemci taraflı arama filtresi
    const filteredSuppliers = suppliers.filter(s => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            s.companyName.toLowerCase().includes(term) ||
            (s.taxNumber && s.taxNumber.toLowerCase().includes(term)) ||
            (s.contactPerson && s.contactPerson.toLowerCase().includes(term)) ||
            (s.phone && s.phone.toLowerCase().includes(term)) ||
            (s.email && s.email.toLowerCase().includes(term))
        );
    });

    const getInitials = (name: string) => {
        return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    };

    const colors = [
        { bg: 'bg-blue-100', text: 'text-blue-600' },
        { bg: 'bg-indigo-100', text: 'text-indigo-600' },
        { bg: 'bg-violet-100', text: 'text-violet-600' },
        { bg: 'bg-emerald-100', text: 'text-emerald-600' },
        { bg: 'bg-amber-100', text: 'text-amber-600' },
        { bg: 'bg-rose-100', text: 'text-rose-600' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* BAŞLIK VE HIZLI EYLEMLER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        Tedarikçiler
                    </h1>
                    <p className="text-slate-500 mt-1">Ürün ve malzeme aldığınız ana üretici veya aracı firmalar.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Toplu Excel Yükleme
                    </button>
                    <Link href="/tedarikciler/yeni" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" /> Yeni Tedarikçi
                    </Link>
                </div>
            </div>

            {/* HATA MESAJI */}
            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* FİLTRE & ARAMA BAR */}
            <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tedarikçi adı, vergi no, kişi ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto text-sm text-slate-500">
                    Toplam <strong className="mx-1">{filteredSuppliers.length}</strong> tedarikçi
                </div>
            </div>

            {/* TEDARİKÇİLER TABLOSU */}
            <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Firma (Ünvan)</th>
                                <th className="px-6 py-4">Vergi Numarası</th>
                                <th className="px-6 py-4">İletişim Kişisi</th>
                                <th className="px-6 py-4">Telefon</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <span>Tedarikçiler yükleniyor...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <Building2 className="w-10 h-10" />
                                            <span className="text-base font-medium">
                                                {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz tedarikçi kaydı yok.'}
                                            </span>
                                            {!searchTerm && (
                                                <Link href="/tedarikciler/yeni" className="text-blue-600 hover:underline text-sm font-medium">
                                                    + İlk tedarikçinizi ekleyin
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((supplier, idx) => {
                                    const color = colors[idx % colors.length];
                                    return (
                                        <tr key={supplier.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-md ${color.bg} ${color.text} flex items-center justify-center font-bold text-xs shrink-0`}>
                                                        {getInitials(supplier.companyName)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{supplier.companyName}</div>
                                                        {supplier.address && (
                                                            <div className="text-slate-500 text-xs mt-0.5 max-w-[200px] truncate" title={supplier.address}>
                                                                {supplier.address}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-600">{supplier.taxNumber || '—'}</td>
                                            <td className="px-6 py-4 text-slate-700 font-medium">{supplier.contactPerson || '—'}</td>
                                            <td className="px-6 py-4 text-slate-600">{supplier.phone || '—'}</td>
                                            <td className="px-6 py-4">
                                                {supplier.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Pasif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                        title="Düzenle"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" /> Düzenle
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(supplier.id, supplier.companyName)}
                                                        disabled={deletingId === supplier.id}
                                                        className="text-rose-500 hover:text-rose-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                                                        title="Sil"
                                                    >
                                                        {deletingId === supplier.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                        Sil
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                    <span>Toplam <strong>{filteredSuppliers.length}</strong> tedarikçi kaydı bulunuyor.</span>
                </div>
            </div>
        </div>
    );
}
