"use client";

import { useState, useEffect } from 'react';
import { HardDrive, Plus, Trash2, Edit2, X, Search, CheckCircle, AlertCircle, Loader2, Cpu, Hash, Activity, Wrench } from 'lucide-react';

interface Device {
    id: string;
    name: string;
    serialNo: string;
    brand?: string | null;
    model?: string | null;
    status: string; // AVAILABLE, BUSY, MAINTENANCE
    lastService?: string | null;
}

export default function DevicesPage() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        serialNo: '',
        brand: '',
        model: '',
        status: 'AVAILABLE'
    });
    
    const [formLoading, setFormLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/devices');
            if (res.ok) setDevices(await res.json());
        } finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const openNew = () => {
        setEditingDevice(null);
        setFormData({ name: '', serialNo: '', brand: '', model: '', status: 'AVAILABLE' });
        setErrorMsg('');
        setShowModal(true);
    };

    const openEdit = (d: Device) => {
        setEditingDevice(d);
        setFormData({ 
            name: d.name, 
            serialNo: d.serialNo, 
            brand: d.brand || '', 
            model: d.model || '',
            status: d.status
        });
        setErrorMsg('');
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.serialNo.trim()) { 
            setErrorMsg('Cihaz adı ve Seri No zorunludur.'); 
            return; 
        }
        
        setFormLoading(true);
        setErrorMsg('');
        try {
            const url = editingDevice ? `/api/devices/${editingDevice.id}` : '/api/devices';
            const method = editingDevice ? 'PUT' : 'POST';
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
        if (!confirm('Bu cihazı silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`/api/devices/${id}`, { method: 'DELETE' });
            loadData();
        } catch (e) {
            alert('Silme işlemi başarısız.');
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'AVAILABLE': return { label: 'Müsait', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' };
            case 'BUSY': return { label: 'Ameliyatta', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' };
            case 'MAINTENANCE': return { label: 'Bakımda', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' };
            default: return { label: status, color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' };
        }
    };

    const filtered = devices.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <HardDrive className="w-7 h-7 text-indigo-600" /> Cihaz Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Motor setleri, el aletleri ve diğer demirbaşları takip edin.</p>
                </div>
                <button 
                    onClick={openNew}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-4 h-4" /> Yeni Cihaz Ekle
                </button>
            </div>

            {/* Arama Barı */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cihaz adı, Seri No veya markaya göre ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            {/* Liste */}
            {loading ? (
                <div className="py-20 flex flex-col items-center text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-medium">Cihaz verileri yükleniyor...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HardDrive className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-slate-700">Kayıtlı cihaz bulunamadı</h3>
                    <p className="text-sm text-slate-500 mt-1">Yeni bir cihaz ekleyerek demirbaş takibine başlayabilirsiniz.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(d => {
                        const status = getStatusLabel(d.status);
                        return (
                            <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Cpu className="w-6 h-6" />
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(d)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg">{d.name}</h3>
                                    <div className="flex items-center gap-2 mt-1 mb-4">
                                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                            <Hash className="w-3 h-3" /> {d.serialNo}
                                        </span>
                                        {d.brand && (
                                            <span className="text-xs text-slate-400 font-medium">{d.brand} {d.model}</span>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-50">
                                        <div className="text-center p-2 rounded-xl bg-slate-50">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Durum</div>
                                            <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${status.color}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                {status.label}
                                            </div>
                                        </div>
                                        <div className="text-center p-2 rounded-xl bg-slate-50">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Son Bakım</div>
                                            <div className="mt-1 text-[10px] font-bold text-slate-600">
                                                {d.lastService ? new Date(d.lastService).toLocaleDateString('tr-TR') : 'Kayıt Yok'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-2.5 bg-slate-50 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 border-t border-slate-100">
                                    <Activity className="w-3.5 h-3.5" /> Kullanım Geçmişini Gör
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="font-bold text-slate-900">{editingDevice ? 'Cihaz Güncelle' : 'Yeni Cihaz'}</h2>
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
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Cihaz Adı *</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Örn: Motor Seti, K-Wire Drill vb."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Seri Numarası *</label>
                                <input
                                    required
                                    value={formData.serialNo}
                                    onChange={e => setFormData({ ...formData, serialNo: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Unique SN..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Marka</label>
                                    <input
                                        value={formData.brand}
                                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Örn: Medtronic"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Durum</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="AVAILABLE">Müsait</option>
                                        <option value="BUSY">Ameliyatta</option>
                                        <option value="MAINTENANCE">Bakımda</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 text-slate-600 bg-white border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all">
                                    İptal
                                </button>
                                <button type="submit" disabled={formLoading} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    {editingDevice ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
