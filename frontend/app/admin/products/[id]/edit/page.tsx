'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        image: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        const fetchProduct = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${resolvedParams.id}`);
                if (res.ok) {
                    const product = await res.json();
                    setFormData({
                        name: product.name || '',
                        description: product.description || '',
                        price: product.price ? product.price.toString() : '',
                        stock: product.stock !== undefined ? product.stock.toString() : '',
                        categoryId: product.categoryId ? product.categoryId.toString() : '',
                        image: product.image || ''
                    });
                    if (product.image) {
                        setImagePreview(product.image);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
        fetchProduct();
    }, [resolvedParams.id]);

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
        let imageUrl = formData.image;

        try {
            // 1. Upload Image (Optional, if file is selected)
            if (imageFile) {
                const imgData = new FormData();
                imgData.append('image', imageFile);

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
                    method: 'POST',
                    body: imgData,
                });

                if (!uploadRes.ok) throw new Error('Image upload failed');
                const rawUrl = await uploadRes.text();
                imageUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${rawUrl}`;
            }

            // 2. Update Product
            const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${resolvedParams.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    price: Number(formData.price),
                    description: formData.description,
                    stock: Number(formData.stock),
                    categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
                    images: imageUrl ? [imageUrl] : []
                }),
            });

            if (!productRes.ok) throw new Error('Failed to update product');

            alert('Product updated successfully!');
            router.push('/admin/products');
        } catch (error: any) {
            console.error('Submission error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-charcoal">Loading product data...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-charcoal mb-8">Edit Product {`#${resolvedParams.id}`}</h1>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Product Name</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Price</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Stock Inventory</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal"
                                required
                                min="0"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Category</label>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal"
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                        >
                            <option value="">Select a category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal h-32"
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Product Image</label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            className="mb-4"
                            onChange={handleImageChange}
                        />
                        {imagePreview && (
                            <div className="mt-4">
                                <img src={imagePreview} alt="Preview" className="h-32 object-cover rounded-md border border-gray-200" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                        <button type="button" onClick={() => router.back()} disabled={uploading} className="px-6 py-2 border border-charcoal text-charcoal rounded-md hover:bg-gray-50 font-medium disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={uploading} className="px-6 py-2 bg-charcoal text-white rounded-md hover:bg-black font-medium disabled:opacity-50">
                            {uploading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
