import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import './Account.css';

const Account = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, login, register, logout, orders, wishlist, removeFromWishlist } = useApp();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            login(formData.email, formData.password);
        } else {
            register(formData.email, formData.password, formData.name);
        }
    };

    if (!user) {
        return (
            <div className="account-auth">
                <div className="container">
                    <div className="auth-form">
                        <h1 className="auth-form__title">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="auth-form__subtitle">
                            {isLogin
                                ? 'Sign in to access your account'
                                : 'Join Luxe Jewels to track orders and save favorites'}
                        </p>

                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required={!isLogin}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <Button type="submit" variant="gold" size="large" fullWidth>
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </Button>
                        </form>

                        <p className="auth-form__switch">
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <button onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="account">
            <div className="container">
                <div className="account__header">
                    <h1>My Account</h1>
                    <Button variant="ghost" onClick={logout}>
                        Sign Out
                    </Button>
                </div>

                <div className="account__grid">
                    {/* Sidebar */}
                    <nav className="account__nav">
                        <button
                            className={`account__nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile
                        </button>
                        <button
                            className={`account__nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            My Orders
                        </button>
                        <button
                            className={`account__nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                            onClick={() => setActiveTab('wishlist')}
                        >
                            Wishlist ({wishlist.length})
                        </button>
                    </nav>

                    {/* Content */}
                    <div className="account__content">
                        {activeTab === 'profile' && (
                            <div className="account-section">
                                <h2>Profile Information</h2>
                                <div className="profile-info">
                                    <div className="info-item">
                                        <span className="info-label">Name:</span>
                                        <span className="info-value">{user.name}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{user.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Member Since:</span>
                                        <span className="info-value">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="account-section">
                                <h2>My Orders</h2>
                                {orders.length === 0 ? (
                                    <div className="empty-state">
                                        <p>No orders yet</p>
                                        <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
                                    </div>
                                ) : (
                                    <div className="orders-list">
                                        {orders.map((order) => (
                                            <div key={order.id} className="order-card">
                                                <div className="order-header">
                                                    <div>
                                                        <p className="order-id">Order #{order.id.slice(-8)}</p>
                                                        <p className="order-date">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className={`order-status order-status--${order.status}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="order-items">
                                                    {order.items.map((item) => (
                                                        <div key={`${item.id}-${item.size}`} className="order-item">
                                                            <img src={item.images[0]} alt={item.name} />
                                                            <div className="order-item__details">
                                                                <p className="order-item__name">{item.name}</p>
                                                                <p className="order-item__qty">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="order-total">
                                                    Total: ₹{order.total.toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'wishlist' && (
                            <div className="account-section">
                                <h2>My Wishlist</h2>
                                {wishlist.length === 0 ? (
                                    <div className="empty-state">
                                        <p>Your wishlist is empty</p>
                                        <Button onClick={() => navigate('/shop')}>Browse Products</Button>
                                    </div>
                                ) : (
                                    <div className="products-grid">
                                        {wishlist.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
