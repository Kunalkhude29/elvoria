'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
    ArrowLeft, 
    CreditCard, 
    Truck, 
    ShieldCheck, 
    CheckCircle2, 
    AlertCircle,
    Loader2
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function CheckoutSummaryPage() {
    const router = useRouter();
    const { cart, cartTotal, clearCart, isLoaded } = useCart();
    const { profile, loading: authLoading } = useAuth();
    
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');

    const primaryAddress = profile?.addresses?.[0];

    useEffect(() => {
        if (!authLoading && isLoaded) {
            if (!profile) {
                router.push('/login?redirect=/checkout/summary');
            } else if (!profile.phone || !primaryAddress?.address) {
                router.push('/checkout');
            }
        }
    }, [profile, authLoading, isLoaded, primaryAddress, router]);

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
        setIsPlacingOrder(true);
        setError('');

        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });

            const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

            const orderPayload = {
                customerName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || profile?.email,
                customerPhone: profile?.phone || primaryAddress?.phone,
                customerEmail: profile?.email,
                shippingAddress: primaryAddress?.address,
                shippingCity: primaryAddress?.city,
                shippingState: primaryAddress?.state,
                shippingZip: primaryAddress?.pinCode,
                orderItems: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                totalPrice: cartTotal,
            };

            // ── UPI / Online payment via Razorpay (TEST MODE) ───────────────
            if (paymentMethod === 'razorpay') {
                // 1. Create Razorpay order on backend
                const createRes = await fetch(`${BASE_URL}/api/payments/razorpay/create-order`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(orderPayload),
                });

                const createData = await createRes.json();
                if (!createRes.ok) throw new Error(createData.message || 'Failed to initiate payment');

                // 2. Open Razorpay checkout
                const rzpOptions = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || createData.razorpayKey,
                    amount: createData.amount,
                    currency: createData.currency || 'INR',
                    name: 'SHWETA Jewellery',
                    description: 'Order Payment',
                    order_id: createData.razorpayOrderId,
                    prefill: {
                        name: orderPayload.customerName,
                        email: orderPayload.customerEmail,
                        contact: orderPayload.customerPhone,
                    },
                    theme: { color: '#9b7a43' },
                    handler: async function (response: {
                        razorpay_payment_id: string;
                        razorpay_order_id: string;
                        razorpay_signature: string;
                    }) {
                        try {
                            // 3. Verify payment signature on backend
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
                                setOrderId(String(createData.orderId));
                                clearCart();
                                setOrderSuccess(true);
                            } else {
                                setError(verifyData.message || 'Payment verification failed. Please contact support.');
                            }
                        } catch {
                            setError('Payment verification failed. Please contact support.');
                        } finally {
                            setIsPlacingOrder(false);
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            setIsPlacingOrder(false);
                            setError('Payment was cancelled. Please try again.');
                        },
                    },
                };

                const rzp = new (window as any).Razorpay(rzpOptions);
                rzp.on('payment.failed', (response: any) => {
                    setIsPlacingOrder(false);
                    setError(response?.error?.description || 'Payment failed. Please try again.');
                });
                rzp.open();
                // Razorpay returns early; handler / modal callbacks reset isPlacingOrder
                return;
            }

            // ── Cash on Delivery ─────────────────────────────────────────────
            const codRes = await fetch(`${BASE_URL}/api/payments/cod/create-order`, {
                method: 'POST',
                headers,
                body: JSON.stringify(orderPayload),
            });

            const codData = await codRes.json();
            if (!codRes.ok) throw new Error(codData.message || 'Failed to place order');

            setOrderId(String(codData.orderId));
            clearCart();
            setOrderSuccess(true);

        } catch (err: any) {
            setError(err.message || 'Something went wrong while placing your order.');
        } finally {
            // Reached for COD success/failure and all error paths.
            // Razorpay (UPI) returns early above — its callbacks reset the flag.
            setIsPlacingOrder(false);
        }
    };


    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="main-container pt-32 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-8">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-4xl font-outfit text-charcoal mb-4">Order Placed Successfully!</h1>
                    <p className="text-lg text-charcoal/60 font-outfit mb-8">
                        Thank you for choosing SHWETA. Your order ID is <span className="font-dm-mono font-bold text-charcoal">#{orderId}</span>.<br />
                        We've sent a confirmation email with all the details.
                    </p>
                    <Link href="/" className="btn-primary">Continue Shopping</Link>
                </div>
            </div>
        );
    }

    if (!isLoaded || authLoading || !profile || !primaryAddress) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
                    <p className="text-charcoal/60 font-outfit font-semibold">Preparing your summary...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfaf7] pb-20">
            <Navbar />
            <div className="main-container pt-32">
                <div className="mb-8">
                    <button 
                        onClick={() => router.push('/checkout')}
                        className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors font-outfit font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Delivery Details
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12">
                    {/* Left side: Review & Payment */}
                    <div className="space-y-8">
                        {/* Review Section */}
                        <section className="bg-white p-8 rounded-[30px] border border-[#e7decf] shadow-sm">
                            <h2 className="text-2xl font-outfit text-charcoal mb-8">Review Order</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 font-bold">Shipping To</p>
                                    <p className="font-outfit font-semibold text-charcoal">{profile.firstName} {profile.lastName}</p>
                                    <p className="text-sm text-charcoal/60 font-outfit leading-relaxed">
                                        {primaryAddress.address}, {primaryAddress.apartment && `${primaryAddress.apartment}, `}
                                        {primaryAddress.city}, {primaryAddress.state} - {primaryAddress.pinCode}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 font-bold">Contact Info</p>
                                    <p className="font-outfit font-semibold text-charcoal">{profile.phone}</p>
                                    <p className="text-sm text-charcoal/60 font-outfit">{profile.email}</p>
                                </div>
                            </div>
                        </section>

                        {/* Payment Selection */}
                        <section className="bg-white p-8 rounded-[30px] border border-[#e7decf] shadow-sm">
                            <h2 className="text-2xl font-outfit text-charcoal mb-8">Payment Method</h2>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <button 
                                    onClick={() => setPaymentMethod('razorpay')}
                                    className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${paymentMethod === 'razorpay' ? 'border-gold bg-[#fcf9f2] ring-1 ring-gold' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'razorpay' ? 'bg-gold text-white' : 'bg-gray-50 text-charcoal/40'}`}>
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-outfit font-semibold font-bold text-charcoal">Online Payment</p>
                                            <p className="text-xs text-charcoal/40 font-outfit">Cards, Netbanking, UPI, Wallets</p>
                                        </div>
                                    </div>
                                    {paymentMethod === 'razorpay' && <CheckCircle2 className="w-6 h-6 text-gold" />}
                                </button>

                                <button 
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${paymentMethod === 'cod' ? 'border-gold bg-[#fcf9f2] ring-1 ring-gold' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-gold text-white' : 'bg-gray-50 text-charcoal/40'}`}>
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-outfit font-semibold font-bold text-charcoal">Cash on Delivery</p>
                                            <p className="text-xs text-charcoal/40 font-outfit">Pay when you receive your order</p>
                                        </div>
                                    </div>
                                    {paymentMethod === 'cod' && <CheckCircle2 className="w-6 h-6 text-gold" />}
                                </button>
                            </div>

                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-charcoal/40 uppercase tracking-widest font-bold">
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    SSL Secured Checkout
                                </div>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder}
                                    className="btn-primary min-w-[240px] h-14 rounded-full flex items-center justify-center gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isPlacingOrder ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Place Order</span>
                                            <CheckCircle2 className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right side: Cart Summary */}
                    <aside className="space-y-6">
                        <div className="bg-white p-8 rounded-[30px] border border-[#e7decf] shadow-sm sticky top-32">
                            <h3 className="text-xl font-outfit text-charcoal mb-6">Order Summary</h3>
                            
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-8">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-16 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-outfit font-bold text-charcoal text-sm leading-tight">{item.name}</p>
                                            <p className="text-xs text-charcoal/40 font-outfit font-semibold mt-1">Qty: {item.quantity}</p>
                                            <p className="text-sm font-outfit font-semibold font-bold text-charcoal mt-1">₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-t border-gray-100 pt-6">
                                <div className="flex justify-between text-sm text-charcoal/60 font-outfit">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-sm text-charcoal/60 font-outfit">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-bold uppercase tracking-wider text-[10px]">Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-outfit font-semibold font-bold text-charcoal pt-4 border-t border-dashed border-gray-200">
                                    <span>Total Payable</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
