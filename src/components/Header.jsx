import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Header.css';

const Header = () => {
    const { cart, wishlist, user, logout } = useApp();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = wishlist.length;

    return (
        <header className="header">
            <div className="header__container container">
                {/* Logo */}
                <Link to="/" className="header__logo">
                    <h1 className="header__logo-text">LUXE JEWELS</h1>
                </Link>

                {/* Desktop Navigation */}
                <nav className="header__nav desktop-only">
                    <Link to="/shop" className="header__nav-link">Shop</Link>
                    <Link to="/shop?collection=wedding" className="header__nav-link">Wedding</Link>
                    <Link to="/shop?collection=daily-wear" className="header__nav-link">Daily Wear</Link>
                    <Link to="/shop?collection=gifting" className="header__nav-link">Gifting</Link>
                </nav>

                {/* Icons */}
                <div className="header__actions">
                    <button
                        className="header__icon-btn"
                        onClick={() => navigate('/account')}
                        aria-label="Account"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor" />
                            <path d="M10 12C4.477 12 0 14.686 0 18V20H20V18C20 14.686 15.523 12 10 12Z" fill="currentColor" />
                        </svg>
                    </button>

                    <button
                        className="header__icon-btn"
                        onClick={() => navigate('/account?tab=wishlist')}
                        aria-label="Wishlist"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 18.35L8.55 17.03C3.4 12.36 0 9.28 0 5.5C0 2.42 2.42 0 5.5 0C7.24 0 8.91 0.81 10 2.09C11.09 0.81 12.76 0 14.5 0C17.58 0 20 2.42 20 5.5C20 9.28 16.6 12.36 11.45 17.04L10 18.35Z" fill="currentColor" />
                        </svg>
                        {wishlistCount > 0 && (
                            <span className="header__badge">{wishlistCount}</span>
                        )}
                    </button>

                    <button
                        className="header__icon-btn"
                        onClick={() => navigate('/cart')}
                        aria-label="Shopping Cart"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M6 16C4.9 16 4.01 16.9 4.01 18C4.01 19.1 4.9 20 6 20C7.1 20 8 19.1 8 18C8 16.9 7.1 16 6 16ZM0 0V2H2L5.6 9.59L4.25 12.04C4.09 12.32 4 12.65 4 13C4 14.1 4.9 15 6 15H18V13H6.42C6.28 13 6.17 12.89 6.17 12.75L6.2 12.63L7.1 11H14.55C15.3 11 15.96 10.59 16.3 9.97L19.88 3.48C19.96 3.34 20 3.17 20 3C20 2.45 19.55 2 19 2H4.21L3.27 0H0ZM16 16C14.9 16 14.01 16.9 14.01 18C14.01 19.1 14.9 20 16 20C17.1 20 18 19.1 18 18C18 16.9 17.1 16 16 16Z" fill="currentColor" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="header__badge">{cartCount}</span>
                        )}
                    </button>

                    <button
                        className="header__menu-btn mobile-only"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="header__mobile-menu mobile-only">
                    <nav className="header__mobile-nav">
                        <Link to="/shop" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
                        <Link to="/shop?collection=wedding" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Wedding Collection</Link>
                        <Link to="/shop?collection=daily-wear" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Daily Wear</Link>
                        <Link to="/shop?collection=gifting" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Gifting</Link>
                        <Link to="/shop?collection=minimal-gold" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Minimal Gold</Link>
                        <Link to="/shop?collection=festive" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Festive Edit</Link>
                        <Link to="/account" className="header__mobile-link" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
