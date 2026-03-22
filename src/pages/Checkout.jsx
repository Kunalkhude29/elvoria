import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal, createOrder, user } = useApp();
    const [formData, setFormData] = useState({
        email: user?.email || '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        paymentMethod: 'card'
    });

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const order = createOrder({
            customerInfo: formData,
            paymentMethod: formData.paymentMethod
        });
        alert(`Order placed successfully! Order ID: ${order.id}`);
        navigate('/account?tab=orders');
    };

    const subtotal = getCartTotal();
    const shipping = 0;
    const tax = subtotal * 0.03;
    const total = subtotal + shipping + tax;

    return (
        <div className="checkout">
            <div className="container">
                <h1 className="checkout__title">Secure Checkout</h1>

                <div className="checkout__grid">
                    {/* Checkout Form */}
                    <form className="checkout__form" onSubmit={handleSubmit}>
                        {/* Contact Information */}
                        <div className="form-section">
                            <h2 className="form-section__title">Contact Information</h2>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="form-section">
                            <h2 className="form-section__title">Shipping Address</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="Street address"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="state">State</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="pincode">Pincode</label>
                                    <input
                                        type="text"
                                        id="pincode"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="form-section">
                            <h2 className="form-section__title">Payment Method</h2>
                            <div className="payment-methods">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={formData.paymentMethod === 'card'}
                                        onChange={handleChange}
                                    />
                                    <span>Credit / Debit Card</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="upi"
                                        checked={formData.paymentMethod === 'upi'}
                                        onChange={handleChange}
                                    />
                                    <span>UPI</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handleChange}
                                    />
                                    <span>Cash on Delivery</span>
                                </label>
                            </div>
                        </div>

                        <Button type="submit" variant="gold" size="large" fullWidth>
                            Place Order - ₹{total.toLocaleString('en-IN')}
                        </Button>
                    </form>

                    {/* Order Summary */}
                    <div className="checkout__summary">
                        <h2 className="summary__title">Order Summary</h2>

                        <div className="summary__items">
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.size}`} className="summary-item">
                                    <img src={item.images[0]} alt={item.name} />
                                    <div className="summary-item__details">
                                        <p className="summary-item__name">{item.name}</p>
                                        <p className="summary-item__qty">Qty: {item.quantity}</p>
                                        {item.size && <p className="summary-item__size">Size: {item.size}</p>}
                                    </div>
                                    <p className="summary-item__price">
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="divider"></div>

                        <div className="summary__row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary__row">
                            <span>Shipping</span>
                            <span className="summary__free">Free</span>
                        </div>
                        <div className="summary__row">
                            <span>Tax</span>
                            <span>₹{tax.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="divider"></div>

                        <div className="summary__total">
                            <span>Total</span>
                            <span>₹{total.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="summary__security">
                            <p>🔒 Your information is secure</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
