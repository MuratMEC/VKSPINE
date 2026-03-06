"use client";

import { useState } from 'react';
import { Truck, ArrowLeft, Building, MapPin, Hash, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function YeniTedarikciPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        companyName: '',
        taxOffice: '',
        taxNumber: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccess(false);

        try {
            const res = await fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Kayıt sırasında bir hata oluştu.');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/tedarikciler');
                router.refresh();
            }, 2000);

        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Üst Kısım */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/tedarikciler" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" /> Tedarikçilere Dön
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Truck className="w-6 h-6 text-blue-600" />
                        Yeni Tedarikçi Kartı
                    </h1>
                    <p className="text-slate-500 mt-1">Sisteme mal alımı yaptığınız yeni bir üretici veya tedarikçi firmayı tanımlayın.</p>
                </div>
            </div>

            {/* BAŞARI / HATA MESAJLARI */}
            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <p className="font-medium">Tedarikçi başarıyla eklendi. Listeye yönlendiriliyorsunuz...</p>
                </div>
            )}
            {errorMsg && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <p className="font-medium">{errorMsg}</p>
                </div>
            )}

            {/* FORM ALANI */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Kısım: Kurumsal Bilgiler */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <Building className="w-4 h-4 text-blue-500" /> 1. Şirket Bilgileri
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Firma Ünvanı <span className="text-rose-500">*</span></label>
                                    <input required name="companyName" value={formData.companyName} onChange={handleChange} type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Örn: X Medikal Üretim A.Ş." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Vergi Dairesi</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input name="taxOffice" value={formData.taxOffice} onChange={handleChange} type="text" className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Örn: İkitelli V.D." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Vergi Numarası / TCKN</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input name="taxNumber" value={formData.taxNumber} onChange={handleChange} type="text" maxLength={11} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="10 veya 11 Haneli No" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Kısım: İletişim & Adres */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-500" /> 2. İletişim ve Adres
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Firma Yetkilisi (Satış/Finans)</label>
                                    <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ad Soyad" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">İletişim Telefonu</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" placeholder="05XX XXX XX XX" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">E-Posta Adresi</label>
                                    <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="ornek@firma.com" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Açık Adres Bilgisi</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y" placeholder="Fatura veya üretim adresi..."></textarea>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Özel Notlar</label>
                                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y" placeholder="Tedarikçi ile ilgili ek şartlar, vadeler vs..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                            <Link href="/tedarikciler" className="px-6 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-colors">Vazgeç</Link>
                            <button disabled={loading} type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md disabled:bg-blue-400">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tedarikçiyi Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
