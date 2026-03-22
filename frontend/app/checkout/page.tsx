'use client';

import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

export default function CheckoutPage() {
    const { cartTotal } = useCart();
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        zip: '',
        country: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Order placed successfully! (Mock)');
    };

    return (
        <div className="min-h-screen bg-ivory pb-20">
            <Navbar />
            <div className="container pt-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Form */}
                <div>
                    <h2 className="text-2xl font-serif mb-8">Contact & Shipping</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="email" placeholder="Email" className="w-full p-3 border border-gray-300 bg-white" required />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="First Name" className="w-full p-3 border border-gray-300 bg-white" required />
                            <input type="text" placeholder="Last Name" className="w-full p-3 border border-gray-300 bg-white" required />
                        </div>
                        <input type="text" placeholder="Address" className="w-full p-3 border border-gray-300 bg-white" required />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="City" className="w-full p-3 border border-gray-300 bg-white" required />
                            <input type="text" placeholder="ZIP Code" className="w-full p-3 border border-gray-300 bg-white" required />
                        </div>

                        <h2 className="text-2xl font-serif mt-8 mb-4">Payment</h2>
                        <div className="p-4 border border-gray-300 bg-white text-gray-400 text-sm">
                            Payment integration would go here (Stripe/Paypal).
                        </div>

                        <button type="submit" className="w-full btn-primary mt-6">Pay Now ${cartTotal.toFixed(2)}</button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-8 h-fit border border-gray-100">
                    <h3 className="font-serif text-xl mb-6">Order Summary</h3>
                    <div className="flex justify-between mb-4 text-sm">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-sm">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-4">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
