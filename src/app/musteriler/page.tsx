"use client";

import { useState, useEffect } from 'react';
import { Users, Plus, Loader2, RefreshCcw, Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Customer } from '@prisma/client';

export default function MusterilerPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadCustomers = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/customers');
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error("Müşteriler çekilemedi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" müşterisini silmek istediğinize emin misiniz?`)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Silme işlemi başarısız.');
            }
            setCustomers(prev => prev.filter(c => c.id !== id));
        } catch (err: any) {
            alert('Hata: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    // ... (filteredCustomers logic remains the same)
    const filteredCustomers = customers.filter(cust => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            cust.name.toLowerCase().includes(term) ||
            (cust.taxNumber && cust.taxNumber.toLowerCase().includes(term)) ||
            (cust.contactPerson && cust.contactPerson.toLowerCase().includes(term)) ||
            (cust.phone && cust.phone.toLowerCase().includes(term)) ||
            (cust.email && cust.email.toLowerCase().includes(term)) ||
            (cust.address && cust.address.toLowerCase().includes(term))
        );
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Müşteriler / Hastaneler
                    </h1>
                    <p className="text-slate-500 mt-1">Sisteme kayıtlı hastaneler ve müşterileri yönetin.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadCustomers} className="px-3 py-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" title="Yenile">
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <Link href="/musteriler/yeni" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" /> Yeni Müşteri
                    </Link>
                </div>
            </div>

            {/* ARAMA BAR */}
            <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Kurum adı, vergi no, kişi, telefon ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto text-sm text-slate-500">
                    Toplam <strong className="mx-1">{filteredCustomers.length}</strong> müşteri
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-b-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Kayıtlı kurumlar getiriliyor...</p>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="bg-white rounded-b-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz kayıtlı müşteri yok'}
                    </h3>
                    {!searchTerm && (
                        <p className="text-slate-500 max-w-md pb-6">Manuel olarak kurum ekleyebilir veya topluca Excel üzerinden içe aktarım yapabilirsiniz.</p>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Firma / Kurum Adı</th>
                                    <th className="px-6 py-4">Vergi No</th>
                                    <th className="px-6 py-4">Yetkili Kişi</th>
                                    <th className="px-6 py-4">Telefon</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCustomers.map((cust) => (
                                    <tr key={cust.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{cust.name}</div>
                                            <div className="text-slate-500 text-xs mt-0.5 max-w-[200px] truncate" title={cust.address || ''}>
                                                {cust.address || 'Adres Girilmemiş'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600">
                                            {cust.taxNumber || '-'}
                                            {cust.taxOffice && <span className="block text-xs text-slate-400 font-sans mt-0.5">{cust.taxOffice}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">{cust.contactPerson || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">{cust.phone || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link 
                                                    href={`/musteriler/${cust.id}/duzenle`}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                >
                                                    <Edit className="w-3.5 h-3.5" /> Düzenle
                                                </Link>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(cust.id, cust.name); }}
                                                    disabled={deletingId === cust.id}
                                                    className="text-rose-500 hover:text-rose-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    {deletingId === cust.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Sil
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                        <span>Toplam <strong>{filteredCustomers.length}</strong> müşteri kaydı bulunuyor.</span>
                    </div>
                </div>
            )}
        </div>
    );
}
