'use client';

import { useEffect, useState, useRef } from 'react';
import { ImagePlus, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getAuthorizedHeaders } from '@/lib/auth';

const HOMEPAGE_CATEGORIES = [
    { slug: 'necklaces', label: 'Necklaces', defaultImage: '/images/product-3.png' },
    { slug: 'earrings',  label: 'Earrings',  defaultImage: '/images/product-1.png' },
    { slug: 'rings',     label: 'Rings',     defaultImage: '/images/product-4.png' },
    { slug: 'bracelets', label: 'Bracelets', defaultImage: '/images/product-1.png' },
    { slug: 'mangalsutras', label: 'Mangalsutras', defaultImage: '/images/product-3.png' },
    { slug: 'sets',      label: 'Sets',      defaultImage: '/images/product-2.png' },
];

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function AdminCategoryImagesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [uploading, setUploading] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        fetch(`${API}/api/categories`)
            .then(r => r.json())
            .then(data => setCategories(data))
            .catch(() => {});
    }, []);

    const getCategoryData = (slug: string) => {
        return categories.find(c =>
            c.name.toLowerCase() === slug || c.name.toLowerCase() === slug.replace(/-/g, ' ')
        );
    };

    const handleUpload = async (slug: string, label: string, file: File) => {
        setUploading(slug);
        try {
            // 1. Upload image to Cloudinary
            const formData = new FormData();
            formData.append('image', file);
            const uploadRes = await fetch(`${API}/api/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!uploadRes.ok) throw new Error('Upload failed');
            const imageUrl = await uploadRes.text();

            const headers = await getAuthorizedHeaders({ 'Content-Type': 'application/json' });

            // 2. Find existing category or create it first
            let catData = getCategoryData(slug);

            if (!catData) {
                // Category not in DB yet — create it
                const createRes = await fetch(`${API}/api/categories`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ name: label, image: imageUrl }),
                });
                if (!createRes.ok) throw new Error('Failed to create category');
                const created = await createRes.json();
                setCategories(prev => [...prev, created]);
                setSaved(slug);
                setTimeout(() => setSaved(null), 2500);
                return;
            }

            // 3. Category exists — update its image
            const updateRes = await fetch(`${API}/api/categories/${catData.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ name: catData.name, image: imageUrl }),
            });
            if (!updateRes.ok) throw new Error('Update failed');
            const updated = await updateRes.json();

            // 4. Update local state
            setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
            setSaved(slug);
            setTimeout(() => setSaved(null), 2500);
        } catch (err) {
            console.error(err);
            alert('Failed to upload image. Check console for details.');
        } finally {
            setUploading(null);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-outfit font-bold text-charcoal">Category Images</h1>
                <p className="text-sm text-gray-400 font-outfit mt-1">Replace homepage category card images. Changes take effect instantly.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {HOMEPAGE_CATEGORIES.map(cat => {
                    const dbCat = getCategoryData(cat.slug);
                    const currentImage = dbCat?.image || cat.defaultImage;

                    return (
                        <div key={cat.slug} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                            <div>
                                {/* Image Preview */}
                                <div className="relative aspect-[4/3] bg-gray-100">
                                    <Image
                                        src={currentImage}
                                        alt={cat.label}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    {/* Gradient overlay label */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                                        <span className="text-white font-outfit font-semibold uppercase tracking-wider text-xs">{cat.label}</span>
                                    </div>
                                    {dbCat?.image && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                                            Custom
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload Action */}
                            <div className="p-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={el => { fileInputRefs.current[cat.slug] = el; }}
                                    onChange={e => {
                                        if (e.target.files?.[0]) handleUpload(cat.slug, cat.label, e.target.files[0]);
                                    }}
                                />
                                <button
                                    onClick={() => fileInputRefs.current[cat.slug]?.click()}
                                    disabled={!!uploading}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-charcoal/20 hover:border-charcoal transition-colors text-[10px] uppercase tracking-wider font-outfit font-bold text-charcoal disabled:opacity-50"
                                >
                                    {uploading === cat.slug ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                                    ) : saved === cat.slug ? (
                                        <><Check className="w-3.5 h-3.5 text-green-500" /> Saved!</>
                                    ) : (
                                        <><ImagePlus className="w-3.5 h-3.5" /> Replace Image</>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
