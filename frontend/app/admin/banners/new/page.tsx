'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function NewCollectionPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [heroImage, setHeroImage] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

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
                setHeroImage(fullUrl);
            } else {
                setError('Failed to upload image. Please try again.');
            }
        } catch (err) {
            setError('Error uploading image.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/collections`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name, slug, description, heroImage })
            });

            if (res.ok) {
                router.push('/admin/banners');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to create collection');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin/banners" className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-charcoal">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-outfit font-bold text-charcoal">Create Banner Group</h1>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-outfit font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-outfit font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3 font-bold">Group Name (e.g. Women Page)</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                            }}
                            className="w-full border-b border-gray-100 py-3 font-outfit font-semibold focus:outline-none focus:border-gold transition-colors bg-transparent text-lg"
                            placeholder="Women's Collection"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-outfit font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3 font-bold">Target Slug (Page Route)</label>
                        <input
                            type="text"
                            required
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full border-b border-gray-100 py-3 font-outfit font-semibold focus:outline-none focus:border-gold transition-colors bg-transparent text-gray-400"
                            placeholder="women"
                        />
                        <p className="mt-2 text-[10px] text-gray-400 font-outfit font-semibold uppercase tracking-widest"> This slug should match the page where you want the banners to appear.</p>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-charcoal text-white h-14 w-full rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-gold transition-all duration-300 font-bold uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Create Banner Group</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
