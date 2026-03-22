'use client';

import Link from 'next/link';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

// Define Product Interface if not imported
interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch products
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    setProducts(products.filter(p => p.id !== id));
                } else {
                    const errorData = await res.json();
                    alert(errorData.message || 'Failed to delete product');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('An error occurred while deleting the product');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-charcoal">Products</h1>
                <Link href="/admin/products/new" className="btn-primary flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                </Link>
            </div>

            <div className="mb-6 flex">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search by Product Name or ID..."
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
                            <th className="p-4">Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-charcoal/80">
                        {products
                            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString().includes(searchTerm))
                            .map(product => (
                                <tr key={product.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 text-charcoal/60 flex items-center space-x-3">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-gray-200" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-400">No Img</div>
                                        )}
                                        <span>#{product.id}</span>
                                    </td>
                                    <td className="p-4 font-medium text-charcoal">{product.name}</td>
                                    <td className="p-4">{product.category || '-'}</td>
                                    <td className="p-4">${product.price}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.stock} in stock
                                        </span>
                                    </td>
                                    <td className="p-4 flex space-x-2">
                                        <Link href={`/admin/products/${product.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
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
                        <span className="ml-3">Loading products...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-charcoal/50">
                        No products found. Add your first product to get started.
                    </div>
                ) : null}
            </div>
        </div>
    );
}
