'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthorizedHeaders } from '@/lib/auth';
import { Upload, X, Loader2, ArrowLeft, Save, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [stock, setStock] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState('');
    const [collectionId, setCollectionId] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
                const [prodRes, catRes, colRes] = await Promise.all([
                    fetch(`${apiBase}/api/products/${resolvedParams.id}?t=${Date.now()}`),
                    fetch(`${apiBase}/api/products/categories`),
                    fetch(`${apiBase}/api/collections`)
                ]);

                if (prodRes.ok) {
                    const data = await prodRes.json();
                    console.log('Fetched product data:', data);
                    setName(data.name || '');
                    setDescription(data.description || '');
                    setPrice(data.price?.toString() || '');
                    setOriginalPrice(data.originalPrice?.toString() || '');
                    setStock(data.stock?.toString() || '');
                    setImages(Array.isArray(data.images) ? data.images : []);
                    setCategoryId(data.categoryId?.toString() || '');
                    setCollectionId(data.collectionId?.toString() || '');
                }
                if (catRes.ok) setCategories(await catRes.json());
                if (colRes.ok) setCollections(await colRes.json());
            } catch (err) {
                console.error("Failed to fetch product data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [resolvedParams.id]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        const uploadPromises = Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const headers = await getAuthorizedHeaders();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/upload`, {
                    method: 'POST',
                    headers,
                    body: formData
                });

                if (res.ok) {
                    const imageUrl = await res.text();
                    return imageUrl.startsWith('/') 
                        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${imageUrl}`
                        : imageUrl;
                }
            } catch (err) {
                console.error('Error uploading image:', err);
            }
            return null;
        });

        const newUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);
        setImages(prev => [...prev, ...newUrls]);
        setUploading(false);
    };

    const removeImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { 
                name, 
                description, 
                price: parseFloat(price), 
                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                stock: parseInt(stock), 
                images, 
                categoryId: categoryId ? parseInt(categoryId) : null,
                collectionId: collectionId ? parseInt(collectionId) : null
            };
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products/${resolvedParams.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            });
            if (res.ok) router.push('/admin/products');
        } catch (error) {
            console.error('Error updating product', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-outfit font-semibold uppercase tracking-widest mt-20">Loading product details...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin/products" className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-charcoal">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-outfit font-bold text-charcoal">Edit Product</h1>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left Column: Basic Info */}
                        <div className="space-y-8">
                            <div className="group">
                                <label className="block text-[10px] font-outfit font-semibold uppercase tracking-widest text-gray-400 mb-2 font-bold group-focus-within:text-gold transition-colors">Product Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gold bg-transparent font-outfit font-semibold text-charcoal" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-outfit font-semibold uppercase tracking-widest text-gray-400 mb-2 font-bold">Description</label>
                                <textarea 
                                    required 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    className="w-full border border-gray-100 rounded-xl p-4 focus:outline-none focus:border-gold font-outfit min-h-[150px] bg-gray-50/50 resize-none" 
                                    rows={5} 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="group">
                                    <label className="block text-[10px] font-outfit font-semibold uppercase tracking-widest text-gray-400 mb-2 font-bold group-focus-within:text-gold transition-colors">Selling Price (₹)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={price} 
                                        onChange={e => setPrice(e.target.value)} 
                                        className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gold bg-transparent font-outfit font-semibold text-charcoal" 
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-outfit font-semibold uppercase tracking-widest text-gray-400 mb-2 font-bold group-focus-within:text-gold transition-colors">Original Price (₹) - Optional</label>
                                    <input 
                                        type="number" 
                                        value={originalPrice} 
                                        onChange={e => setOriginalPrice(e.target.value)} 
                                        className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gold bg-transparent font-outfit font-semibold text-charcoal placeholder:text-gray-200" 
                                        placeholder="e.g. 1500"
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-outfit font-semibold uppercase tracking-widest text-gray-400 mb-2 font-bold group-focus-within:text-gold transition-colors">Stock</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={stock} 
                                        onChange={e => setStock(e.target.value)} 
                                        className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gold bg-transparent font-outfit font-semibold text-charcoal" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="relative group">
                                    <label className="block text-[10px] font-outfit font-semibold uppercase tracking-widest text-gray-400 mb-2 font-bold group-focus-within:text-gold transition-colors">Category</label>
                                    <div className="relative">
                                        <select 
                                            value={categoryId} 
                                            onChange={e => setCategoryId(e.target.value)} 
                                            required
                                            className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gold bg-transparent font-outfit font-semibold text-charcoal appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none group-hover:text-gold transition-colors" />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-[10px] font-outfit font-semibold uppercase tracking-widest text-gray-400 mb-2 font-bold group-focus-within:text-gold transition-colors">Collection</label>
                                    <div className="relative">
                                        <select 
                                            value={collectionId} 
                                            onChange={e => setCollectionId(e.target.value)} 
                                            className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gold bg-transparent font-outfit font-semibold text-charcoal appearance-none cursor-pointer"
                                        >
                                            <option value="">None / Basic</option>
                                            {collections.map(col => (
                                                <option key={col.id} value={col.id}>{col.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none group-hover:text-gold transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Images */}
                        <div className="space-y-6">
                            <label className="block text-[10px] font-outfit font-semibold uppercase tracking-widest text-gray-400 mb-2 font-bold">Product Images</label>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group shadow-sm">
                                        <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="p-2 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all transform scale-90 group-hover:scale-100"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {index === 0 && (
                                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-gold text-[8px] text-white font-bold uppercase tracking-widest rounded-md">Cover</div>
                                        )}
                                    </div>
                                ))}
                                
                                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-100 rounded-2xl hover:border-gold hover:bg-gold/5 transition-all cursor-pointer group">
                                    {uploading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-gold" />
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-gray-300 group-hover:text-gold mb-2 transition-colors" />
                                            <span className="text-[10px] text-gray-400 font-outfit font-semibold uppercase tracking-widest font-bold group-hover:text-gold transition-colors">Add Image</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-charcoal text-white h-16 w-full rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-charcoal/10 hover:bg-gold hover:shadow-gold/20 transition-all duration-300 font-bold uppercase tracking-widest text-xs disabled:opacity-50 active:scale-[0.98]"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Product Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
