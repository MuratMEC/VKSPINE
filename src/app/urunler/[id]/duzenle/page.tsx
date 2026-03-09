"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
    Title, Text, Group, Button, Card, TextInput, NumberInput,
    Switch, Select, Tabs, Box, Divider, Alert, LoadingOverlay,
    ActionIcon, Tooltip, Modal, Center, Loader
} from '@mantine/core';
import {
    PackagePlus, ArrowLeft, CheckCircle, AlertCircle,
    Info, FileText, Banknote, Package, Edit3, Lock
} from 'lucide-react';

export default function UrunDuzenlePage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [pageLoading, setPageLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLocked, setIsLocked] = useState(false);

    const [categories, setCategories] = useState<{ value: string, label: string }[]>([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const [setCategories2, setSetCategories2] = useState<{ value: string, label: string }[]>([]);

    // Kategori Ekleme Modal State'leri
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCategorySaving, setIsCategorySaving] = useState(false);
    const [categoryError, setCategoryError] = useState("");

    // Set Kategori Ekleme Modal State'leri
    const [isSetCategoryModalOpen, setIsSetCategoryModalOpen] = useState(false);
    const [newSetCategoryName, setNewSetCategoryName] = useState("");
    const [isSetCategorySaving, setIsSetCategorySaving] = useState(false);
    const [setCategoryError2, setSetCategoryError2] = useState("");

    const [form, setForm] = useState({
        name: '',
        categoryId: '',
        setCategoryId: '',
        sku: '',
        dimension: '',
        barcode: '',
        utsCode: '',
        sutCode: '',
        taxRate: 20,
        isSterile: false,
        brand: '',
        purchasePrice: '' as string | number,
        salesPrice: '' as string | number,
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
            }
        } catch (e) {
            setCategories([]);
        } finally {
            setCategoriesLoaded(true);
        }
    }, []);

    const fetchProduct = useCallback(async () => {
        try {
            const res = await fetch(`/api/products/${productId}`);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Ürün bulunamadı.');
            }
            const product = await res.json();

            // Stok hareketi varsa kilit
            if (product._count?.stockMovements > 0) {
                setIsLocked(true);
            }

            setForm({
                name: product.name || '',
                categoryId: product.categoryId || '',
                setCategoryId: product.setCategoryId || '',
                sku: product.sku || '',
                dimension: product.dimension || '',
                barcode: product.barcode || '',
                utsCode: product.utsCode || '',
                sutCode: product.sutCode || '',
                taxRate: product.taxRate ?? 20,
                isSterile: product.isSterile ?? false,
                brand: product.brand || '',
                purchasePrice: product.purchasePrice ?? '',
                salesPrice: product.salesPrice ?? '',
                currency: product.currency || 'TRY',
                minStockLvl: product.minStockLvl ?? 5,
                hasExpiration: product.hasExpiration ?? true,
                description: product.description || ''
            });
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setPageLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchCategories();
        fetchProduct();
        // Fetch set categories
        fetch('/api/set-categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSetCategories2(data.map((c: any) => ({ value: c.id, label: c.name })));
                }
            })
            .catch(() => setSetCategories2([]));
    }, [fetchCategories, fetchProduct]);

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

            setCategories(prev => [...prev, { value: data.id, label: data.name }]);
            handleChange('categoryId', data.id);
            setIsCategoryModalOpen(false);
            setNewCategoryName("");
        } catch (error: any) {
            setCategoryError(error.message);
        } finally {
            setIsCategorySaving(false);
        }
    };

    const handleCreateSetCategory = async () => {
        if (!newSetCategoryName.trim()) {
            setSetCategoryError2("Set Kategori adı boş olamaz.");
            return;
        }

        setIsSetCategorySaving(true);
        setSetCategoryError2("");

        try {
            const res = await fetch('/api/set-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSetCategoryName })
            });

            if (!res.ok) throw new Error("Set Kategorisi kaydedilemedi.");

            const data = await res.json();

            setSetCategories2(prev => [...prev, { value: data.id, label: data.name }]);
            handleChange('setCategoryId', data.id);

            setIsSetCategoryModalOpen(false);
            setNewSetCategoryName("");
        } catch (error: any) {
            setSetCategoryError2(error.message);
        } finally {
            setIsSetCategorySaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccess(false);

        try {
            const reqBody = { ...form };
            Object.keys(reqBody).forEach(key => {
                if (reqBody[key as keyof typeof reqBody] === '') {
                    delete reqBody[key as keyof typeof reqBody];
                }
            });

            if (!reqBody.name) {
                throw new Error("Lütfen 'Zorunlu Alanlar' sekmesindeki Ürün Adı alanını doldurun.");
            }

            reqBody.categoryId = form.categoryId || undefined as any;

            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Güncelleme sırasında bir hata oluştu.');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/urunler');
            }, 1500);

        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <Center h={400}>
                <Loader color="blue" type="bars" size="lg" />
            </Center>
        );
    }

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
                        <Edit3 size={24} color="var(--mantine-color-blue-6)" />
                        <Title order={2} fw={800} c="dark.9">Ürün Kartını Düzenle</Title>
                    </Group>
                    <Text c="dimmed" mt="xs" fw={500}>
                        Mevcut ürün bilgilerini güncelleyin.
                    </Text>
                </Box>
            </Group>

            {isLocked && (
                <Alert variant="light" color="red" title="Düzenleme Kilitli" icon={<Lock size={16} />} mb="xl">
                    Bu ürün stok hareketi (giriş/çıkış) gördüğü için düzenlenemez. Yalnızca henüz stok hareketi olmayan ürün kartları düzenlenebilir.
                </Alert>
            )}

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

            <Modal
                opened={isSetCategoryModalOpen}
                onClose={() => setIsSetCategoryModalOpen(false)}
                title={<Text fw={700}>Yeni Set Kategorisi Ekle</Text>}
                centered
            >
                {setCategoryError2 && <Alert color="red" mb="sm">{setCategoryError2}</Alert>}
                <TextInput
                    required
                    label="Set Kategori Adı"
                    placeholder="Örn: Servikal Set"
                    value={newSetCategoryName}
                    onChange={(e) => setNewSetCategoryName(e.currentTarget.value)}
                    mb="lg"
                    data-autofocus
                />
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setIsSetCategoryModalOpen(false)}>İptal</Button>
                    <Button color="violet" onClick={handleCreateSetCategory} loading={isSetCategorySaving}>Kaydet</Button>
                </Group>
            </Modal>

            {success && (
                <Alert variant="light" color="teal" title="Başarılı" icon={<CheckCircle size={16} />} mb="xl">
                    Ürün kartı başarıyla güncellendi! Ürün listesine yönlendiriliyorsunuz...
                </Alert>
            )}

            {errorMsg && (
                <Alert variant="light" color="red" title="Hata" icon={<AlertCircle size={16} />} mb="xl">
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
                            <Text fw={600} mb="md">Genel Ürün Tanıtımı</Text>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    required
                                    label="Ürün Adı"
                                    placeholder="Örn: Titanyum Polyaxial Pedikül Vidası"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.currentTarget.value)}
                                    className="md:col-span-2"
                                    disabled={isLocked}
                                />
                                <Group align="flex-end" gap="xs" wrap="nowrap">
                                    <Select
                                        label="Kategori"
                                        placeholder={categories.length === 0 ? "Önce kategori ekleyin →" : "Kategori seçin"}
                                        data={categories}
                                        value={form.categoryId}
                                        onChange={(v) => handleChange('categoryId', v)}
                                        searchable
                                        nothingFoundMessage="Bulunamadı"
                                        style={{ flex: 1 }}
                                        disabled={isLocked}
                                    />
                                    <Tooltip label="Yeni Kategori Ekle">
                                        <Button
                                            color="blue"
                                            variant={categories.length === 0 ? "filled" : "light"}
                                            onClick={() => setIsCategoryModalOpen(true)}
                                            px="sm"
                                            style={{ minWidth: 'auto' }}
                                            disabled={isLocked}
                                        >
                                            <PackagePlus size={16} />
                                        </Button>
                                    </Tooltip>
                                </Group>
                                <Group align="flex-end" gap="xs" wrap="nowrap">
                                    <Select
                                        label="Set Kategorisi"
                                        placeholder="Set Kategorisi seçin"
                                        data={setCategories2}
                                        value={form.setCategoryId}
                                        onChange={(v) => handleChange('setCategoryId', v)}
                                        searchable
                                        clearable
                                        nothingFoundMessage="Bulunamadı"
                                        style={{ flex: 1 }}
                                        disabled={isLocked}
                                    />
                                    <Tooltip label="Yeni Set Kategorisi Ekle">
                                        <Button
                                            color="violet"
                                            variant="light"
                                            onClick={() => setIsSetCategoryModalOpen(true)}
                                            px="sm"
                                            style={{ minWidth: 'auto' }}
                                            disabled={isLocked}
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
                                    disabled={isLocked}
                                />
                                <TextInput
                                    label="Ölçü / Boyut"
                                    placeholder="Örn: 5.5 x 45mm"
                                    value={form.dimension}
                                    onChange={(e) => handleChange('dimension', e.currentTarget.value)}
                                    disabled={isLocked}
                                />
                                <TextInput
                                    label="Basit Barkod"
                                    placeholder="Dahili veya Evrensel Barkod (Varsa)"
                                    value={form.barcode}
                                    onChange={(e) => handleChange('barcode', e.currentTarget.value)}
                                    disabled={isLocked}
                                />
                                <div className="md:col-span-2">
                                    <TextInput
                                        label="Kısa Açıklama"
                                        placeholder="Ürünle ilgili genel bir not..."
                                        value={form.description}
                                        onChange={(e) => handleChange('description', e.currentTarget.value)}
                                        disabled={isLocked}
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
                                    disabled={isLocked}
                                />
                                <TextInput
                                    label="SGK SUT Kodu"
                                    description="Fatura ve geri ödeme işlemleri için hayati önem taşır"
                                    placeholder="Örn: ORT1023"
                                    value={form.sutCode}
                                    onChange={(e) => handleChange('sutCode', e.currentTarget.value)}
                                    disabled={isLocked}
                                />
                                <Select
                                    label="KDV Oranı (%)"
                                    data={['1', '10', '20']}
                                    value={form.taxRate.toString()}
                                    onChange={(v) => handleChange('taxRate', Number(v))}
                                    disabled={isLocked}
                                />

                                <Card withBorder radius="md" p="sm" mt="md" bg="gray.0" className="md:col-span-2">
                                    <Group justify="space-between">
                                        <Box>
                                            <Text fw={600} size="sm">Kendinden Steril Paket Mi?</Text>
                                            <Text size="xs" c="dimmed">Ürün gamma veya EO ile steril paketlenmişse işaretleyin.</Text>
                                        </Box>
                                        <Switch
                                            size="lg"
                                            onLabel="EVET"
                                            offLabel="HAYIR"
                                            checked={form.isSterile}
                                            onChange={(e) => handleChange('isSterile', e.currentTarget.checked)}
                                            disabled={isLocked}
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
                                    disabled={isLocked}
                                />
                                <NumberInput
                                    label="Alış Fiyatı (Maliyet)"
                                    placeholder="0.00"
                                    decimalScale={2}
                                    hideControls
                                    value={form.purchasePrice}
                                    onChange={(v) => handleChange('purchasePrice', v)}
                                    disabled={isLocked}
                                />
                                <Group grow gap="xs" align="flex-end">
                                    <NumberInput
                                        label="Satış Fiyatı (Liste)"
                                        placeholder="0.00"
                                        decimalScale={2}
                                        hideControls
                                        value={form.salesPrice}
                                        onChange={(v) => handleChange('salesPrice', v)}
                                        disabled={isLocked}
                                    />
                                    <Select
                                        label="Para Birimi"
                                        data={['TRY', 'USD', 'EUR']}
                                        value={form.currency}
                                        onChange={(v) => handleChange('currency', v)}
                                        w={100}
                                        disabled={isLocked}
                                    />
                                </Group>

                                <Divider className="md:col-span-2" my="sm" />

                                <NumberInput
                                    label="Minimum Stok Seviyesi (Kritik Alarm)"
                                    description="Stok bu seviyenin altına düştüğünde sistem uyarı verir."
                                    min={0}
                                    value={form.minStockLvl}
                                    onChange={(v) => handleChange('minStockLvl', v === '' ? 5 : Number(v))}
                                    disabled={isLocked}
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
                                            disabled={isLocked}
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
                        {!isLocked && (
                            <Button color="blue" type="submit" loading={loading} leftSection={<CheckCircle size={18} />}>
                                Değişiklikleri Kaydet
                            </Button>
                        )}
                    </Group>
                </Card>
            </form>
        </Box>
    );
}
