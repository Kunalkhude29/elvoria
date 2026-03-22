'use client';

import { useCart, CartItem } from '../../context/CartContext';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

    return (
        <div className="min-h-screen bg-ivory pb-20">
            <Navbar />
            <div className="container pt-32">
                <h1 className="text-3xl lg:text-4xl font-serif text-charcoal mb-12">Your Shopping Bag</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 border-t border-b border-gray-100">
                        <p className="text-lg text-charcoal/60 mb-6">Your bag is currently empty.</p>
                        <Link href="/" className="btn-secondary inline-block">Continue Shopping</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {cart.map((item: CartItem) => (
                                <div key={item.id} className="flex gap-6 border-b border-gray-100 pb-6">
                                    <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link href={`/product/${item.id}`} className="font-serif text-lg text-charcoal hover:text-gold transition-colors">
                                                {item.name}
                                            </Link>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-charcoal/60 mb-4">${Number(item.price).toFixed(2)}</p>

                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center border border-gray-200">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-50"><Minus className="w-4 h-4 text-gray-500" /></button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-50"><Plus className="w-4 h-4 text-gray-500" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 border border-gray-100 sticky top-32">
                                <h2 className="font-serif text-xl mb-6">Order Summary</h2>
                                <div className="space-y-4 mb-6 text-sm text-charcoal/80">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>Calculated at checkout</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-4 mb-8 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <button className="w-full btn-primary flex items-center justify-center space-x-2">
                                    <span>Checkout</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <div className="mt-6 text-xs text-center text-gray-400">
                                    <p>Secure Checkout</p>
                                    <p className="mt-2">Free shipping on orders over $150</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
