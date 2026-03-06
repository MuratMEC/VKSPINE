"use client";

import { useState, useEffect } from 'react';
import { Title, Text, Group, Button, Card, Table, Badge, ActionIcon, Menu, Modal, TextInput, Select, PasswordInput, LoadingOverlay, Alert } from '@mantine/core';
import { Users, UserPlus, MoreVertical, Edit, Trash, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER'
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Kullanıcılar yüklenemedi", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (name: string, value: string | null) => {
        setForm(prev => ({ ...prev, [name]: value || '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Bir hata oluştu");
            }

            setSuccessMsg("Kullanıcı başarıyla eklendi.");
            fetchUsers(); // Listeyi güncelle

            setTimeout(() => {
                setModalOpen(false);
                setForm({ name: '', email: '', password: '', role: 'USER' });
                setSuccessMsg("");
            }, 1500);

        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setSaving(false);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'red';
            case 'USER': return 'blue';
            case 'VIEWER': return 'gray';
            default: return 'gray';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Group justify="space-between" mb="xl">
                <div>
                    <Group gap="sm">
                        <Users size={28} className="text-blue-600" />
                        <Title order={2} fw={800} c="dark.9">Kullanıcı Yönetimi</Title>
                    </Group>
                    <Text c="dimmed" mt="xs">Sisteme giriş yapabilen personelleri ve yetkilerini yönetin.</Text>
                </div>
                <Button color="blue" leftSection={<UserPlus size={18} />} onClick={() => setModalOpen(true)}>
                    Yeni Kullanıcı Ekle
                </Button>
            </Group>

            <Card withBorder shadow="sm" radius="md" p={0} pos="relative" style={{ minHeight: 300 }}>
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                <div className="overflow-x-auto">
                    <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
                        <Table.Thead className="bg-slate-50 border-b border-slate-200">
                            <Table.Tr>
                                <Table.Th>İsim Soyisim</Table.Th>
                                <Table.Th>E-Posta (Giriş ID)</Table.Th>
                                <Table.Th>Yetki Rolü</Table.Th>
                                <Table.Th>Durum</Table.Th>
                                <Table.Th>Kayıt Tarihi</Table.Th>
                                <Table.Th w={80}></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {users.length > 0 ? users.map((user) => (
                                <Table.Tr key={user.id}>
                                    <Table.Td fw={500}>{user.name}</Table.Td>
                                    <Table.Td>{user.email}</Table.Td>
                                    <Table.Td>
                                        <Badge color={getRoleBadgeColor(user.role)} variant="light">
                                            {user.role}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color={user.isActive ? "teal" : "red"} variant="dot">
                                            {user.isActive ? "Aktif" : "Pasif"}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</Table.Td>
                                    <Table.Td>
                                        <Menu position="bottom-end" shadow="md">
                                            <Menu.Target>
                                                <ActionIcon variant="subtle" color="gray">
                                                    <MoreVertical size={16} />
                                                </ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item leftSection={<Edit size={14} />}>Düzenle</Menu.Item>
                                                <Menu.Divider />
                                                <Menu.Item color="red" leftSection={<Trash size={14} />}>Sil / Pasife Al</Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Table.Td>
                                </Table.Tr>
                            )) : (
                                !loading && (
                                    <Table.Tr>
                                        <Table.Td colSpan={6}>
                                            <div className="text-center text-slate-500 py-8">
                                                Henüz kullanıcı eklenmemiş veya bulunamadı.
                                            </div>
                                        </Table.Td>
                                    </Table.Tr>
                                )
                            )}
                        </Table.Tbody>
                    </Table>
                </div>
            </Card>

            <Modal
                opened={modalOpen}
                onClose={() => !saving && setModalOpen(false)}
                title={<Text fw={700} className="flex items-center gap-2"><UserPlus size={18} className="text-blue-500" /> Yeni Personel Kullanıcısı</Text>}
                size="md"
            >
                {errorMsg && <Alert color="red" icon={<AlertCircle size={16} />} mb="md">{errorMsg}</Alert>}
                {successMsg && <Alert color="teal" icon={<CheckCircle size={16} />} mb="md">{successMsg}</Alert>}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <TextInput
                            required
                            label="İsim Soyisim"
                            placeholder="Örn: Ahmet Yılmaz"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.currentTarget.value)}
                        />
                        <TextInput
                            required
                            type="email"
                            label="E-Posta Adresi"
                            description="Sisteme giriş yaparken kullanılacak mail adresi."
                            placeholder="ahmet@firma.com"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.currentTarget.value)}
                        />
                        <PasswordInput
                            required
                            label="Şifre"
                            placeholder="Sisteme giriş şifresi"
                            value={form.password}
                            onChange={(e) => handleChange('password', e.currentTarget.value)}
                        />
                        <Select
                            required
                            label="Yetki Seviyesi"
                            description="Kullanıcının hangi ekranları göreceğini belirler."
                            data={[
                                { value: 'USER', label: 'Standart Kullanıcı (İşlem Yapabilir)' },
                                { value: 'VIEWER', label: 'İzleyici (Sadece Görebilir)' },
                                { value: 'ADMIN', label: 'Yönetici (Tam Yetkili)' }
                            ]}
                            value={form.role}
                            onChange={(v) => handleChange('role', v)}
                        />

                        <Alert color="yellow" icon={<ShieldAlert size={16} />} title="Yetki Bilgisi" mt="md" variant="light">
                            Yönetici hesapları fiyatları değiştirebilir, kar/zarar raporlarını görebilir ve diğer kullanıcıları silebilir. Standart kullanıcılar sevk, ameliyat ve mal kabul işlemi yapabilir.
                        </Alert>

                        <Group justify="flex-end" mt="xl">
                            <Button variant="default" onClick={() => setModalOpen(false)} disabled={saving}>Vazgeç</Button>
                            <Button type="submit" color="blue" loading={saving}>Kullanıcıyı Kaydet</Button>
                        </Group>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
