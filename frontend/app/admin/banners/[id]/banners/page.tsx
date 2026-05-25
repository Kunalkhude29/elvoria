'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Upload, Trash2, Pencil, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function CollectionBannersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [collection, setCollection] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    const [image, setImage] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [offerText, setOfferText] = useState('');
    const [ctaText, setCtaText] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

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
                const fullUrl = imageUrl.startsWith('/') 
                    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${imageUrl}`
                    : imageUrl;
                setImage(fullUrl);
            } else {
                alert('Failed to upload image. Please try again.');
            }
        } catch (err) {
            alert('Error uploading image.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const fetchCollection = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/collections/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCollection(data);
            }
        } catch (error) {
            console.error("Failed to fetch collection", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollection();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });
            
            const payload = { image, title, subtitle, offerText, ctaText, displayOrder: Number(displayOrder), isActive };
            
            let res;
            if (editingId) {
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/collections/banners/${editingId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/collections/${id}/banners`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                resetForm();
                fetchCollection();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to save banner');
            }
        } catch (err: any) {
            alert(`Something went wrong: ${err.message || 'Please try again.'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (bannerId: number) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        
        try {
            const headers = await getAuthorizedHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/collections/banners/${bannerId}`, {
                method: 'DELETE',
                headers
            });
            if (res.ok) {
                fetchCollection();
            }
        } catch (error) {
            console.error("Failed to delete banner", error);
        }
    };

    const handleEdit = (banner: any) => {
        setEditingId(banner.id);
        setImage(banner.image);
        setTitle(banner.title || '');
        setSubtitle(banner.subtitle || '');
        setOfferText(banner.offerText || '');
        setCtaText(banner.ctaText || '');
        setDisplayOrder(banner.displayOrder);
        setIsActive(banner.isActive);
    };

    const resetForm = () => {
        setEditingId(null);
        setImage('');
        setTitle('');
        setSubtitle('');
        setOfferText('');
        setCtaText('');
        setDisplayOrder(0);
        setIsActive(true);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!collection) return <div className="p-8 text-center text-red-500">Collection not found</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/banners" className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-charcoal">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-outfit font-bold text-charcoal">Manage Banners</h1>
                        <p className="text-gray-500 text-sm mt-1">Collection: <span className="font-bold text-charcoal">{collection.name}</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                        <h2 className="text-xl font-outfit font-bold text-charcoal mb-6">
                            {editingId ? 'Edit Banner' : 'Add New Banner'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-outfit font-semibold uppercase tracking-widest text-gray-500 mb-1">Banner Image *</label>
                                <div className="space-y-4">
                                    {image && (
                                        <div className="relative w-full h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group">
                                            <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer bg-white text-charcoal px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-colors">
                                                    Change
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!image && (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg hover:border-gold hover:bg-gray-50 transition-all cursor-pointer group">
                                            {uploading ? (
                                                <Loader2 className="w-6 h-6 animate-spin text-gold" />
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-gray-300 group-hover:text-gold mb-2" />
                                                    <p className="text-[10px] text-gray-500 font-outfit font-semibold uppercase tracking-widest">Upload Banner</p>
                                                </>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-outfit font-semibold uppercase tracking-widest text-gray-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border-b border-gray-200 py-2 font-outfit font-semibold focus:outline-none focus:border-gold transition-colors text-sm"
                                    placeholder="e.g. Wedding Season"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-outfit font-semibold uppercase tracking-widest text-gray-500 mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    className="w-full border-b border-gray-200 py-2 font-outfit font-semibold focus:outline-none focus:border-gold transition-colors text-sm"
                                    placeholder="e.g. Discover our new arrivals"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-outfit font-semibold uppercase tracking-widest text-gray-500 mb-1">Offer Text</label>
                                <input
                                    type="text"
                                    value={offerText}
                                    onChange={(e) => setOfferText(e.target.value)}
                                    className="w-full border-b border-gray-200 py-2 font-outfit font-semibold focus:outline-none focus:border-gold transition-colors text-sm"
                                    placeholder="e.g. Flat ₹999"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-outfit font-semibold uppercase tracking-widest text-gray-500 mb-1">CTA Button Text</label>
                                <input
                                    type="text"
                                    value={ctaText}
                                    onChange={(e) => setCtaText(e.target.value)}
                                    className="w-full border-b border-gray-200 py-2 font-outfit font-semibold focus:outline-none focus:border-gold transition-colors text-sm"
                                    placeholder="e.g. Shop Now"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-outfit font-semibold uppercase tracking-widest text-gray-500 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={displayOrder}
                                        onChange={(e) => setDisplayOrder(Number(e.target.value))}
                                        className="w-full border-b border-gray-200 py-2 font-outfit font-semibold focus:outline-none focus:border-gold transition-colors text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-outfit font-semibold uppercase tracking-widest text-gray-500 mb-1">Status</label>
                                    <select
                                        value={isActive ? 'true' : 'false'}
                                        onChange={(e) => setIsActive(e.target.value === 'true')}
                                        className="w-full border-b border-gray-200 py-2 font-outfit font-semibold focus:outline-none focus:border-gold transition-colors text-sm bg-transparent"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 border border-gray-200 text-gray-600 h-12 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-charcoal text-white h-12 rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-gold transition-colors disabled:opacity-50 font-bold uppercase tracking-widest text-xs"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {editingId ? 'Update' : 'Add'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="space-y-4">
                        {collection.banners && collection.banners.length > 0 ? (
                            collection.banners.map((banner: any) => (
                                <div key={banner.id} className={`bg-white p-4 rounded-xl shadow-sm border ${editingId === banner.id ? 'border-gold' : 'border-gray-100'} flex gap-6 overflow-hidden transition-all`}>
                                    <div className="w-48 h-32 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                                        {banner.image && <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />}
                                        {!banner.image && <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">No Image</div>}
                                        {!banner.isActive && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="bg-red-500 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Inactive</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        {banner.offerText && <span className="text-gold text-xs font-bold uppercase tracking-widest mb-1">{banner.offerText}</span>}
                                        <h3 className="text-xl font-outfit font-bold text-charcoal">{banner.title || 'Untitled Banner'}</h3>
                                        {banner.subtitle && <p className="text-gray-500 text-sm font-outfit mt-1">{banner.subtitle}</p>}
                                        
                                        <div className="flex items-center gap-4 mt-4">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-outfit font-semibold">Order: {banner.displayOrder}</span>
                                            {banner.ctaText && <span className="text-xs bg-charcoal/5 text-charcoal px-2 py-1 rounded font-outfit font-semibold">CTA: {banner.ctaText}</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center border-l border-gray-100 pl-6">
                                        <button 
                                            onClick={() => handleEdit(banner)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(banner.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-outfit font-bold text-charcoal mb-2">No Banners Yet</h3>
                                <p className="text-gray-500 font-outfit">Add your first hero banner for this collection using the form.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
