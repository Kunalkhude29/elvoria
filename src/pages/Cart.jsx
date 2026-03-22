import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useApp();

    if (cart.length === 0) {
        return (
            <div className="cart-empty">
                <div className="container">
                    <div className="cart-empty__content">
                        <svg width="80" height="80" viewBox="0 0 20 20" fill="none" stroke="var(--color-text-secondary)" strokeWidth="0.5">
                            <path d="M6 16C4.9 16 4.01 16.9 4.01 18C4.01 19.1 4.9 20 6 20C7.1 20 8 19.1 8 18C8 16.9 7.1 16 6 16ZM0 0V2H2L5.6 9.59L4.25 12.04C4.09 12.32 4 12.65 4 13C4 14.1 4.9 15 6 15H18V13H6.42C6.28 13 6.17 12.89 6.17 12.75L6.2 12.63L7.1 11H14.55C15.3 11 15.96 10.59 16.3 9.97L19.88 3.48C19.96 3.34 20 3.17 20 3C20 2.45 19.55 2 19 2H4.21L3.27 0H0ZM16 16C14.9 16 14.01 16.9 14.01 18C14.01 19.1 14.9 20 16 20C17.1 20 18 19.1 18 18C18 16.9 17.1 16 16 16Z" />
                        </svg>
                        <h2>Your cart is empty</h2>
                        <p>Add some beautiful pieces to get started</p>
                        <Button variant="gold" onClick={() => navigate('/shop')}>
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const subtotal = getCartTotal();
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.03; // 3% tax estimate
    const total = subtotal + shipping + tax;

    return (
        <div className="cart">
            <div className="container">
                <h1 className="cart__title">Shopping Cart</h1>

                <div className="cart__grid">
                    {/* Cart Items */}
                    <div className="cart__items">
                        {cart.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="cart-item">
                                <div
                                    className="cart-item__image"
                                    onClick={() => navigate(`/product/${item.id}`)}
                                >
                                    <img src={item.images[0]} alt={item.name} />
                                </div>

                                <div className="cart-item__details">
                                    <h3
                                        className="cart-item__name"
                                        onClick={() => navigate(`/product/${item.id}`)}
                                    >
                                        {item.name}
                                    </h3>
                                    <p className="cart-item__material">{item.material}</p>
                                    {item.size && (
                                        <p className="cart-item__size">Size: {item.size}</p>
                                    )}
                                    <p className="cart-item__price">₹{item.price.toLocaleString('en-IN')}</p>
                                </div>

                                <div className="cart-item__quantity">
                                    <button
                                        className="quantity-btn"
                                        onClick={() => updateCartQuantity(item.id, item.quantity - 1, item.size)}
                                    >
                                        −
                                    </button>
                                    <span className="quantity-value">{item.quantity}</span>
                                    <button
                                        className="quantity-btn"
                                        onClick={() => updateCartQuantity(item.id, item.quantity + 1, item.size)}
                                    >
                                        +
                                    </button>
                                </div>

                                <p className="cart-item__total">
                                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                </p>

                                <button
                                    className="cart-item__remove"
                                    onClick={() => removeFromCart(item.id, item.size)}
                                    aria-label="Remove item"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="cart__summary">
                        <h2 className="summary__title">Order Summary</h2>

                        <div className="summary__row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="summary__row">
                            <span>Shipping</span>
                            <span className="summary__free">Free</span>
                        </div>

                        <div className="summary__row">
                            <span>Estimated Tax</span>
                            <span>₹{tax.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="divider"></div>

                        <div className="summary__total">
                            <span>Total</span>
                            <span>₹{total.toLocaleString('en-IN')}</span>
                        </div>

                        <Button
                            variant="gold"
                            size="large"
                            fullWidth
                            onClick={() => navigate('/checkout')}
                        >
                            Proceed to Checkout
                        </Button>

                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => navigate('/shop')}
                        >
                            Continue Shopping
                        </Button>

                        <div className="summary__reassurance">
                            <p>✓ Free shipping on all orders</p>
                            <p>✓ 30-day easy returns</p>
                            <p>✓ Secure checkout</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
