'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [heroImage, setHeroImage] = useState('');
    const [loading, setLoading] = useState(true);
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
                // Ensure URL is absolute for preview if it starts with /uploads
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

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/collections/${resolvedParams.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setName(data.name || '');
                    setSlug(data.slug || '');
                    setDescription(data.description || '');
                    setHeroImage(data.heroImage || '');
                }
            } catch (err) {
                console.error("Failed to fetch collection", err);
                setError("Failed to load collection details");
            } finally {
                setLoading(false);
            }
        };
        fetchCollection();
    }, [resolvedParams.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/collections/${resolvedParams.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ name, slug, description, heroImage })
            });

            if (res.ok) {
                router.push('/admin/banners');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to update collection');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
                <p className="text-gray-500 font-outfit font-semibold">Loading collection details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin/banners" className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-charcoal">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-outfit font-bold text-charcoal">Edit Banner Group</h1>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-outfit font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-outfit font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3 font-bold">Group Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                            }}
                            className="w-full border-b border-gray-100 py-3 font-outfit font-semibold focus:outline-none focus:border-gold transition-colors bg-transparent text-lg"
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
                        />
                        <p className="mt-2 text-[10px] text-gray-400 font-outfit font-semibold uppercase tracking-widest">Changing this will move the banners to a different page.</p>
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
                                    <span>Update Banner Group</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
