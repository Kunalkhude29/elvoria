'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const headers = await getAuthorizedHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products`, {
                headers
            });
            if (res.ok) setProducts(await res.json());
        };
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products/${id}`, { 
                method: 'DELETE',
                headers
            });
            if (res.ok) setProducts(prev => prev.filter((p: any) => p.id !== id));
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-outfit font-bold text-charcoal">Products</h1>
                <Link href="/admin/products/new" className="btn-primary flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-outfit font-semibold text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-outfit">
                            {products.map((product: any) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-outfit font-semibold text-gray-400 text-xs">#{product.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="relative w-12 h-12 rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
                                            <Image 
                                                src={product.images?.[0] || '/images/placeholder.png'} 
                                                alt={product.name} 
                                                fill 
                                                className="object-cover" 
                                                unoptimized
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-outfit font-bold text-charcoal">{product.name}</td>
                                    <td className="px-6 py-4 font-outfit font-semibold font-bold text-gold">₹{product.price}</td>
                                    <td className="px-6 py-4 font-outfit font-semibold">{product.stock}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            <Link href={`/admin/products/${product.id}/edit`} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="Edit Product">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Delete Product">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
