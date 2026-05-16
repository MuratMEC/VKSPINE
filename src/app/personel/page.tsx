"use client";

import { useState, useEffect } from 'react';
import { UserCircle2, Plus, Trash2, Edit2, X, Search, CheckCircle, AlertCircle, Loader2, Phone, Mail, BadgeCheck, UserPlus } from 'lucide-react';

interface Personnel {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    role?: string | null;
    isActive: boolean;
}

export default function PersonnelPage() {
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        role: 'Teknisyen',
        isActive: true
    });
    
    const [formLoading, setFormLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/personnel');
            if (res.ok) setPersonnel(await res.json());
        } finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const openNew = () => {
        setEditingPerson(null);
        setFormData({ name: '', phone: '', email: '', role: 'Teknisyen', isActive: true });
        setErrorMsg('');
        setShowModal(true);
    };

    const openEdit = (p: Personnel) => {
        setEditingPerson(p);
        setFormData({ 
            name: p.name, 
            phone: p.phone || '', 
            email: p.email || '', 
            role: p.role || 'Teknisyen',
            isActive: p.isActive
        });
        setErrorMsg('');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) { setErrorMsg('İsim alanı zorunludur.'); return; }
        
        setFormLoading(true);
        setErrorMsg('');
        try {
            const url = editingPerson ? `/api/personnel/${editingPerson.id}` : '/api/personnel';
            const method = editingPerson ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'İşlem başarısız.');
            }
            
            setShowModal(false);
            loadData();
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`/api/personnel/${id}`, { method: 'DELETE' });
            loadData();
        } catch (e) {
            alert('Silme işlemi başarısız.');
        }
    };

    const filtered = personnel.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UserCircle2 className="w-7 h-7 text-blue-600" /> Personel Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Saha personeli ve ameliyat teknisyenlerini yönetin.</p>
                </div>
                <button 
                    onClick={openNew}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                    <UserPlus className="w-4 h-4" /> Yeni Personel Ekle
                </button>
            </div>

            {/* Arama Barı */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Personel adı veya rolüne göre ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Liste */}
            {loading ? (
                <div className="py-20 flex flex-col items-center text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-medium">Personel verileri yükleniyor...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCircle2 className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-slate-700">Kayıtlı personel bulunamadı</h3>
                    <p className="text-sm text-slate-500 mt-1">Yeni bir personel ekleyerek başlayabilirsiniz.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                        {p.name.charAt(0)}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold mt-1 mb-4">
                                    <BadgeCheck className="w-3 h-3 text-blue-500" /> {p.role}
                                </div>
                                
                                <div className="space-y-2.5">
                                    {p.phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Phone className="w-4 h-4 text-slate-400" /> {p.phone}
                                        </div>
                                    )}
                                    {p.email && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Mail className="w-4 h-4 text-slate-400" /> {p.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Durum</span>
                                <span className={`flex items-center gap-1.5 text-xs font-bold ${p.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    <div className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    {p.isActive ? 'Aktif / Boşta' : 'Pasif'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="font-bold text-slate-900">{editingPerson ? 'Personel Güncelle' : 'Yeni Personel'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {errorMsg && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-sm font-medium">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Personel Durumu</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ad Soyad *</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Örn: Ahmet Yılmaz"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Telefon</label>
                                    <input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="05xx..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Rol</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="Teknisyen">Teknisyen</option>
                                        <option value="Saha Sorumlusu">Saha Sorumlusu</option>
                                        <option value="Satış Temsilcisi">Satış Temsilcisi</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">E-Posta</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="ornek@mail.com"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 text-slate-600 bg-white border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all">
                                    İptal
                                </button>
                                <button type="submit" disabled={formLoading} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    {editingPerson ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
