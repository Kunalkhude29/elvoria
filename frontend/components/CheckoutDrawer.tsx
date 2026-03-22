'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, CheckCircle2, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { useCart } from '../context/CartContext';
import Image from 'next/image';

type CheckoutStep = 'login' | 'otp' | 'address' | 'payment' | 'confirm';

export default function CheckoutDrawer() {
    const { isCheckoutOpen, closeCheckout } = useCheckout();
    const { cartTotal, cart, clearCart } = useCart();

    const [step, setStep] = useState<CheckoutStep>('login');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    // Shipping State
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingCity, setShippingCity] = useState('');
    const [shippingState, setShippingState] = useState('');
    const [shippingZip, setShippingZip] = useState('');

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isCheckoutOpen) {
            document.body.style.overflow = 'hidden';
            // Reset to first step every time checkout opens
            setStep('login');
            setCheckoutError('');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isCheckoutOpen]);

    // Handle OTP Input
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow 1 char
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-advance to next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleBack = () => {
        setCheckoutError('');
        if (step === 'otp') setStep('login');
        else if (step === 'address') setStep('otp');
        else if (step === 'payment') setStep('address');
        else if (step === 'confirm') setStep('payment');
    };

    const codCharge = 99;
    const finalTotal = paymentMethod === 'cod' ? cartTotal + codCharge : cartTotal;

    const handlePlaceOrder = async () => {
        setIsPlacingOrder(true);
        setCheckoutError('');
        try {
            const orderItems = cart.map(item => ({
                productId: parseInt(item.id),
                quantity: item.quantity,
                price: item.price
            }));

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderItems,
                    totalPrice: finalTotal,
                    customerPhone: mobileNumber,
                    customerName,
                    customerEmail,
                    shippingAddress,
                    shippingCity,
                    shippingState,
                    shippingZip
                })
            });

            if (response.ok) {
                clearCart();
                setStep('confirm');
            } else {
                const errorData = await response.json();
                console.error("Order failed:", errorData);
                setCheckoutError(errorData.message || "Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            setCheckoutError("An error occurred during checkout. Check your connection.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <AnimatePresence>
            {isCheckoutOpen && (
                <>
                    {/* Dark Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/60 z-[80]"
                        onClick={closeCheckout}
                    />

                    {/* Checkout Full-Page panel */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full sm:w-[500px] h-full bg-gray-50 z-[90] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center px-4 py-4 border-b border-gray-200 bg-white z-10 sticky top-0">
                            <div className="w-12">
                                {step !== 'login' && step !== 'confirm' && (
                                    <button onClick={handleBack} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                        <ArrowLeft className="w-5 h-5 text-charcoal" />
                                    </button>
                                )}
                            </div>
                            <h1 className="text-xl font-serif text-charcoal tracking-wide flex-1 text-center">ELVORIA</h1>
                            <div className="w-12 flex justify-end">
                                <button onClick={closeCheckout} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-charcoal cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Scrolling Content Area */}
                        <div className="flex-1 overflow-y-auto px-4 py-6 relative no-scrollbar bg-gray-50">

                            {/* Order Summary Card */}
                            {step !== 'confirm' && (
                                <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100 flex justify-between items-center text-sm">
                                    <span className="font-medium text-charcoal">Order summary ({cart.length} Item{cart.length !== 1 && 's'})</span>
                                    <span className="font-medium text-charcoal">${cartTotal.toFixed(2)}</span>
                                </div>
                            )}

                            {/* --- STEP 1: LOGIN --- */}
                            {step === 'login' && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-serif text-charcoal mb-2">Welcome Back</h2>
                                        <p className="text-sm text-charcoal/60">Enter your mobile number to continue</p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-medium uppercase tracking-widest text-charcoal/80 block">Mobile Number</label>
                                        <div className="flex border border-gray-300 focus-within:border-charcoal transition-colors">
                                            <div className="px-4 py-3 bg-gray-50 border-r border-gray-300 text-charcoal font-medium flex items-center">
                                                +91
                                            </div>
                                            <input
                                                type="tel"
                                                placeholder="10-digit mobile number"
                                                className="flex-1 px-4 py-3 outline-none bg-transparent"
                                                value={mobileNumber}
                                                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => mobileNumber.length === 10 && setStep('otp')}
                                        disabled={mobileNumber.length !== 10}
                                        className="w-full btn-primary py-4 mt-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}

                            {/* --- STEP 2: OTP --- */}
                            {step === 'otp' && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-serif text-charcoal mb-2">Verify Phone</h2>
                                        <p className="text-sm text-charcoal/60">Enter OTP sent to <span className="font-medium text-charcoal">+91 {mobileNumber}</span></p>
                                    </div>

                                    <div className="flex justify-center space-x-4">
                                        {[0, 1, 2, 3].map((index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                maxLength={1}
                                                className="w-14 h-14 border border-gray-300 text-center text-xl font-medium focus:border-charcoal focus:ring-1 focus:ring-charcoal outline-none transition-all"
                                                value={otp[index]}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                            />
                                        ))}
                                    </div>

                                    <div className="text-center text-sm">
                                        <span className="text-charcoal/60">Didn't receive code? </span>
                                        <button className="text-charcoal font-medium underline hover:text-gold transition-colors">Resend OTP</button>
                                    </div>

                                    <button
                                        onClick={() => otp.every(v => v !== '') && setStep('address')}
                                        disabled={!otp.every(v => v !== '')}
                                        className="w-full btn-primary py-4 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Verify & Proceed
                                    </button>
                                </div>
                            )}

                            {/* --- STEP 3: ADDRESS --- */}
                            {step === 'address' && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-serif text-charcoal">Delivery Details</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            required
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal bg-stone-50"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            required
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal bg-stone-50"
                                        />
                                        <textarea
                                            placeholder="Street Address, Apt, Suite, etc."
                                            required
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                            rows={2}
                                            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal bg-stone-50 resize-none"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="City"
                                                required
                                                value={shippingCity}
                                                onChange={(e) => setShippingCity(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal bg-stone-50"
                                            />
                                            <input
                                                type="text"
                                                placeholder="State / Province"
                                                required
                                                value={shippingState}
                                                onChange={(e) => setShippingState(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal bg-stone-50"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="ZIP / Postal Code"
                                            required
                                            value={shippingZip}
                                            onChange={(e) => setShippingZip(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-charcoal bg-stone-50"
                                        />
                                    </div>

                                    <div className="bg-green-50 border border-green-100 p-4 flex items-center space-x-3 text-green-700 text-sm mt-4">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Free express shipping for you</span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (customerName && customerEmail && shippingAddress && shippingCity && shippingZip) {
                                                setStep('payment');
                                            } else {
                                                alert("Please fill out all address fields.");
                                            }
                                        }}
                                        className="w-full btn-primary py-4 mt-8"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            )}

                            {/* --- STEP 4: PAYMENT --- */}
                            {step === 'payment' && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-xl font-serif text-charcoal mb-6">Pay via</h2>

                                    <div className="space-y-4">
                                        {/* UPI */}
                                        <label className={`block border p-5 cursor-pointer transition-all duration-300 ${paymentMethod === 'upi' ? 'border-charcoal bg-stone-50 ring-1 ring-charcoal' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="upi"
                                                        checked={paymentMethod === 'upi'}
                                                        onChange={() => setPaymentMethod('upi')}
                                                        className="w-4 h-4 text-charcoal focus:ring-charcoal accent-charcoal"
                                                    />
                                                    <span className="font-medium text-charcoal">UPI Payment</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm line-through text-gray-400 mr-2">${(cartTotal + 50).toFixed(2)}</span>
                                                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {paymentMethod === 'upi' && (
                                                <div className="mt-6 pt-6 border-t border-gray-200 text-center animate-in fade-in slide-in-from-top-2">
                                                    <div className="bg-white p-4 inline-block border border-gray-200 shadow-sm mb-4">
                                                        <Image src="/images/hero.png" alt="QR Code Mock" width={150} height={150} className="opacity-20 grayscale" unoptimized />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <button className="bg-blue-500 text-white px-4 py-2 text-sm font-medium rounded shadow-md">Show QR</button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-charcoal/60">Scan the QR code & pay via any UPI app</p>
                                                    <div className="my-4 text-xs font-medium text-gray-400 uppercase tracking-widest flex items-center justify-center space-x-4">
                                                        <span className="h-px w-12 bg-gray-200"></span>
                                                        <span>OR</span>
                                                        <span className="h-px w-12 bg-gray-200"></span>
                                                    </div>
                                                    <div className="flex">
                                                        <input type="text" placeholder="example@okhdfcbank" className="flex-1 border border-gray-300 p-3 text-sm outline-none focus:border-charcoal" />
                                                        <button className="bg-gray-100 text-charcoal/50 px-6 text-sm font-medium border border-l-0 border-gray-300">Verify & pay</button>
                                                    </div>
                                                </div>
                                            )}
                                        </label>

                                        {/* CARD */}
                                        <label className={`block border p-5 cursor-pointer transition-all duration-300 ${paymentMethod === 'card' ? 'border-charcoal bg-stone-50 ring-1 ring-charcoal' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="card"
                                                        checked={paymentMethod === 'card'}
                                                        onChange={() => setPaymentMethod('card')}
                                                        className="w-4 h-4 text-charcoal accent-charcoal"
                                                    />
                                                    <div className="flex items-center space-x-2">
                                                        <CreditCard className="w-5 h-5 text-charcoal/60" />
                                                        <span className="font-medium text-charcoal">Credit/Debit Card</span>
                                                    </div>
                                                </div>
                                                <span className="font-medium">${cartTotal.toFixed(2)}</span>
                                            </div>
                                        </label>

                                        {/* COD */}
                                        <label className={`block border p-5 cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-charcoal bg-stone-50 ring-1 ring-charcoal' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value="cod"
                                                        checked={paymentMethod === 'cod'}
                                                        onChange={() => setPaymentMethod('cod')}
                                                        className="w-4 h-4 text-charcoal accent-charcoal"
                                                    />
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <Banknote className="w-5 h-5 text-charcoal/60" />
                                                            <span className="font-medium text-charcoal">Cash on Delivery</span>
                                                        </div>
                                                        <p className="text-xs text-red-500 mt-1 pl-7 ml-1">Inc. ${codCharge}.00 COD charges</p>
                                                    </div>
                                                </div>
                                                <span className="font-medium">${(cartTotal + codCharge).toFixed(2)}</span>
                                            </div>
                                        </label>
                                    </div>

                                    {checkoutError && (
                                        <div className="bg-red-50 text-red-600 p-4 text-sm font-medium border border-red-100 mt-4 rounded-md">
                                            {checkoutError}
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isPlacingOrder}
                                        className="w-full btn-primary py-4 mt-8 flex justify-between items-center px-6 disabled:opacity-50"
                                    >
                                        <span>{isPlacingOrder ? 'PROCESSING...' : 'BUY NOW'}</span>
                                        <span className="font-serif text-lg">${finalTotal.toFixed(2)}</span>
                                    </button>
                                </div>
                            )}

                            {/* --- STEP 5: CONFIRMATION --- */}
                            {step === 'confirm' && (
                                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 text-center py-12 mb-8">
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h2 className="text-3xl font-serif text-charcoal mb-4">Order Placed!</h2>
                                    <p className="text-charcoal/60 leading-relaxed max-w-[280px] mx-auto">
                                        Your order of <span className="font-medium text-charcoal">${finalTotal.toFixed(2)}</span> has been confirmed. You will receive an SMS tracking link shortly.
                                    </p>

                                    <div className="bg-stone-50 border border-gray-100 p-6 text-left mt-8">
                                        <p className="text-xs uppercase tracking-widest text-charcoal/50 font-medium mb-1">Order ID</p>
                                        <p className="font-medium text-charcoal">#ELV-{Math.floor(100000 + Math.random() * 900000)}</p>
                                    </div>

                                    <button
                                        onClick={closeCheckout}
                                        className="btn-secondary w-full py-4 mt-8"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            )}

                        </div>

                        {/* Footer Trust Badges */}
                        <div className="bg-gray-50 py-4 px-6 border-t border-gray-200 text-center text-[10px] text-charcoal/40 uppercase tracking-widest flex justify-center items-center space-x-6">
                            <div className="flex flex-col items-center gap-1"><ShieldCheck className="w-4 h-4" /><span>Secure</span></div>
                            <div className="flex flex-col items-center gap-1"><CreditCard className="w-4 h-4" /><span>PCI DSS</span></div>
                            <div className="flex flex-col items-center gap-1"><CheckCircle2 className="w-4 h-4" /><span>Verified</span></div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
