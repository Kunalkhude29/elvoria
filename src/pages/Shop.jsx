import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { collections } from '../data/products';
import './Shop.css';

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { products } = useApp();
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [selectedCollection, setSelectedCollection] = useState(searchParams.get('collection') || 'all');
    const [selectedMaterial, setSelectedMaterial] = useState('all');

    useEffect(() => {
        let result = [...products];

        // Filter by collection
        if (selectedCollection && selectedCollection !== 'all') {
            result = result.filter(p => p.collection === selectedCollection);
        }

        // Filter by material
        if (selectedMaterial && selectedMaterial !== 'all') {
            result = result.filter(p =>
                p.material.toLowerCase().includes(selectedMaterial.toLowerCase())
            );
        }

        setFilteredProducts(result);
    }, [selectedCollection, selectedMaterial, products]);

    const handleCollectionChange = (collection) => {
        setSelectedCollection(collection);
        if (collection !== 'all') {
            setSearchParams({ collection });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className="shop">
            <div className="shop__header">
                <div className="container">
                    <h1 className="shop__title">Shop All Jewellery</h1>
                    <p className="shop__subtitle">
                        {filteredProducts.length} exquisite pieces
                    </p>
                </div>
            </div>

            <div className="shop__main container">
                {/* Sidebar Filters */}
                <aside className="shop__sidebar">
                    <div className="filter-group">
                        <h3 className="filter-group__title">Collections</h3>
                        <ul className="filter-list">
                            <li>
                                <button
                                    className={`filter-item ${selectedCollection === 'all' ? 'filter-item--active' : ''}`}
                                    onClick={() => handleCollectionChange('all')}
                                >
                                    All Jewellery
                                </button>
                            </li>
                            {collections.map(collection => (
                                <li key={collection.id}>
                                    <button
                                        className={`filter-item ${selectedCollection === collection.id ? 'filter-item--active' : ''}`}
                                        onClick={() => handleCollectionChange(collection.id)}
                                    >
                                        {collection.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="divider"></div>

                    <div className="filter-group">
                        <h3 className="filter-group__title">Material</h3>
                        <ul className="filter-list">
                            <li>
                                <button
                                    className={`filter-item ${selectedMaterial === 'all' ? 'filter-item--active' : ''}`}
                                    onClick={() => setSelectedMaterial('all')}
                                >
                                    All Materials
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`filter-item ${selectedMaterial === 'gold' ? 'filter-item--active' : ''}`}
                                    onClick={() => setSelectedMaterial('gold')}
                                >
                                    Gold
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`filter-item ${selectedMaterial === 'diamond' ? 'filter-item--active' : ''}`}
                                    onClick={() => setSelectedMaterial('diamond')}
                                >
                                    Diamond
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`filter-item ${selectedMaterial === 'pearl' ? 'filter-item--active' : ''}`}
                                    onClick={() => setSelectedMaterial('pearl')}
                                >
                                    Pearl
                                </button>
                            </li>
                        </ul>
                    </div>
                </aside>

                {/* Products Grid */}
                <div className="shop__products">
                    {filteredProducts.length > 0 ? (
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="shop__empty">
                            <p>No products found matching your filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;
