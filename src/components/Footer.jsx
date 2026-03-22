import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__container container">
                <div className="footer__grid">
                    {/* Brand */}
                    <div className="footer__column">
                        <h3 className="footer__logo">LUXE JEWELS</h3>
                        <p className="footer__description">
                            Timeless luxury jewellery crafted with precision and passion.
                            Every piece tells a story of elegance and sophistication.
                        </p>
                        <div className="footer__social">
                            <a href="#" className="footer__social-link" aria-label="Instagram">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 0C7.28 0 6.94 0.01 5.88 0.06C2.85 0.22 0.22 2.85 0.06 5.88C0.01 6.94 0 7.28 0 10C0 12.72 0.01 13.06 0.06 14.12C0.22 17.15 2.85 19.78 5.88 19.94C6.94 19.99 7.28 20 10 20C12.72 20 13.06 19.99 14.12 19.94C17.15 19.78 19.78 17.15 19.94 14.12C19.99 13.06 20 12.72 20 10C20 7.28 19.99 6.94 19.94 5.88C19.78 2.85 17.15 0.22 14.12 0.06C13.06 0.01 12.72 0 10 0ZM10 5C7.24 5 5 7.24 5 10C5 12.76 7.24 15 10 15C12.76 15 15 12.76 15 10C15 7.24 12.76 5 10 5ZM10 13C8.35 13 7 11.65 7 10C7 8.35 8.35 7 10 7C11.65 7 13 8.35 13 10C13 11.65 11.65 13 10 13ZM15 3C14.45 3 14 3.45 14 4C14 4.55 14.45 5 15 5C15.55 5 16 4.55 16 4C16 3.45 15.55 3 15 3Z" />
                                </svg>
                            </a>
                            <a href="#" className="footer__social-link" aria-label="Facebook">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M20 10C20 4.48 15.52 0 10 0C4.48 0 0 4.48 0 10C0 14.84 3.44 18.87 8 19.8V13H6V10H8V7.5C8 5.57 9.57 4 11.5 4H14V7H12C11.45 7 11 7.45 11 8V10H14V13H11V19.95C16.05 19.45 20 15.19 20 10Z" />
                                </svg>
                            </a>
                            <a href="#" className="footer__social-link" aria-label="Pinterest">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 0C4.48 0 0 4.48 0 10C0 14.27 2.69 17.9 6.52 19.19C6.42 18.42 6.33 17.16 6.53 16.31L7.57 11.88C7.57 11.88 7.27 11.28 7.27 10.39C7.27 8.96 8.09 7.88 9.13 7.88C10.01 7.88 10.44 8.53 10.44 9.31C10.44 10.18 9.89 11.5 9.6 12.72C9.36 13.72 10.09 14.54 11.08 14.54C12.87 14.54 14.24 12.64 14.24 9.89C14.24 7.48 12.53 5.82 9.95 5.82C6.97 5.82 5.24 8.04 5.24 10.36C5.24 11.23 5.56 12.17 5.96 12.68C6.05 12.79 6.06 12.89 6.04 13L5.75 14.22C5.71 14.41 5.61 14.45 5.41 14.36C4.14 13.77 3.33 11.94 3.33 10.31C3.33 7.04 5.75 4.07 10.22 4.07C13.78 4.07 16.56 6.6 16.56 9.84C16.56 13.24 14.43 15.98 11.38 15.98C10.32 15.98 9.32 15.42 8.99 14.77L8.38 17.09C8.12 18.14 7.39 19.47 6.89 20.29C7.88 20.58 8.92 20.75 10 20.75C15.52 20.75 20 16.27 20 10.75C20 5.23 15.52 0.75 10 0.75V0Z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer__column">
                        <h4 className="footer__title">Shop</h4>
                        <ul className="footer__links">
                            <li><Link to="/shop?collection=wedding">Wedding Collection</Link></li>
                            <li><Link to="/shop?collection=daily-wear">Daily Wear</Link></li>
                            <li><Link to="/shop?collection=gifting">Gifting</Link></li>
                            <li><Link to="/shop?collection=minimal-gold">Minimal Gold</Link></li>
                            <li><Link to="/shop?collection=festive">Festive Edit</Link></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div className="footer__column">
                        <h4 className="footer__title">Customer Care</h4>
                        <ul className="footer__links">
                            <li><Link to="/account">My Account</Link></li>
                            <li><Link to="/account?tab=orders">Order Tracking</Link></li>
                            <li><a href="#">Shipping & Returns</a></li>
                            <li><a href="#">Size Guide</a></li>
                            <li><a href="#">Care Instructions</a></li>
                        </ul>
                    </div>

                    {/* About */}
                    <div className="footer__column">
                        <h4 className="footer__title">About Us</h4>
                        <ul className="footer__links">
                            <li><a href="#">Our Story</a></li>
                            <li><a href="#">Craftsmanship</a></li>
                            <li><a href="#">Certifications</a></li>
                            <li><a href="#">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                <div className="divider"></div>

                {/* Bottom Bar */}
                <div className="footer__bottom">
                    <p className="footer__copyright">
                        © 2026 Luxe Jewels. All rights reserved.
                    </p>
                    <div className="footer__payment">
                        <span className="footer__secure">🔒 Secure Payment</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
