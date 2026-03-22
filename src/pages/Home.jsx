import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { getBestSellers, getNewArrivals, collections } from '../data/products';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { products } = useApp();

    const bestSellers = getBestSellers();
    const newArrivals = getNewArrivals();

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero__content">
                    <h1 className="hero__title fade-in-up">
                        Timeless Elegance,
                        <br />
                        <span className="text-gradient">Crafted for You</span>
                    </h1>
                    <p className="hero__subtitle fade-in-up">
                        Discover handcrafted luxury jewellery that celebrates life's precious moments.
                        <br />
                        Every piece tells a story of sophistication and grace.
                    </p>
                    <div className="hero__cta fade-in-up">
                        <Button variant="gold" size="large" onClick={() => navigate('/shop')}>
                            Explore Collections
                        </Button>
                        <Button variant="secondary" size="large" onClick={() => navigate('/shop?collection=wedding')}>
                            Wedding Collection
                        </Button>
                    </div>
                </div>
                <div className="hero__trust">
                    <div className="trust-badge">
                        <span className="trust-badge__icon">✓</span>
                        <span className="trust-badge__text">100% Certified Purity</span>
                    </div>
                    <div className="trust-badge">
                        <span className="trust-badge__icon">🚚</span>
                        <span className="trust-badge__text">Free Shipping</span>
                    </div>
                    <div className="trust-badge">
                        <span className="trust-badge__icon">↺</span>
                        <span className="trust-badge__text">Easy Returns</span>
                    </div>
                    <div className="trust-badge">
                        <span className="trust-badge__icon">🏆</span>
                        <span className="trust-badge__text">Lifetime Warranty</span>
                    </div>
                </div>
            </section>

            {/* Featured Collections */}
            <section className="section collections">
                <div className="container">
                    <div className="section__header">
                        <h2 className="section__title">Our Collections</h2>
                        <p className="section__subtitle">
                            Curated pieces for every occasion and celebration
                        </p>
                    </div>

                    <div className="collections__grid">
                        {collections.map((collection, index) => (
                            <div
                                key={collection.id}
                                className="collection-card"
                                onClick={() => navigate(`/shop?collection=${collection.id}`)}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="collection-card__content">
                                    <h3 className="collection-card__title">{collection.name}</h3>
                                    <p className="collection-card__description">{collection.description}</p>
                                    <span className="collection-card__link">Explore →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Best Sellers */}
            <section className="section bestsellers">
                <div className="container">
                    <div className="section__header">
                        <h2 className="section__title">Best Sellers</h2>
                        <p className="section__subtitle">
                            Our most-loved pieces, chosen by you
                        </p>
                    </div>

                    <div className="products-grid">
                        {bestSellers.slice(0, 4).map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div className="section__cta">
                        <Button variant="secondary" onClick={() => navigate('/shop')}>
                            View All Products
                        </Button>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="section new-arrivals">
                <div className="container">
                    <div className="section__header">
                        <h2 className="section__title">New Arrivals</h2>
                        <p className="section__subtitle">
                            Fresh designs to elevate your collection
                        </p>
                    </div>

                    <div className="products-grid">
                        {newArrivals.slice(0, 4).map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Brand Story */}
            <section className="section brand-story">
                <div className="container">
                    <div className="brand-story__content">
                        <div className="brand-story__text">
                            <h2 className="section__title">Crafted with Passion</h2>
                            <p>
                                At Luxe Jewels, every piece is a testament to our commitment to excellence.
                                Our master craftsmen blend traditional techniques with contemporary design,
                                creating jewellery that transcends time.
                            </p>
                            <p>
                                From ethically sourced materials to certified purity, we ensure every detail
                                meets the highest standards. Your trust inspires us to create pieces that
                                become part of your most cherished memories.
                            </p>
                            <Button variant="ghost" onClick={() => navigate('/shop')}>
                                Discover Our Story
                            </Button>
                        </div>
                        <div className="brand-story__image">
                            <div className="brand-story__placeholder">
                                <span>✨</span>
                                <p>Handcrafted Excellence</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Instagram Section */}
            <section className="section instagram">
                <div className="container">
                    <div className="section__header">
                        <h2 className="section__title">Style Inspiration</h2>
                        <p className="section__subtitle">
                            Join our community @luxejewels
                        </p>
                    </div>

                    <div className="instagram__grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="instagram__card">
                                <div className="instagram__placeholder">
                                    <svg width="40" height="40" viewBox="0 0 20 20" fill="var(--color-champagne)">
                                        <path d="M10 0C7.28 0 6.94 0.01 5.88 0.06C2.85 0.22 0.22 2.85 0.06 5.88C0.01 6.94 0 7.28 0 10C0 12.72 0.01 13.06 0.06 14.12C0.22 17.15 2.85 19.78 5.88 19.94C6.94 19.99 7.28 20 10 20C12.72 20 13.06 19.99 14.12 19.94C17.15 19.78 19.78 17.15 19.94 14.12C19.99 13.06 20 12.72 20 10C20 7.28 19.99 6.94 19.94 5.88C19.78 2.85 17.15 0.22 14.12 0.06C13.06 0.01 12.72 0 10 0ZM10 5C7.24 5 5 7.24 5 10C5 12.76 7.24 15 10 15C12.76 15 15 12.76 15 10C15 7.24 12.76 5 10 5ZM10 13C8.35 13 7 11.65 7 10C7 8.35 8.35 7 10 7C11.65 7 13 8.35 13 10C13 11.65 11.65 13 10 13Z" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
