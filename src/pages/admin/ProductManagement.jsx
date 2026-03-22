import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';
import '../admin/Dashboard.css';

const ProductManagement = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        material: '',
        collection: 'daily-wear',
        description: '',
        images: '',
        sizes: '',
        stock: '',
        purity: '',
        weight: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            images: formData.images.split(',').map(url => url.trim()),
            sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : []
        };

        if (editingProduct) {
            updateProduct(editingProduct.id, productData);
            alert('Product updated!');
        } else {
            addProduct(productData);
            alert('Product added!');
        }

        resetForm();
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            material: product.material,
            collection: product.collection,
            description: product.description,
            images: product.images.join(', '),
            sizes: product.sizes ? product.sizes.join(', ') : '',
            stock: product.stock.toString(),
            purity: product.purity || '',
            weight: product.weight || ''
        });
        setShowForm(true);
    };

    const handleDelete = (productId) => {
        if (confirm('Are you sure you want to delete this product?')) {
            deleteProduct(productId);
            alert('Product deleted!');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            material: '',
            collection: 'daily-wear',
            description: '',
            images: '',
            sizes: '',
            stock: '',
            purity: '',
            weight: ''
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <h1>Product Management</h1>
                <Button
                    variant="gold"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Product'}
                </Button>
            </div>

            {/* Product Form */}
            {showForm && (
                <div className="dashboard-section" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-lg)', gridTemplateColumns: '1fr 1fr' }}>
                        <div className="form-group">
                            <label>Product Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Price (₹) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Material *</label>
                            <input type="text" name="material" value={formData.material} onChange={handleChange} required placeholder="e.g. 18K Gold • Diamond" />
                        </div>

                        <div className="form-group">
                            <label>Collection *</label>
                            <select name="collection" value={formData.collection} onChange={handleChange} required>
                                <option value="wedding">Wedding</option>
                                <option value="daily-wear">Daily Wear</option>
                                <option value="gifting">Gifting</option>
                                <option value="minimal-gold">Minimal Gold</option>
                                <option value="festive">Festive Edit</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Purity</label>
                            <input type="text" name="purity" value={formData.purity} onChange={handleChange} placeholder="e.g. 22K" />
                        </div>

                        <div className="form-group">
                            <label>Weight</label>
                            <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 5.2g" />
                        </div>

                        <div className="form-group">
                            <label>Stock *</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Sizes (comma-separated)</label>
                            <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="e.g. 10, 12, 14" />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Description *</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Image URLs (comma-separated) *</label>
                            <textarea name="images" value={formData.images} onChange={handleChange} required rows="2" placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
                        </div>

                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--spacing-md)' }}>
                            <Button type="submit" variant="gold">
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products List */}
            <div className="dashboard-section">
                <h2>All Products ({products.length})</h2>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Material</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Collection</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <img src={product.images[0]} alt={product.name} style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.material}</td>
                                    <td className="amount">₹{product.price.toLocaleString('en-IN')}</td>
                                    <td>{product.stock}</td>
                                    <td><span style={{ textTransform: 'capitalize' }}>{product.collection.replace('-', ' ')}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                            <Button variant="ghost" size="small" onClick={() => handleEdit(product)}>
                                                Edit
                                            </Button>
                                            <Button variant="ghost" size="small" onClick={() => handleDelete(product.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;
