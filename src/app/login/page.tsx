"use client";

import { useState } from 'react';
import { Activity, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Giriş başarısız oldu.");
            }

            router.push('/');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Arka plan süslemeleri */}
            <div style={{ position: 'absolute', top: 0, left: '50%', marginLeft: '-30rem', width: '60rem', height: '60rem', background: 'rgba(219, 234, 254, 0.5)', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.5, zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '40rem', height: '40rem', background: 'rgba(238, 242, 255, 0.5)', borderRadius: '9999px', filter: 'blur(64px)', opacity: 0.5, zIndex: 0 }} />

            {/* Logo ve başlık */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '2rem', width: '100%', maxWidth: '28rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', borderRadius: '1rem', padding: '1rem', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)' }}>
                        <Activity style={{ width: '2.5rem', height: '2.5rem' }} />
                    </div>
                </div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>
                    VK Spine <span style={{ color: '#2563eb' }}>MediStock</span>
                </h2>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                    Tıbbi Ürün Stok ve İzlenebilirlik Sistemi
                </p>
            </div>

            {/* Form kartı */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '28rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', borderRadius: '1.5rem', border: '1px solid rgba(203, 213, 225, 0.5)' }}>

                    {error && (
                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', color: '#b91c1c', fontSize: '0.875rem', borderRadius: '0.5rem', border: '1px solid #fecaca', textAlign: 'center', fontWeight: 500 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                E-Posta Adresi
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '0.75rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <Mail style={{ width: '1.25rem', height: '1.25rem', color: '#94a3b8' }} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="admin@vkspine.com"
                                    style={{ display: 'block', width: '100%', paddingLeft: '2.5rem', paddingRight: '0.75rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.5)', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                Şifre
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '0.75rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                    <Lock style={{ width: '1.25rem', height: '1.25rem', color: '#94a3b8' }} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    style={{ display: 'block', width: '100%', paddingLeft: '2.5rem', paddingRight: '0.75rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.5)', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', border: 'none', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700, color: 'white', background: loading ? '#93c5fd' : '#2563eb', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)', transition: 'all 0.2s' }}
                        >
                            {loading ? (
                                <><Loader2 style={{ width: '1rem', height: '1rem' }} /> Giriş Yapılıyor...</>
                            ) : (
                                <><span>Giriş Yap</span><ArrowRight style={{ width: '1rem', height: '1rem' }} /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
