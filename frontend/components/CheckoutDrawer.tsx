'use client';

import { useCheckout } from '../context/CheckoutContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getAuthorizedHeaders } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    ChevronLeft, 
    MapPin, 
    ChevronRight, 
    ChevronUp,
    ChevronDown,
    Ticket, 
    QrCode, 
    CreditCard, 
    Wallet,
    CheckCircle2,
    ShoppingCart,
    Truck,
    Mail,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchPincodeDetails } from '@/lib/pincode';

export default function CheckoutDrawer() {
    const { isCheckoutOpen, closeCheckout } = useCheckout();
    const { cart, cartTotal, cartCount, clearCart } = useCart();
    const { profile, refreshProfile } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
    const [showItems, setShowItems] = useState(false);
    const [view, setView] = useState<'OVERVIEW' | 'EDIT_ADDRESS' | 'AUTH'>('OVERVIEW');
    
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [placingOrder, setPlacingOrder] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        pinCode: '',
        country: 'India',
        addressType: 'Home'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            const primaryAddress = profile.addresses?.[0];
            setFormData({
                fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                phone: profile.phone || primaryAddress?.phone || '',
                address: primaryAddress?.address || '',
                apartment: primaryAddress?.apartment || '',
                city: primaryAddress?.city || '',
                state: primaryAddress?.state || '',
                pinCode: primaryAddress?.pinCode || '',
                country: primaryAddress?.country || 'India',
                addressType: 'Home'
            });
        }
    }, [profile]);

    useEffect(() => {
        if (isCheckoutOpen) {
            if (!profile) {
                setView('AUTH');
            } else {
                const primaryAddress = profile.addresses?.[0];
                const hasPhone = profile.phone || primaryAddress?.phone;
                const hasAddressFields = primaryAddress?.address && primaryAddress?.city && primaryAddress?.state && primaryAddress?.pinCode;
                
                if (!hasPhone || !hasAddressFields) {
                    setView('EDIT_ADDRESS');
                } else {
                    setView('OVERVIEW');
                }
            }
        } else {
            setAuthStep('email');
            setEmail('');
            setOtp('');
            setAuthError('');
        }
    }, [isCheckoutOpen, profile]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/user/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await res.json();
            if (res.ok) {
                setAuthStep('otp');
            } else {
                setAuthError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setAuthError('Something went wrong. Please try again.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/user/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.user));
                await refreshProfile();
            } else {
                setAuthError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setAuthError('Verification failed. Please try again.');
        } finally {
            setAuthLoading(false);
        }
    };

    const primaryAddress = profile?.addresses?.[0];

    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setFormData(prev => ({ ...prev, pinCode: value }));

        if (value.length === 6) {
            const details = await fetchPincodeDetails(value);
            if (details.isValid) {
                setFormData(prev => ({
                    ...prev,
                    city: details.city || '',
                    state: details.state || ''
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    city: '',
                    state: ''
                }));
            }
        }
    };

    const handleSaveAddress = async () => {
        if (!formData.phone || !formData.address || !formData.city || !formData.state || !formData.pinCode || !formData.fullName) {
            alert('Please provide your name, phone, and complete delivery details.');
            return;
        }

        setSaving(true);
        try {
            const parts = formData.fullName.trim().split(' ');
            const firstName = parts[0];
            const lastName = parts.slice(1).join(' ');

            const payload = {
                ...formData,
                firstName,
                lastName
            };

            const headers = await getAuthorizedHeaders({ 'Content-Type': 'application/json' });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/checkout-profile`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                await refreshProfile();
                setView('OVERVIEW');
            } else {
                alert(data.message || 'Failed to save address. Please check your details.');
            }
        } catch (error) {
            console.error("Save failed", error);
            alert('An error occurred while saving. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Load Razorpay checkout script dynamically (only once)
    useEffect(() => {
        if (typeof window !== 'undefined' && !(window as any).Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handlePlaceOrder = async () => {
        setPlacingOrder(true);
        try {
            const headers = await getAuthorizedHeaders({ 'Content-Type': 'application/json' });
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            
            const payload = {
                orderItems: cart.map(item => ({
                    productId: isNaN(Number(item.id)) ? item.id : Number(item.id),
                    quantity: item.quantity,
                    price: item.price
                })),
                totalPrice: cartTotal,
                customerName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || formData.fullName,
                customerPhone: profile?.phone || profile?.addresses?.[0]?.phone || formData.phone,
                customerEmail: profile?.email || email,
                shippingAddress: profile?.addresses?.[0]?.address 
                    ? `${profile.addresses[0].address}${profile.addresses[0].apartment ? ', ' + profile.addresses[0].apartment : ''}`
                    : `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}`,
                shippingCity: profile?.addresses?.[0]?.city || formData.city,
                shippingState: profile?.addresses?.[0]?.state || formData.state,
                shippingZip: profile?.addresses?.[0]?.pinCode || formData.pinCode,
            };

            // ── UPI / Online payment via Razorpay (TEST MODE) ───────────────
            if (paymentMethod === 'UPI') {
                const createRes = await fetch(`${BASE_URL}/api/payments/razorpay/create-order`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload),
                });

                const createData = await createRes.json();
                if (!createRes.ok) throw new Error(createData.message || 'Failed to initiate payment');

                const handlePaymentFailure = async (orderId: number) => {
                    try {
                        await fetch(`${BASE_URL}/api/payments/razorpay/fail`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({ orderId }),
                        });
                    } catch (err) {
                        console.error('Error marking payment as failed:', err);
                    }
                };

                const rzpOptions = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || createData.razorpayKey,
                    amount: createData.amount,
                    currency: createData.currency || 'INR',
                    name: 'SHWETA Jewellery',
                    description: 'Order Payment',
                    order_id: createData.razorpayOrderId,
                    prefill: {
                        name: payload.customerName,
                        email: payload.customerEmail,
                        contact: payload.customerPhone,
                    },
                    theme: { color: '#9b7a43' },
                    handler: async function (response: {
                        razorpay_payment_id: string;
                        razorpay_order_id: string;
                        razorpay_signature: string;
                    }) {
                        try {
                            const verifyRes = await fetch(`${BASE_URL}/api/payments/razorpay/verify`, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({
                                    orderId: createData.orderId,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                }),
                            });

                            const verifyData = await verifyRes.json();
                            if (verifyRes.ok && verifyData.success) {
                                alert(`Order Placed Successfully via UPI! Your Order ID is #${createData.orderId}`);
                                clearCart();
                                closeCheckout();
                            } else {
                                alert(verifyData.message || 'Payment verification failed. Please contact support.');
                            }
                        } catch {
                            alert('Payment verification failed. Please contact support.');
                        } finally {
                            setPlacingOrder(false);
                        }
                    },
                    modal: {
                        ondismiss: async () => {
                            setPlacingOrder(false);
                            await handlePaymentFailure(createData.orderId);
                        },
                    },
                };

                const rzp = new (window as any).Razorpay(rzpOptions);
                rzp.on('payment.failed', async (response: any) => {
                    setPlacingOrder(false);
                    await handlePaymentFailure(createData.orderId);
                    alert(response?.error?.description || 'Payment failed. Please try again.');
                });
                rzp.open();
                return;
            }

            // ── Cash on Delivery ─────────────────────────────────────────────
            const codRes = await fetch(`${BASE_URL}/api/payments/cod/create-order`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            const codData = await codRes.json();
            if (!codRes.ok) throw new Error(codData.message || 'Failed to place order');

            alert(`Order Placed Successfully via COD! Your Order ID is #${codData.orderId}`);
            clearCart();
            closeCheckout();

        } catch (error: any) {
            console.error("Error placing order:", error);
            alert(error.message || 'An error occurred while placing the order. Please try again.');
        } finally {
            if (paymentMethod === 'COD') {
                setPlacingOrder(false);
            }
        }
    };

    if (!isCheckoutOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeCheckout}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-[500px] max-h-[90vh] bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden mx-4"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => {
                                    if (view === 'EDIT_ADDRESS') {
                                        const primaryAddress = profile?.addresses?.[0];
                                        const hasPhone = profile?.phone || primaryAddress?.phone;
                                        const hasAddressFields = primaryAddress?.address && primaryAddress?.city && primaryAddress?.state && primaryAddress?.pinCode;
                                        const isAddressComplete = !!(hasPhone && hasAddressFields);

                                        if (isAddressComplete) {
                                            setView('OVERVIEW');
                                        } else {
                                            closeCheckout();
                                        }
                                    } else {
                                        closeCheckout();
                                    }
                                }} 
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-charcoal" />
                            </button>
                            <span className="text-xl font-outfit font-bold text-charcoal">
                                {view === 'AUTH' ? 'Sign In' : view === 'EDIT_ADDRESS' ? 'Edit Address' : 'SHWETA'}
                            </span>
                        </div>
                        {view === 'OVERVIEW' && (
                            <div className="text-right">
                                <div className="text-xs text-gray-400 uppercase tracking-widest">{cartCount} {cartCount === 1 ? 'item' : 'items'}</div>
                                <div className="text-lg font-bold text-charcoal font-outfit font-semibold">₹{cartTotal.toFixed(2)}</div>
                            </div>
                        )}
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50/30">
                        {view === 'AUTH' ? (
                            <div className="p-8 font-outfit flex flex-col justify-center h-full min-h-[400px]">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-outfit text-charcoal mb-2">
                                        {authStep === 'email' ? 'Welcome' : 'Verify Identity'}
                                    </h3>
                                    <p className="text-charcoal/50 text-[14px] italic font-outfit">
                                        {authStep === 'email' 
                                            ? 'Sign in to proceed to checkout.' 
                                            : `We've sent a 6-digit code to ${email}`}
                                    </p>
                                </div>

                                {authError && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-outfit font-semibold text-center">
                                        {authError}
                                    </div>
                                )}

                                {authStep === 'email' ? (
                                    <form onSubmit={handleSendOtp} className="space-y-8">
                                        <div className="relative">
                                            <label className="block text-[10px] font-outfit font-semibold font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-3 ml-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="your@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full border-b border-gray-200 py-4 pl-8 font-outfit font-semibold text-charcoal focus:outline-none focus:border-gold transition-colors bg-transparent placeholder:text-charcoal/20"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={authLoading}
                                            className="w-full bg-black text-white h-14 rounded-full flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                <>
                                                    <span className="font-bold uppercase tracking-widest text-xs">Continue</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleVerifyOtp} className="space-y-8">
                                        <div>
                                            <label className="block text-[10px] font-outfit font-semibold font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-3 ml-1">Enter 6-Digit Code</label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                className="w-full border-b-2 border-gray-100 py-4 text-center text-3xl font-outfit tracking-[0.5em] text-charcoal focus:outline-none focus:border-gold transition-colors bg-transparent placeholder:text-charcoal/10"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <button 
                                                type="submit" 
                                                disabled={authLoading}
                                                className="w-full bg-black text-white h-14 rounded-full flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                    <>
                                                        <span className="font-bold uppercase tracking-widest text-xs">Verify & Sign In</span>
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setAuthStep('email')}
                                                className="w-full text-xs font-outfit font-semibold uppercase tracking-widest text-charcoal/40 hover:text-gold transition-colors"
                                            >
                                                Change Email
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ) : view === 'OVERVIEW' ? (
                            <div className="p-6 space-y-6">
                                {/* Order Summary Section */}
                                <section>
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 font-outfit">Order Overview</h3>
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                                                    <ShoppingCart className="w-5 h-5 text-gold" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-charcoal font-outfit text-sm">Order Summary</h4>
                                                    <p className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-0.5">₹150 saved so far</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-2">
                                                <div>
                                                    <div className="text-[10px] text-gray-400 font-outfit font-semibold">{cartCount} {cartCount === 1 ? 'item' : 'items'}</div>
                                                    <div className="text-sm font-bold text-charcoal font-outfit font-semibold">₹{cartTotal.toFixed(2)}</div>
                                                </div>
                                                <button onClick={() => setShowItems(!showItems)} className="p-1 hover:bg-gray-50 rounded-lg transition-colors">
                                                    {showItems ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {showItems && (
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                className="px-4 pb-4 space-y-3"
                                            >
                                                <div className="h-px bg-gray-50 mb-3"></div>
                                                {cart.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-3">
                                                        <img src={item.image} className="w-10 h-10 object-cover rounded-lg border border-gray-100" alt={item.name} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-charcoal truncate font-outfit font-semibold">{item.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-outfit font-semibold">Qty: {item.quantity}</p>
                                                        </div>
                                                        <div className="text-xs font-bold text-charcoal font-outfit font-semibold">₹{(item.price * item.quantity).toFixed(2)}</div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                </section>

                                {/* Delivery Details */}
                                <section>
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 font-outfit">Delivery Details</h3>
                                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative group">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
                                                <MapPin className="w-5 h-5 text-gold" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-charcoal font-outfit font-semibold">Deliver To {profile?.firstName || 'Guest'}</h4>
                                                    <button onClick={() => setView('EDIT_ADDRESS')} className="text-[11px] font-bold text-gold uppercase tracking-wider hover:underline">Change</button>
                                                </div>
                                                <p className="text-sm text-gray-500 leading-relaxed font-outfit line-clamp-2">
                                                    {primaryAddress ? (
                                                        `${primaryAddress.address}, ${primaryAddress.apartment ? primaryAddress.apartment + ', ' : ''}${primaryAddress.city}, ${primaryAddress.state}, ${primaryAddress.pinCode}`
                                                    ) : 'Please add a delivery address to proceed.'}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400 font-outfit font-semibold">
                                                    <span>{profile?.phone || primaryAddress?.phone || 'No phone'}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="truncate">{profile?.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium text-charcoal font-outfit font-semibold">Free Shipping</div>
                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Free</span>
                                        </div>
                                        <div className="text-sm font-bold text-gray-300 line-through font-outfit font-semibold">₹80</div>
                                    </div>
                                </section>

                                {/* Offers & Rewards */}
                                <section>
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 font-outfit">Offers & Rewards</h3>
                                    <div className="bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3 p-3">
                                            <Ticket className="w-5 h-5 text-gray-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Enter coupon code" 
                                                className="flex-1 text-sm outline-none font-outfit font-semibold bg-transparent"
                                            />
                                            <button className="text-xs font-bold text-charcoal uppercase tracking-widest px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors">Apply</button>
                                        </div>
                                    </div>
                                </section>

                                {/* Payment Options */}
                                <section className="pb-6">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 font-outfit">Payment Options</h3>
                                    <div className="space-y-3">
                                        {/* UPI */}
                                        <div 
                                            className={`rounded-2xl border ${paymentMethod === 'UPI' ? 'border-charcoal bg-gray-50/50' : 'border-gray-100 bg-white'} shadow-sm overflow-hidden transition-colors cursor-pointer`}
                                            onClick={() => setPaymentMethod('UPI')}
                                        >
                                            <div className="p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'UPI' ? 'border-charcoal' : 'border-gray-300'}`}>
                                                        {paymentMethod === 'UPI' && <div className="w-2.5 h-2.5 bg-charcoal rounded-full" />}
                                                    </div>
                                                    <span className="font-bold text-charcoal font-outfit font-semibold">UPI</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-charcoal font-outfit font-semibold">₹{cartTotal.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cash on Delivery */}
                                        <div 
                                            className={`rounded-2xl p-5 border ${paymentMethod === 'COD' ? 'border-amber-600 bg-amber-50/30' : 'border-gray-100 bg-white'} shadow-sm flex items-center justify-between cursor-pointer transition-colors`}
                                            onClick={() => setPaymentMethod('COD')}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'COD' ? 'border-amber-600' : 'border-gray-300'}`}>
                                                    {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-amber-600 rounded-full" />}
                                                </div>
                                                <span className="font-bold text-charcoal font-outfit font-semibold">Cash on Delivery</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-bold text-charcoal font-outfit font-semibold">₹{cartTotal.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="pt-2">
                                    <button 
                                        className="w-full bg-black text-white h-14 rounded-xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                                        onClick={handlePlaceOrder}
                                        disabled={placingOrder || cart.length === 0}
                                    >
                                        {placingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <span className="font-bold uppercase tracking-widest text-xs">Place Order • ₹{cartTotal.toFixed(2)}</span>
                                                <CheckCircle2 className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Pincode *</label>
                                        <input 
                                            type="text" 
                                            value={formData.pinCode}
                                            onChange={handlePincodeChange}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-outfit font-semibold focus:outline-none focus:border-gold transition-colors"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">City *</label>
                                            <input 
                                                type="text" 
                                                value={formData.city}
                                                readOnly
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-outfit font-semibold text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">State *</label>
                                            <input 
                                                type="text" 
                                                value={formData.state}
                                                readOnly
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-outfit font-semibold text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Flat, House no. *</label>
                                        <input 
                                            type="text" 
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-outfit font-semibold focus:outline-none focus:border-gold transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Apartment, Area, Sector, Village *</label>
                                        <input 
                                            type="text" 
                                            value={formData.apartment}
                                            onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-outfit font-semibold focus:outline-none focus:border-gold transition-colors"
                                        />
                                    </div>
                                    
                                    <div className="pt-2">
                                        <h4 className="text-[11px] font-bold text-charcoal uppercase tracking-widest mb-4 font-outfit">Customer Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Full Name *</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-outfit font-semibold focus:outline-none focus:border-gold transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Phone Number *</label>
                                                <input 
                                                    type="tel" 
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-outfit font-semibold focus:outline-none focus:border-gold transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Email Address *</label>
                                                <input 
                                                    type="email" 
                                                    value={profile?.email || ''}
                                                    readOnly
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-outfit font-semibold text-gray-400"
                                                />
                                                <p className="text-[10px] text-amber-600 mt-2 font-outfit font-semibold">You&apos;re already logged in. Changing email is not allowed during checkout.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 ml-1">Save Address As</label>
                                        <div className="flex gap-3">
                                            {['Home', 'Work'].map((type) => (
                                                <button 
                                                    key={type}
                                                    onClick={() => setFormData({...formData, addressType: type})}
                                                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-outfit font-semibold transition-all flex items-center justify-center gap-2 ${formData.addressType === type ? 'border-charcoal bg-charcoal text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-gold'}`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full border ${formData.addressType === type ? 'border-white bg-gold' : 'border-gray-300'}`}></div>
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleSaveAddress}
                                    disabled={saving}
                                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest mt-4 transition-all shadow-lg font-outfit font-semibold ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:scale-[1.02] active:scale-[0.98]'}`}
                                >
                                    {saving ? 'Saving...' : 'Continue'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
