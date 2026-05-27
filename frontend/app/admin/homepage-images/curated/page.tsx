'use client';

import { useEffect, useState, useRef } from 'react';
import { ImagePlus, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getAuthorizedHeaders } from '@/lib/auth';

const CURATED_DEFAULTS = [
    { key: 'wedding',   label: 'Wedding',    defaultImage: '/images/product-3.png' },
    { key: 'daily-wear', label: 'Daily Wear', defaultImage: '/images/product-1.png' },
    { key: 'gifting',   label: 'Gifting',    defaultImage: '/images/product-2.png' },
];

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function AdminCuratedImagesPage() {
    const [images, setImages] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        fetch(`${API}/api/homepage-images`)
            .then(r => r.json())
            .then((data: { key: string; image: string }[]) => {
                const map: Record<string, string> = {};
                data.forEach(d => { map[d.key] = d.image; });
                setImages(map);
            })
            .catch(() => {});
    }, []);

    const handleUpload = async (key: string, file: File) => {
        setUploading(key);
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

            // 2. Save to DB via upsert endpoint
            const headers = await getAuthorizedHeaders({ 'Content-Type': 'application/json' });
            const updateRes = await fetch(`${API}/api/homepage-images/${key}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ image: imageUrl }),
            });
            if (!updateRes.ok) throw new Error('Update failed');

            // 3. Update local state
            setImages(prev => ({ ...prev, [key]: imageUrl }));
            setSaved(key);
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
                <h1 className="text-3xl font-outfit font-bold text-charcoal">Curated For You Images</h1>
                <p className="text-sm text-gray-400 font-outfit mt-1">Replace the "Curated For You" section images. Changes take effect instantly.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {CURATED_DEFAULTS.map(item => {
                    const currentImage = images[item.key] || item.defaultImage;

                    return (
                        <div key={item.key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                            <div>
                                {/* Image Preview */}
                                <div className="relative aspect-[4/3] bg-gray-100">
                                    <Image
                                        src={currentImage}
                                        alt={item.label}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                                        <span className="text-white font-outfit font-semibold uppercase tracking-wider text-xs">{item.label}</span>
                                    </div>
                                    {images[item.key] && (
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
                                    ref={el => { fileInputRefs.current[item.key] = el; }}
                                    onChange={e => {
                                        if (e.target.files?.[0]) handleUpload(item.key, e.target.files[0]);
                                    }}
                                />
                                <button
                                    onClick={() => fileInputRefs.current[item.key]?.click()}
                                    disabled={!!uploading}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-charcoal/20 hover:border-charcoal transition-colors text-[10px] uppercase tracking-wider font-outfit font-bold text-charcoal disabled:opacity-50"
                                >
                                    {uploading === item.key ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                                    ) : saved === item.key ? (
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
