"use client";

import { useState, useEffect } from 'react';
import { Activity, Calendar, User, HardDrive, Building2, MapPin, ChevronRight, Search, Filter, CheckCircle2, Clock, Loader2, UserCircle2, Cpu, PlusCircle, X } from 'lucide-react';
import Link from 'next/link';

interface Surgery {
    id: string;
    doctorName: string;
    patientName?: string | null;
    surgeryDate: string;
    status: string;
    hospitalName?: string | null;
    city?: string | null;
    customer: { name: string };
    personnel: { id: string, name: string, role: string }[];
    devices: { id: string, name: string, serialNo: string }[];
}

export default function OperationsPage() {
    const [surgeries, setSurgeries] = useState<Surgery[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'personnel' | 'devices' | 'calendar'>('all');
    const [seedLoading, setSeedLoading] = useState(false);
    
    // Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
    
    // Resource States for Selection
    const [allPersonnel, setAllPersonnel] = useState<any[]>([]);
    const [allDevices, setAllDevices] = useState<any[]>([]);
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    
    // Form State
    const [formData, setFormData] = useState({
        doctorName: '',
        patientName: '',
        surgeryDate: '',
        hospitalName: '',
        city: '',
        customerId: '',
        personnelIds: [] as string[],
        deviceIds: [] as string[],
        status: 'planned'
    });

    const loadData = () => {
        setLoading(true);
        fetch('/api/surgeries')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setSurgeries(data); })
            .finally(() => setLoading(false));

        fetch('/api/personnel')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setAllPersonnel(data.filter((p:any) => p.isActive)); });

        fetch('/api/devices')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setAllDevices(data); });

        fetch('/api/customers')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setAllCustomers(data); });
    };

    useEffect(() => { loadData(); }, []);

    const handleEditOpen = (s: Surgery) => {
        setSelectedSurgery(s);
        setFormData({
            doctorName: s.doctorName,
            patientName: s.patientName || '',
            surgeryDate: s.surgeryDate.split('T')[0],
            hospitalName: s.hospitalName || '',
            city: s.city || '',
            customerId: s.id, // Not used for update but for form structure
            personnelIds: s.personnel.map(p => p.id),
            deviceIds: s.devices.map(d => d.id),
            status: s.status
        });
        setShowEditModal(true);
    };

    const handlePlanOpen = () => {
        setFormData({
            doctorName: '',
            patientName: '',
            surgeryDate: new Date().toISOString().split('T')[0],
            hospitalName: '',
            city: '',
            customerId: '',
            personnelIds: [],
            deviceIds: [],
            status: 'planned'
        });
        setShowPlanModal(true);
    };

    const handleSaveSurgery = async (isNew: boolean) => {
        const url = isNew ? '/api/stock/exit' : `/api/surgeries/${selectedSurgery?.id}`;
        const method = isNew ? 'POST' : 'PUT';

        // Planlama yaparken item zorunlu değil ama API'ye boş array göndermeliyiz
        const payload = isNew ? { ...formData, items: [] } : formData;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setShowEditModal(false);
            setShowPlanModal(false);
            loadData();
        }
    };

    const handleSeedDemo = async () => {
        if (!confirm('Sisteme 5 örnek personel ve 5 örnek cihaz eklenecektir. Onaylıyor musunuz?')) return;
        setSeedLoading(true);
        try {
            const res = await fetch('/api/demo/seed', { method: 'POST' });
            if (res.ok) {
                alert('Demo veriler başarıyla yüklendi!');
                loadData();
            }
        } finally {
            setSeedLoading(false);
        }
    };

    const filtered = surgeries.filter(s => 
        s.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.personnel.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // İstatistikler
    const totalToday = surgeries.filter(s => new Date(s.surgeryDate).toDateString() === new Date().toDateString()).length;
    const busyPersonnelCount = new Set(surgeries.flatMap(s => s.personnel.map(p => p.id))).size;
    const busyDeviceCount = new Set(surgeries.flatMap(s => s.devices.map(d => d.id))).size;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="w-7 h-7 text-rose-600" /> Operasyon Takip Paneli
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Saha operasyonlarını, ekip ve ekipman durumlarını anlık izleyin.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={handlePlanOpen}
                        className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-sm shadow-rose-200"
                    >
                        <Calendar className="w-4 h-4" /> Yeni Vaka Planla
                    </button>
                    <button 
                        onClick={handleSeedDemo}
                        disabled={seedLoading}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2 border border-slate-200"
                    >
                        {seedLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                        Demo Veri Yükle
                    </button>
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold text-slate-700">{totalToday} Bugün Planlanan</span>
                    </div>
                </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <UserCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{busyPersonnelCount}</div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Aktif Görevdeki Personel</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{busyDeviceCount}</div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kullanımdaki Cihazlar</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{surgeries.length}</div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam Operasyon Kaydı</div>
                    </div>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Tüm Operasyonlar
                    </button>
                    <button 
                        onClick={() => setActiveTab('personnel')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'personnel' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Personel Nerede?
                    </button>
                    <button 
                        onClick={() => setActiveTab('devices')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'devices' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Cihazlar Nerede?
                    </button>
                    <button 
                        onClick={() => setActiveTab('calendar')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Uygunluk Takvimi
                    </button>
                </div>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Doktor, hastane veya personel ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none shadow-sm"
                    />
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="py-20 flex flex-col items-center text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-medium">Operasyon verileri yükleniyor...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                    <h3 className="font-bold text-slate-700">Operasyon kaydı bulunamadı</h3>
                    <p className="text-sm text-slate-500 mt-1">Stok çıkışı yaparak ilk operasyon kaydınızı oluşturabilirsiniz.</p>
                </div>
            ) : activeTab === 'all' ? (
                <div className="space-y-4">
                    {filtered.map(s => (
                        <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    {/* Date & Time */}
                                    <div className="flex flex-row lg:flex-col items-center lg:items-start gap-3 lg:gap-1 lg:w-32 shrink-0">
                                        <div className="text-sm font-bold text-slate-900">{new Date(s.surgeryDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</div>
                                        <div className="text-xs font-medium text-slate-400 uppercase tracking-tighter">{new Date(s.surgeryDate).toLocaleDateString('tr-TR', { weekday: 'long' })}</div>
                                        <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                                            {s.status}
                                        </div>
                                    </div>

                                    {/* Operation Details */}
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-rose-600 transition-colors">Dr. {s.doctorName}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-semibold text-slate-700">{s.hospitalName || s.customer.name}</span>
                                                {s.city && (
                                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                                        <MapPin className="w-3 h-3" /> {s.city}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Resources (Personnel & Devices) */}
                                        <div className="flex flex-wrap gap-2 items-start">
                                            {s.personnel.map(p => (
                                                <div key={p.id} className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-100">
                                                    <User className="w-3 h-3" /> {p.name}
                                                </div>
                                            ))}
                                            {s.devices.map(d => (
                                                <div key={d.id} className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-bold border border-indigo-100">
                                                    <HardDrive className="w-3 h-3" /> {d.name}
                                                </div>
                                            ))}
                                            {s.personnel.length === 0 && s.devices.length === 0 && (
                                                <span className="text-[11px] text-slate-400 italic">Kaynak atanmamış</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="shrink-0 flex items-center justify-end">
                                        <button 
                                            onClick={() => handleEditOpen(s)}
                                            className="p-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all group/btn"
                                        >
                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : activeTab === 'calendar' ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Operasyon Takvimi (7 Günlük)</h3>
                        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500" /> Personel Ataması</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-500" /> Cihaz Ataması</div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 w-48 bg-white sticky left-0 z-10">Kaynak</th>
                                    {[...Array(7)].map((_, i) => {
                                        const date = new Date();
                                        date.setDate(date.getDate() + i);
                                        return (
                                            <th key={i} className="px-6 py-4 text-center text-xs font-bold text-slate-600 border-b border-slate-100 min-w-[120px]">
                                                {date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Personel Satırları */}
                                {Array.from(new Set(surgeries.flatMap(s => s.personnel.map(p => JSON.stringify(p))))).map(pStr => {
                                    const p = JSON.parse(pStr);
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-700 bg-white sticky left-0 z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    {p.name}
                                                </div>
                                            </td>
                                            {[...Array(7)].map((_, i) => {
                                                const date = new Date();
                                                date.setDate(date.getDate() + i);
                                                const hasSurgery = surgeries.find(s => 
                                                    new Date(s.surgeryDate).toDateString() === date.toDateString() &&
                                                    s.personnel.some(pers => pers.id === p.id)
                                                );
                                                return (
                                                    <td key={i} className="px-2 py-4 border-b border-slate-100 border-r border-slate-50 last:border-r-0">
                                                        {hasSurgery ? (
                                                            <div className="bg-blue-100 text-blue-700 text-[10px] p-2 rounded-lg font-bold text-center leading-tight shadow-sm border border-blue-200">
                                                                {hasSurgery.hospitalName || hasSurgery.customer.name}
                                                                <div className="text-[9px] mt-1 text-blue-500 opacity-80 italic font-medium truncate">Dr. {hasSurgery.doctorName}</div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-10 border border-dashed border-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-200 font-bold">MÜSAİT</div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}

                                {/* Cihaz Satırları */}
                                {Array.from(new Set(surgeries.flatMap(s => s.devices.map(d => JSON.stringify(d))))).map(dStr => {
                                    const d = JSON.parse(dStr);
                                    return (
                                        <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 border-b border-slate-100 font-bold text-sm text-slate-700 bg-white sticky left-0 z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                    {d.name}
                                                </div>
                                            </td>
                                            {[...Array(7)].map((_, i) => {
                                                const date = new Date();
                                                date.setDate(date.getDate() + i);
                                                const hasSurgery = surgeries.find(s => 
                                                    new Date(s.surgeryDate).toDateString() === date.toDateString() &&
                                                    s.devices.some(dev => dev.id === d.id)
                                                );
                                                return (
                                                    <td key={i} className="px-2 py-4 border-b border-slate-100 border-r border-slate-50 last:border-r-0">
                                                        {hasSurgery ? (
                                                            <div className="bg-indigo-100 text-indigo-700 text-[10px] p-2 rounded-lg font-bold text-center leading-tight shadow-sm border border-indigo-200">
                                                                {hasSurgery.hospitalName || hasSurgery.customer.name}
                                                                <div className="text-[9px] mt-1 text-indigo-500 opacity-80 italic font-medium truncate">Kullanımda</div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-10 border border-dashed border-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-200 font-bold">DEPO</div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-slate-50 text-[11px] text-slate-500 italic text-center">
                        * Takvim görünümü önümüzdeki 7 günlük süreci ve kaynakların anlık atamalarını baz almaktadır.
                    </div>
                </div>
            ) : activeTab === 'personnel' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Personel Bazlı Görünüm */}
                    {Array.from(new Set(surgeries.flatMap(s => s.personnel.map(p => JSON.stringify(p))))).map(pStr => {
                        const p = JSON.parse(pStr);
                        const pSurgeries = surgeries.filter(s => s.personnel.some(pers => pers.id === p.id));
                        const lastSurgery = pSurgeries[0];
                        
                        return (
                            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {p.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{p.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.role}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Mevcut Durum</div>
                                    {lastSurgery ? (
                                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                            <div className="text-[11px] font-bold text-blue-600 mb-1">ŞU AN BURADA:</div>
                                            <div className="text-xs font-bold text-slate-900 truncate">{lastSurgery.hospitalName || lastSurgery.customer.name}</div>
                                            <div className="text-[10px] text-slate-500 mt-1">Dr. {lastSurgery.doctorName}</div>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-400 font-medium italic text-center">
                                            Henüz bir ameliyat kaydı yok
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Cihaz Bazlı Görünüm */}
                    {Array.from(new Set(surgeries.flatMap(s => s.devices.map(d => JSON.stringify(d))))).map(dStr => {
                        const d = JSON.parse(dStr);
                        const dSurgeries = surgeries.filter(s => s.devices.some(dev => dev.id === d.id));
                        const lastSurgery = dSurgeries[0];
                        
                        return (
                            <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        <HardDrive className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{d.name}</h3>
                                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{d.serialNo}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Cihaz Lokasyonu</div>
                                    {lastSurgery ? (
                                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                                            <div className="text-[11px] font-bold text-indigo-600 mb-1">ŞU AN BURADA:</div>
                                            <div className="text-xs font-bold text-slate-900 truncate">{lastSurgery.hospitalName || lastSurgery.customer.name}</div>
                                            <div className="text-[10px] text-slate-500 mt-1">Dr. {lastSurgery.doctorName}</div>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-400 font-medium italic text-center">
                                            Cihaz şu an merkez depoda
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* VAKA DÜZENLE / KAYNAK ATA MODAL */}
            {(showEditModal || showPlanModal) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900">{showPlanModal ? 'Yeni Vaka Planla' : 'Vaka Düzenle / Kaynak Ata'}</h3>
                            <button onClick={() => { setShowEditModal(false); setShowPlanModal(false); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {showPlanModal && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Müşteri / Kurum *</label>
                                    <select 
                                        value={formData.customerId}
                                        onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Seçiniz...</option>
                                        {allCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Doktor Adı *</label>
                                    <input 
                                        value={formData.doctorName}
                                        onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tarih</label>
                                    <input 
                                        type="date"
                                        value={formData.surgeryDate}
                                        onChange={e => setFormData({ ...formData, surgeryDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Hastane Adı</label>
                                    <input 
                                        value={formData.hospitalName}
                                        onChange={e => setFormData({ ...formData, hospitalName: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Şehir</label>
                                    <input 
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                                    <User className="w-3 h-3 text-blue-500" /> Atanacak Personeller (Ekip)
                                </label>
                                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto p-2 border border-slate-100 rounded-lg bg-slate-50">
                                    {allPersonnel.map(p => (
                                        <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.personnelIds.includes(p.id)}
                                                onChange={e => {
                                                    const ids = e.target.checked 
                                                        ? [...formData.personnelIds, p.id]
                                                        : formData.personnelIds.filter(id => id !== p.id);
                                                    setFormData({ ...formData, personnelIds: ids });
                                                }}
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-xs font-medium text-slate-700">{p.name} <span className="text-[10px] text-slate-400">({p.role})</span></span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                                    <HardDrive className="w-3 h-3 text-indigo-500" /> Atanacak Cihazlar / Setler
                                </label>
                                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto p-2 border border-slate-100 rounded-lg bg-slate-50">
                                    {allDevices.map(d => (
                                        <label key={d.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.deviceIds.includes(d.id)}
                                                onChange={e => {
                                                    const ids = e.target.checked 
                                                        ? [...formData.deviceIds, d.id]
                                                        : formData.deviceIds.filter(id => id !== d.id);
                                                    setFormData({ ...formData, deviceIds: ids });
                                                }}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-xs font-medium text-slate-700">{d.name} <span className="text-[10px] text-slate-400">({d.serialNo})</span></span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => { setShowEditModal(false); setShowPlanModal(false); }} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">İptal</button>
                            <button 
                                onClick={() => handleSaveSurgery(showPlanModal)}
                                className="px-6 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-200"
                            >
                                {showPlanModal ? 'Vakayı Planla' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
