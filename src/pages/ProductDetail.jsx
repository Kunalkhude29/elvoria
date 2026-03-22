import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();

    const product = products.find(p => p.id === id);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    if (!product) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Product not found</h2>
                <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
            </div>
        );
    }

    const relatedProducts = products
        .filter(p => p.collection === product.collection && p.id !== product.id)
        .slice(0, 4);

    const handleAddToCart = () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            alert('Please select a size');
            return;
        }
        addToCart(product, quantity, selectedSize);
        alert('Added to cart!');
    };

    const inWishlist = isInWishlist(product.id);

    return (
        <div className="product-detail">
            <div className="container">
                <div className="product-detail__grid">
                    {/* Images */}
                    <div className="product-detail__gallery">
                        <div className="gallery__main">
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className="gallery__main-image"
                            />
                        </div>
                        <div className="gallery__thumbnails">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    className={`gallery__thumbnail ${selectedImage === index ? 'gallery__thumbnail--active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={image} alt={`${product.name} view ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="product-detail__info">
                        <div className="product-detail__header">
                            <div>
                                <h1 className="product-detail__title">{product.name}</h1>
                                <p className="product-detail__material">{product.material}</p>
                            </div>
                            <p className="product-detail__price">₹{product.price.toLocaleString('en-IN')}</p>
                        </div>

                        <div className="product-detail__meta">
                            <div className="meta-item">
                                <span className="meta-label">Purity:</span>
                                <span className="meta-value">{product.purity}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Weight:</span>
                                <span className="meta-value">{product.weight}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Stock:</span>
                                <span className="meta-value">{product.stock} available</span>
                            </div>
                        </div>

                        {/* Size Selector */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="product-detail__sizes">
                                <label className="sizes__label">Select Size:</label>
                                <div className="sizes__options">
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            className={`size-option ${selectedSize === size ? 'size-option--active' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="product-detail__quantity">
                            <label className="quantity__label">Quantity:</label>
                            <div className="quantity__controls">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="quantity__btn"
                                >
                                    −
                                </button>
                                <span className="quantity__value">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="quantity__btn"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="product-detail__actions">
                            <Button
                                variant="gold"
                                size="large"
                                fullWidth
                                onClick={handleAddToCart}
                            >
                                Add to Cart
                            </Button>
                            <Button
                                variant="secondary"
                                size="large"
                                onClick={() => {
                                    if (inWishlist) {
                                        removeFromWishlist(product.id);
                                    } else {
                                        addToWishlist(product);
                                    }
                                }}
                            >
                                {inWishlist ? '♥ In Wishlist' : '♡ Add to Wishlist'}
                            </Button>
                        </div>

                        {/* Description */}
                        <div className="product-detail__description">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        {/* Info Accordion */}
                        <div className="product-detail__accordion">
                            <details className="accordion-item">
                                <summary className="accordion-header">Delivery Information</summary>
                                <div className="accordion-content">
                                    <p>Free shipping on all orders. Delivery within 5-7 business days.</p>
                                </div>
                            </details>
                            <details className="accordion-item">
                                <summary className="accordion-header">Returns & Exchange</summary>
                                <div className="accordion-content">
                                    <p>30-day easy returns. Full refund or exchange available.</p>
                                </div>
                            </details>
                            <details className="accordion-item">
                                <summary className="accordion-header">Care Instructions</summary>
                                <div className="accordion-content">
                                    <p>Store in a cool, dry place. Clean with a soft cloth. Avoid exposure to chemicals.</p>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="product-detail__related">
                        <h2 className="section__title">You May Also Like</h2>
                        <div className="products-grid">
                            {relatedProducts.map(relatedProduct => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
