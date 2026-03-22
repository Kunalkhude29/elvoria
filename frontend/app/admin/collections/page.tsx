'use client';

import Link from 'next/link';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Collection {
    id: number;
    name: string;
    description: string;
    heroImage?: string;
    isActive: boolean;
    products?: any[];
}

export default function AdminCollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections`);
            if (res.ok) {
                const data = await res.json();
                setCollections(data);
            }
        } catch (error) {
            console.error('Failed to fetch collections', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this collection?')) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections/${id}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    setCollections(collections.filter(c => c.id !== id));
                } else {
                    const errorData = await res.json();
                    alert(errorData.message || 'Failed to delete collection');
                }
            } catch (error) {
                console.error('Error deleting collection:', error);
                alert('An error occurred while deleting the collection');
            }
        }
    };

    const toggleActive = async (collection: Collection) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections/${collection.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...collection, isActive: !collection.isActive })
            });

            if (res.ok) {
                setCollections(collections.map(c =>
                    c.id === collection.id ? { ...c, isActive: !c.isActive } : c
                ));
            } else {
                alert('Failed to update collection status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('An error occurred');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-charcoal">Collections</h1>
                <Link href="/admin/collections/new" className="btn-primary flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add Collection</span>
                </Link>
            </div>

            <div className="mb-6 flex">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search by Collection Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-charcoal bg-white shadow-sm"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wider text-charcoal/60">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Banner</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Products Linked</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-charcoal/80">
                        {collections
                            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(collection => (
                                <tr key={collection.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 font-medium">#{collection.id}</td>
                                    <td className="p-4 text-charcoal/60">
                                        {collection.heroImage ? (
                                            <img src={(collection.heroImage.startsWith('/uploads') || collection.heroImage.startsWith('http')) ? collection.heroImage : `/${collection.heroImage}`} alt={collection.name} className="w-20 h-10 object-cover rounded-md border border-gray-200" />
                                        ) : (
                                            <div className="w-20 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-400">No Img</div>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-charcoal">{collection.name}</td>
                                    <td className="p-4 max-w-xs truncate">{collection.description || '-'}</td>
                                    <td className="p-4 text-center">{collection.products?.length || 0}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleActive(collection)}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${collection.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {collection.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {collection.isActive ? 'Active' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td className="p-4 flex space-x-3 items-center pt-6">
                                        <Link href={`/admin/collections/${collection.id}/edit`} className="text-blue-600 hover:text-blue-800 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(collection.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {loading ? (
                    <div className="p-8 text-center text-charcoal flex justify-center items-center">
                        <div className="w-6 h-6 border-2 border-beige border-t-gold rounded-full animate-spin"></div>
                        <span className="ml-3">Loading collections...</span>
                    </div>
                ) : collections.length === 0 ? (
                    <div className="p-8 text-center text-charcoal/50">
                        No collections configured globally. Click 'Add Collection' to begin cataloging.
                    </div>
                ) : null}
            </div>
        </div>
    );
}
