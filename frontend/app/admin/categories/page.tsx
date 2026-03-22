'use client';

import Link from 'next/link';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
    image?: string;
    products?: any[];
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/${id}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    setCategories(categories.filter(c => c.id !== id));
                } else {
                    const errorData = await res.json();
                    alert(errorData.message || 'Failed to delete category');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('An error occurred while deleting the category');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-charcoal">Categories</h1>
                <Link href="/admin/categories/new" className="btn-primary flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add Category</span>
                </Link>
            </div>

            <div className="mb-6 flex">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search by Category Name..."
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
                            <th className="p-4">Icon/Image</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Products Linked</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-charcoal/80">
                        {categories
                            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(category => (
                                <tr key={category.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 font-medium">#{category.id}</td>
                                    <td className="p-4 text-charcoal/60">
                                        {category.image ? (
                                            <img src={(category.image.startsWith('/uploads') || category.image.startsWith('http')) ? category.image : `/${category.image}`} alt={category.name} className="w-12 h-12 object-cover rounded-full border border-gray-200" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-400">No Img</div>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-charcoal">{category.name}</td>
                                    <td className="p-4 text-center">{category.products?.length || 0}</td>
                                    <td className="p-4 flex space-x-3 items-center pt-7">
                                        <Link href={`/admin/categories/${category.id}/edit`} className="text-blue-600 hover:text-blue-800 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(category.id)} className="text-red-500 hover:text-red-700 transition-colors">
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
                        <span className="ml-3">Loading categories...</span>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-8 text-center text-charcoal/50">
                        No categories configured. Click 'Add Category' to begin.
                    </div>
                ) : null}
            </div>
        </div>
    );
}
