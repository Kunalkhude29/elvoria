'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Library, ImagePlus } from 'lucide-react';
import Link from 'next/link';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function AdminCollectionsPage() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCollections = async () => {
        try {
            const headers = await getAuthorizedHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/collections`, {
                headers
            });
            if (res.ok) {
                const data = await res.json();
                setCollections(data);
            }
        } catch (error) {
            console.error("Failed to fetch collections", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this collection?')) return;
        
        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/collections/${id}`, {
                method: 'DELETE',
                headers
            });
            if (res.ok) {
                fetchCollections();
            }
        } catch (error) {
            console.error("Failed to delete collection", error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-outfit font-bold text-charcoal">Banners</h1>
                <Link 
                    href="/admin/banners/new" 
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Banner Group
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-outfit font-semibold text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Page / Group Name</th>
                                <th className="px-6 py-4">Slug (Route)</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-alegreya">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading banners...</td>
                                </tr>
                            ) : collections.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No banner groups found.</td>
                                </tr>
                            ) : (
                                collections.map((collection: any) => (
                                    <tr key={collection.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 text-gold">
                                                    <Library className="w-5 h-5" />
                                                </div>
                                                <span className="font-outfit font-semibold font-medium text-charcoal">{collection.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{collection.slug}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link 
                                                    href={`/admin/banners/${collection.id}/banners`}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Manage Banners"
                                                >
                                                    <ImagePlus className="w-4 h-4" />
                                                </Link>
                                                <Link 
                                                    href={`/admin/banners/${collection.id}/edit`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Group"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(collection.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
