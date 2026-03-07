"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Title, Text, Group, Button, Card, TextInput, NumberInput,
    Switch, Select, Tabs, Box, Divider, Alert, LoadingOverlay,
    ActionIcon, Tooltip, Modal
} from '@mantine/core';
import {
    PackagePlus, ArrowLeft, CheckCircle, AlertCircle,
    Info, FileText, Banknote, Package
} from 'lucide-react';

export default function YeniUrunPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [categories, setCategories] = useState<{ value: string, label: string }[]>([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);

    // Kategori Ekleme Modal State'leri
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCategorySaving, setIsCategorySaving] = useState(false);
    const [categoryError, setCategoryError] = useState("");

    const [form, setForm] = useState({
        name: '',
        categoryId: '',
        sku: '',
        dimension: '',
        barcode: '',
        utsCode: '',
        sutCode: '',
        taxRate: 20,
        isSterile: false,
        brand: '',
        purchasePrice: '',
        salesPrice: '',
        currency: 'TRY',
        minStockLvl: 5,
        hasExpiration: true,
        description: ''
    });

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.map((c: any) => ({ value: c.id, label: c.name })));
            } else {
                setCategories([]);
            }
        } catch (e) {
            setCategories([]);
        } finally {
            setCategoriesLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleChange = (name: string, value: any) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            setCategoryError("Kategori adı boş olamaz.");
            return;
        }

        setIsCategorySaving(true);
        setCategoryError("");

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });

            if (!res.ok) throw new Error("Kategori kaydedilemedi.");

            const data = await res.json();

            // Listeye ekle ve direkt seçili hale getir
            setCategories(prev => [...prev, { value: data.id, label: data.name }]);
            handleChange('categoryId', data.id);

            // Modalı kapat ve sıfırla
            setIsCategoryModalOpen(false);
            setNewCategoryName("");
        } catch (error: any) {
            setCategoryError(error.message);
        } finally {
            setIsCategorySaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccess(false);

        try {
            const reqBody = { ...form };
            // Boş stringleri null veya undefined yapmak için temizlik
            Object.keys(reqBody).forEach(key => {
                if (reqBody[key as keyof typeof reqBody] === '') {
                    delete reqBody[key as keyof typeof reqBody];
                }
            });

            // Gerekli alan kontrolü
            if (!reqBody.name) {
                throw new Error("Lütfen 'Zorunlu Alanlar' sekmesindeki Ürün Adı alanını doldurun.");
            }
            if (!form.categoryId) {
                throw new Error(categories.length === 0
                    ? "Henüz kategori tanımlı değil. Lütfen önce '+' butonuna tıklayarak bir kategori ekleyin."
                    : "Lütfen bir kategori seçin."
                );
            }
            reqBody.categoryId = form.categoryId; // Silinmiş olabilme ihtimaline karşı tekrar ekle

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Kayıt sırasında bir hata oluştu.');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/urunler'); // Başarılı olunca ürünler listesine dön
            }, 1500);

        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between" align="flex-end" mb="lg">
                <Box>
                    <Group gap="xs" mb="xs">
                        <ActionIcon variant="subtle" color="gray" component={Link} href="/urunler">
                            <ArrowLeft size={18} />
                        </ActionIcon>
                        <Text c="dimmed" size="sm">Ürün Yönetimine Dön</Text>
                    </Group>
                    <Group gap="sm">
                        <PackagePlus size={24} color="var(--mantine-color-blue-6)" />
                        <Title order={2} fw={800} c="dark.9">Yeni Cerrahi Ürün Kartı</Title>
                    </Group>
                    <Text c="dimmed" mt="xs" fw={500}>
                        Sisteme yeni bir implant, greft, cerrahi sarf veya el aleti tanımlayın.
                    </Text>
                </Box>
            </Group>

            <Modal
                opened={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title={<Text fw={700}>Yeni Kategori Ekle</Text>}
                centered
            >
                {categoryError && <Alert color="red" mb="sm">{categoryError}</Alert>}
                <TextInput
                    required
                    label="Kategori Adı"
                    placeholder="Örn: Omurga İmplantları"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.currentTarget.value)}
                    mb="lg"
                    data-autofocus
                />
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setIsCategoryModalOpen(false)}>İptal</Button>
                    <Button color="blue" onClick={handleCreateCategory} loading={isCategorySaving}>Kaydet</Button>
                </Group>
            </Modal>

            <Alert variant="light" color="blue" title="Ürün Takip Sistemi (ÜTS) Uyarısı" icon={<Info size={16} />} mb="xl">
                Ürünlerin ÜTS (Ürün Takip Sistemi) kodu sisteme tekil olarak kaydedilir. Aynı UTS koduna sahip ikinci bir ürün kartı açılamaz. Gerçek dışı KDV oranları faturalandırmada SUT kesintilerine neden olabilir.
            </Alert>

            {success && (
                <Alert variant="light" color="teal" title="Başarılı" icon={<CheckCircle size={16} />} mb="xl">
                    Ürün kartı veritabanına başarıyla kaydedildi! Ürün listesine yönlendiriliyorsunuz...
                </Alert>
            )}

            {errorMsg && (
                <Alert variant="light" color="red" title="Kayıt Hatası" icon={<AlertCircle size={16} />} mb="xl">
                    {errorMsg}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Card padding="xl" radius="md" withBorder shadow="sm">
                    <Tabs defaultValue="temel" color="blue" variant="pills" radius="md">
                        <Tabs.List mb="xl">
                            <Tabs.Tab value="temel" leftSection={<Package size={16} />}>
                                1. Zorunlu Alanlar (Temel)
                            </Tabs.Tab>
                            <Tabs.Tab value="resmi" leftSection={<FileText size={16} />}>
                                2. Resmi Kurum & SUT
                            </Tabs.Tab>
                            <Tabs.Tab value="finans" leftSection={<Banknote size={16} />}>
                                3. Finans & Ticari
                            </Tabs.Tab>
                        </Tabs.List>

                        {/* SEKME 1: TEMEL BİLGİLER */}
                        <Tabs.Panel value="temel">
                            {categoriesLoaded && categories.length === 0 && (
                                <Alert variant="light" color="orange" title="Kategori Bulunamadı" icon={<AlertCircle size={16} />} mb="md">
                                    Henüz sistemde tanımlı bir kategori yok. Ürün kaydedebilmek için önce aşağıdaki <strong>"+ Yeni Kategori"</strong> butonuna tıklayarak en az bir kategori ekleyin.
                                </Alert>
                            )}
                            <Text fw={600} mb="md">Genel Ürün Tanıtımı</Text>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    required
                                    label="Ürün Adı"
                                    placeholder="Örn: Titanyum Polyaxial Pedikül Vidası"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.currentTarget.value)}
                                    className="md:col-span-2"
                                />
                                <Group align="flex-end" gap="xs" wrap="nowrap">
                                    <Select
                                        required
                                        label="Kategori"
                                        placeholder={categories.length === 0 ? "Önce kategori ekleyin →" : "Kategori seçin"}
                                        data={categories}
                                        value={form.categoryId}
                                        onChange={(v) => handleChange('categoryId', v)}
                                        searchable
                                        nothingFoundMessage="Bulunamadı"
                                        style={{ flex: 1 }}
                                        error={categoriesLoaded && categories.length === 0 ? "Kategori eklenmeli" : undefined}
                                    />
                                    <Tooltip label="Yeni Kategori Ekle">
                                        <Button
                                            color="blue"
                                            variant={categories.length === 0 ? "filled" : "light"}
                                            onClick={() => setIsCategoryModalOpen(true)}
                                            px="sm"
                                            style={{ minWidth: 'auto' }}
                                        >
                                            <PackagePlus size={16} />
                                        </Button>
                                    </Tooltip>
                                </Group>
                                <TextInput
                                    label="Firma İçi Kod (SKU)"
                                    placeholder="İsteğe Bağlı İç Kod"
                                    value={form.sku}
                                    onChange={(e) => handleChange('sku', e.currentTarget.value)}
                                />
                                <TextInput
                                    label="Ölçü / Boyut"
                                    placeholder="Örn: 5.5 x 45mm"
                                    value={form.dimension}
                                    onChange={(e) => handleChange('dimension', e.currentTarget.value)}
                                />
                                <TextInput
                                    label="Basit Barkod"
                                    placeholder="Dahili veya Evrensel Barkod (Varsa)"
                                    value={form.barcode}
                                    onChange={(e) => handleChange('barcode', e.currentTarget.value)}
                                />
                                <div className="md:col-span-2">
                                    <TextInput
                                        label="Kısa Açıklama"
                                        placeholder="Ürünle ilgili genel bir not..."
                                        value={form.description}
                                        onChange={(e) => handleChange('description', e.currentTarget.value)}
                                    />
                                </div>
                            </div>
                        </Tabs.Panel>

                        {/* SEKME 2: RESMİ KURUMLAR & SUT */}
                        <Tabs.Panel value="resmi">
                            <Text fw={600} mb="md">ÜTS, SGK ve Uyumluluk Bilgileri</Text>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="ÜTS Barkodu (UBB)"
                                    description="TİTCK Sağlık Bakanlığı Kayıt Barkodu"
                                    placeholder="Örn: 8691234567890"
                                    value={form.utsCode}
                                    onChange={(e) => handleChange('utsCode', e.currentTarget.value)}
                                />
                                <TextInput
                                    label="SGK SUT Kodu"
                                    description="Fatura ve geri ödeme işlemleri için hayati önem taşır"
                                    placeholder="Örn: ORT1023"
                                    value={form.sutCode}
                                    onChange={(e) => handleChange('sutCode', e.currentTarget.value)}
                                />
                                <Select
                                    label="KDV Oranı (%)"
                                    data={['1', '10', '20']}
                                    value={form.taxRate.toString()}
                                    onChange={(v) => handleChange('taxRate', Number(v))}
                                />

                                <Card withBorder radius="md" p="sm" mt="md" bg="gray.0" className="md:col-span-2">
                                    <Group justify="space-between">
                                        <Box>
                                            <Text fw={600} size="sm">Kendinden Steril Paket Mi?</Text>
                                            <Text size="xs" c="dimmed">Ürün gamma veya EO ile steril paketlenmişse işaretleyin. (Son kullanma tarihi takibi için önemlidir).</Text>
                                        </Box>
                                        <Switch
                                            size="lg"
                                            onLabel="EVET"
                                            offLabel="HAYIR"
                                            checked={form.isSterile}
                                            onChange={(e) => handleChange('isSterile', e.currentTarget.checked)}
                                        />
                                    </Group>
                                </Card>
                            </div>
                        </Tabs.Panel>

                        {/* SEKME 3: FİNANS & TİCARİ */}
                        <Tabs.Panel value="finans">
                            <Text fw={600} mb="md">Fiyatlandırma, Marka ve Alarm Eşikleri</Text>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="Marka / Üretici"
                                    placeholder="Örn: Medtronic, Globus, Tıpsan"
                                    value={form.brand}
                                    onChange={(e) => handleChange('brand', e.currentTarget.value)}
                                    className="md:col-span-2"
                                />
                                <NumberInput
                                    label="Alış Fiyatı (Maliyet)"
                                    placeholder="0.00"
                                    decimalScale={2}
                                    hideControls
                                    value={form.purchasePrice}
                                    onChange={(v) => handleChange('purchasePrice', v)}
                                />
                                <Group grow gap="xs" align="flex-end">
                                    <NumberInput
                                        label="Satış Fiyatı (Liste)"
                                        placeholder="0.00"
                                        decimalScale={2}
                                        hideControls
                                        value={form.salesPrice}
                                        onChange={(v) => handleChange('salesPrice', v)}
                                    />
                                    <Select
                                        label="Para Birimi"
                                        data={['TRY', 'USD', 'EUR']}
                                        value={form.currency}
                                        onChange={(v) => handleChange('currency', v)}
                                        w={100}
                                    />
                                </Group>

                                <Divider className="md:col-span-2" my="sm" />

                                <NumberInput
                                    label="Minimum Stok Seviyesi (Kritik Alarm)"
                                    description="Stok bu seviyenin altına düştüğünde sistem uyarı verir."
                                    min={0}
                                    value={form.minStockLvl}
                                    onChange={(v) => handleChange('minStockLvl', v === '' ? 5 : Number(v))}
                                />

                                <Card withBorder radius="md" p="sm" mt="md" bg="gray.0">
                                    <Group justify="space-between">
                                        <Box>
                                            <Text fw={600} size="sm">SKT (Miad) Takibi Yap</Text>
                                        </Box>
                                        <Switch
                                            size="md"
                                            checked={form.hasExpiration}
                                            onChange={(e) => handleChange('hasExpiration', e.currentTarget.checked)}
                                        />
                                    </Group>
                                </Card>
                            </div>
                        </Tabs.Panel>
                    </Tabs>

                    <Divider my="xl" />

                    <Group justify="flex-end">
                        <Button variant="default" component={Link} href="/urunler" disabled={loading}>
                            Vazgeç
                        </Button>
                        <Button color="blue" type="submit" loading={loading} leftSection={<CheckCircle size={18} />}>
                            Ürünü Kaydet
                        </Button>
                    </Group>
                </Card>
            </form>
        </Box>
    );
}
