'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';

export default function EditCollectionPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
        heroImage: ''
    });

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections/${params.id}`);
                if (!res.ok) throw new Error('Collection not found');
                const data = await res.json();

                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    isActive: data.isActive ?? true,
                    heroImage: data.heroImage || ''
                });

                if (data.heroImage) {
                    setImagePreview(data.heroImage);
                }
            } catch (error) {
                console.error(error);
                alert('Error fetching collection data');
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [params.id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            let heroImageUrl = formData.heroImage;

            if (imageFile) {
                const imgData = new FormData();
                imgData.append('image', imageFile);

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
                    method: 'POST',
                    body: imgData,
                });

                if (uploadRes.ok) {
                    const uploadResult = await uploadRes.json();
                    heroImageUrl = uploadResult.imageUrl;
                } else {
                    throw new Error('Image upload failed');
                }
            }

            const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    isActive: formData.isActive,
                    heroImage: heroImageUrl
                })
            });

            if (!updateRes.ok) {
                const err = await updateRes.json();
                throw new Error(err.message || 'Failed to update collection');
            }

            alert('Collection updated successfully!');
            router.push('/admin/collections');
        } catch (error: any) {
            console.error('Submission defect:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-charcoal">Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-charcoal mb-8">Edit Collection</h1>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Collection Name</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal h-32"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Active Status</label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal"
                                value={formData.isActive.toString()}
                                onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                            >
                                <option value="true">Active (Visible)</option>
                                <option value="false">Hidden</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Collection Hero Banner (Feature Image)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 flex flex-col items-center justify-center relative hover:bg-gray-100 transition duration-200">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            {imagePreview ? (
                                <img src={imagePreview.startsWith('blob') || imagePreview.startsWith('http') || imagePreview.startsWith('/uploads') ? imagePreview : `/${imagePreview}`} alt="Preview" className="max-h-48 rounded-md shadow-sm" />
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                                    <UploadCloud className="w-12 h-12 text-gray-400" />
                                    <span className="text-gray-500 font-medium">Click or Drag to drop an image spanning the header banner</span>
                                    <span className="text-xs text-gray-400">Optimal size 1920x600px. JPG, PNG up to 5MB.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/collections')}
                            className="px-6 py-2 border border-gray-300 rounded-md text-charcoal hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="btn-primary"
                        >
                            {uploading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
