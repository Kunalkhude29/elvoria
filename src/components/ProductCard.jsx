import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToWishlist, removeFromWishlist, wishlist } = useApp();

    const isInWishlist = wishlist.some(item => item.id === product.id);
    const [imageIndex, setImageIndex] = React.useState(0);

    const handleToggleWishlist = (e) => {
        e.stopPropagation();
        if (isInWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <div
            className="product-card"
            onClick={() => navigate(`/product/${product.id}`)}
            onMouseEnter={() => setImageIndex(1)}
            onMouseLeave={() => setImageIndex(0)}
        >
            <div className="product-card__image-wrapper">
                <img
                    src={product.images[imageIndex] || product.images[0]}
                    alt={product.name}
                    className="product-card__image"
                />
                <button
                    className={`product-card__wishlist ${isInWishlist ? 'product-card__wishlist--active' : ''}`}
                    onClick={handleToggleWishlist}
                    aria-label="Add to wishlist"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                        <path d="M10 18.35L8.55 17.03C3.4 12.36 0 9.28 0 5.5C0 2.42 2.42 0 5.5 0C7.24 0 8.91 0.81 10 2.09C11.09 0.81 12.76 0 14.5 0C17.58 0 20 2.42 20 5.5C20 9.28 16.6 12.36 11.45 17.04L10 18.35Z" />
                    </svg>
                </button>
                {product.tag && (
                    <span className="product-card__tag">{product.tag}</span>
                )}
            </div>

            <div className="product-card__content">
                <h3 className="product-card__name">{product.name}</h3>
                <p className="product-card__material">{product.material}</p>
                <p className="product-card__price">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
        </div>
    );
};

export default ProductCard;
