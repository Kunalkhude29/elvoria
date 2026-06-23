'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { Plus, Minus, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getAuthorizedHeaders } from '@/lib/auth';

const FAQItem = ({ question, children, isOpen, onClick }: { question: string, children: React.ReactNode, isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-b border-gray-200 py-6">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left focus:outline-none group"
            >
                <span className="text-sm font-outfit text-charcoal font-medium group-hover:text-gold transition-colors">{question}</span>
                <span className="text-charcoal/50 ml-4 flex-shrink-0">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}
            >
                <div className="text-sm font-outfit text-charcoal/70 leading-relaxed space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

function RequestForm({ type, orderId, paymentMethod }: { type: 'RETURN' | 'CANCEL', orderId: string, paymentMethod?: string }) {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const [bankAccountName, setBankAccountName] = useState('');
    const [bankName, setBankName] = useState('');
    const [bankAccountNumber, setBankAccountNumber] = useState('');
    const [confirmBankAccountNumber, setConfirmBankAccountNumber] = useState('');
    const [bankIfscCode, setBankIfscCode] = useState('');
    const [upiId, setUpiId] = useState('');

    const handleSubmit = async () => {
        setError('');
        if (reason.trim().length < 10) {
            setError('Please provide a more detailed reason (at least 10 characters).');
            return;
        }

        if (type === 'RETURN' && paymentMethod === 'COD') {
            if (!bankAccountName || !bankName || !bankAccountNumber || !confirmBankAccountNumber || !bankIfscCode) {
                setError('Please fill in all required bank details for your COD refund.');
                return;
            }
            if (bankAccountNumber !== confirmBankAccountNumber) {
                setError('Account numbers do not match.');
                return;
            }
        }

        setSubmitting(true);
        try {
            const headers = await getAuthorizedHeaders({ 'Content-Type': 'application/json' });
            
            const payload: any = { orderId: Number(orderId), type, reason };
            if (type === 'RETURN' && paymentMethod === 'COD') {
                payload.bankAccountName = bankAccountName;
                payload.bankName = bankName;
                payload.bankAccountNumber = bankAccountNumber;
                payload.bankIfscCode = bankIfscCode;
                payload.upiId = upiId;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/order-requests`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setSubmitted(true);
                setReason('');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to submit request. Please try again.');
            }
        } catch (e) {
            setError('A network error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="mt-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-outfit font-semibold text-green-800">Request Submitted Successfully!</p>
                    <p className="text-xs font-outfit text-green-700 mt-1">Our team will review your request and get back to you within 1-2 business days.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-3">
            <div>
                <label className="block text-xs font-outfit font-semibold uppercase tracking-wider text-charcoal/60 mb-2">
                    {type === 'RETURN' ? 'Reason for Return' : 'Reason for Cancellation'} <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder={type === 'RETURN'
                        ? "Please describe the issue with your order (e.g., received a damaged item, wrong product delivered...)"
                        : "Please let us know why you want to cancel this order..."
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-outfit text-charcoal focus:outline-none focus:border-charcoal resize-none transition-colors placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-400 font-outfit mt-1">{reason.length} characters (minimum 10 required)</p>
            </div>

            {type === 'RETURN' && paymentMethod === 'COD' && (
                <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
                    <h4 className="text-sm font-outfit font-bold text-charcoal">Refund Details</h4>
                    <p className="text-xs text-gray-500 font-outfit">Please provide your bank details where we should transfer your refund.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-outfit font-semibold uppercase tracking-wider text-charcoal/60 mb-2">Account Holder Name <span className="text-red-500">*</span></label>
                            <input type="text" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-outfit text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-outfit font-semibold uppercase tracking-wider text-charcoal/60 mb-2">Bank Name <span className="text-red-500">*</span></label>
                            <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-outfit text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-outfit font-semibold uppercase tracking-wider text-charcoal/60 mb-2">Account Number <span className="text-red-500">*</span></label>
                            <input type="password" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-outfit text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-outfit font-semibold uppercase tracking-wider text-charcoal/60 mb-2">Confirm Account Number <span className="text-red-500">*</span></label>
                            <input type="text" value={confirmBankAccountNumber} onChange={(e) => setConfirmBankAccountNumber(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-outfit text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-outfit font-semibold uppercase tracking-wider text-charcoal/60 mb-2">IFSC Code <span className="text-red-500">*</span></label>
                            <input type="text" value={bankIfscCode} onChange={(e) => setBankIfscCode(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-outfit text-charcoal focus:outline-none focus:border-charcoal transition-colors uppercase" />
                        </div>
                        <div>
                            <label className="block text-xs font-outfit font-semibold uppercase tracking-wider text-charcoal/60 mb-2">UPI ID (Optional)</label>
                            <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-outfit text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-600 font-outfit">{error}</p>
            )}
            <button
                onClick={handleSubmit}
                disabled={submitting || reason.trim().length < 10}
                className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-outfit font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting...' : `Submit ${type === 'RETURN' ? 'Return' : 'Cancel'} Request`}
            </button>
        </div>
    );
}

export default function OrderHelpPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const headers = await getAuthorizedHeaders();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/orders/myorders/${orderId}`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                }
            } catch (error) {
                console.error("Failed to fetch order", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const toggleAccordion = (index: number) => {
        if (openIndex === index) {
            setOpenIndex(null);
        } else {
            setOpenIndex(index);
        }
    };

    const isReturnWindowValid = () => {
        if (!order || !order.deliveredAt) return true; // Fallback if deliveredAt is not set
        const daysSinceDelivery = (new Date().getTime() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceDelivery <= 7;
    };

    const sections = [
        {
            title: "CUSTOMER CARE",
            items: [
                {
                    question: "How can I contact SHWETA Jewellery support?",
                    content: (
                        <>
                            <p>Our customer care team is available to help you with any queries related to your order <strong>#{orderId}</strong>.</p>
                            <p>You can reach us by phone at the following numbers:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>+91 9156104740</li>
                                <li>+91 9209674740</li>
                                <li>+91 7249564740</li>
                            </ul>
                            <p className="mt-4">Available Monday to Saturday between 11 AM and 6 PM.</p>
                        </>
                    )
                },
                {
                    question: "What information should I keep ready when I call?",
                    content: (
                        <>
                            <p>Please keep the following details ready before calling us:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Your Order Number: <strong>#{orderId}</strong></li>
                                <li>Your registered email address or phone number</li>
                                <li>A brief description of your concern</li>
                            </ul>
                            <p className="mt-4">This will help us resolve your issue faster.</p>
                        </>
                    )
                }
            ]
        },
        {
            title: "RETURN ORDER",
            items: [
                {
                    question: "How do I request a return for my order?",
                    content: (
                        <>
                            <p>Returns are accepted only if you have received a <strong>damaged or incorrect product</strong>.</p>
                            <p className="mt-2">Please fill in the form below to submit your return request for order <strong>#{orderId}</strong>. Our team will review it and reach out to you within 1-2 business days.</p>
                            <p className="mt-2 font-medium text-charcoal">Note: An unboxing video is mandatory proof for any return request.</p>
                            {!loading && order && order.status === 'DELIVERED' && isReturnWindowValid() ? (
                                <RequestForm type="RETURN" orderId={orderId} paymentMethod={order.paymentMethod} />
                            ) : !loading && order && order.status === 'DELIVERED' && !isReturnWindowValid() ? (
                                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-outfit">
                                    Returns can only be requested within 7 days of delivery. This order has passed the return window.
                                </div>
                            ) : !loading && order ? (
                                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-outfit">
                                    Returns can only be requested for orders that have been delivered. This order is currently <strong>{order.status}</strong>.
                                </div>
                            ) : null}
                        </>
                    )
                },
                {
                    question: "What is required for a valid return?",
                    content: (
                        <>
                            <p>An <strong>unboxing video</strong> is mandatory and is the only valid proof accepted for returns or replacements.</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>The product must be unused and in its original packaging.</li>
                                <li>All tags and accessories must be intact.</li>
                                <li>Returns must be requested within 48 hours of delivery.</li>
                            </ul>
                            <p className="mt-4 font-medium text-charcoal">Note: We do not accept return requests via Instagram DMs.</p>
                        </>
                    )
                },
                {
                    question: "Can I exchange my order for a different size?",
                    content: (
                        <p>Yes, we offer exchanges for size issues within <strong>7 days of delivery</strong>. Please ensure the product is unused and in its original packaging with all tags intact. Contact our customer care team to initiate the exchange.</p>
                    )
                }
            ]
        },
        {
            title: "CANCEL ORDER",
            items: [
                {
                    question: "Can I cancel my order?",
                    content: (
                        <>
                            <p>Orders, once placed, <strong>cannot be cancelled</strong> as they are processed immediately to ensure timely delivery.</p>
                            <p className="mt-2">However, if you placed a COD order and wish to cancel before it is shipped, you can submit a request below for order <strong>#{orderId}</strong> and our team will try their best to accommodate it.</p>
                            {!loading && order && (order.status === 'DELIVERED' || order.status === 'CANCELLED') ? (
                                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-outfit">
                                    This order can no longer be cancelled.
                                </div>
                            ) : !loading && order ? (
                                <RequestForm type="CANCEL" orderId={orderId} />
                            ) : null}
                        </>
                    )
                },
                {
                    question: "What happens if I refuse delivery for a COD order?",
                    content: (
                        <>
                            <p>If you refuse to accept a COD delivery, the package will be returned to us (RTO). Please note:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>The forward and return shipping charges will be deducted from any future refund.</li>
                                <li>Repeated refusals may result in COD being unavailable for your account.</li>
                            </ul>
                            <p className="mt-4">We recommend contacting us before refusing delivery so we can resolve any concerns.</p>
                        </>
                    )
                }
            ]
        }
    ];

    let globalItemIndex = 0;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 md:py-24">
                {/* Back button */}
                <div className="mb-10">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-outfit text-charcoal/60 hover:text-charcoal transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </button>
                </div>

                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-2xl font-outfit font-bold text-charcoal tracking-tight">Order Help</h1>
                    <p className="mt-2 text-sm font-outfit text-charcoal/60">
                        Need help with order <span className="font-semibold text-charcoal">#{orderId}</span>? We are here to assist you.
                    </p>
                </div>

                <div className="space-y-16">
                    {sections.map((section, sectionIdx) => (
                        <div key={sectionIdx}>
                            <h2 className="text-sm font-outfit font-bold tracking-[0.15em] text-charcoal uppercase mb-6">
                                {section.title}
                            </h2>
                            <div className="border-t border-gray-200">
                                {section.items.map((item) => {
                                    const currentIndex = globalItemIndex++;
                                    return (
                                        <FAQItem
                                            key={currentIndex}
                                            question={item.question}
                                            isOpen={openIndex === currentIndex}
                                            onClick={() => toggleAccordion(currentIndex)}
                                        >
                                            {item.content}
                                        </FAQItem>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer disclaimer */}
                <div className="mt-20 pt-10 border-t border-gray-200 text-center text-xs font-outfit text-charcoal/60 leading-relaxed max-w-2xl mx-auto space-y-6">
                    <p>
                        Please be informed that returns or exchanges are applicable only on purchases made through our official online store, and we do not provide customer care service via Instagram DMs.
                    </p>
                    <p>
                        <Link href="/customer-care" className="underline underline-offset-4 hover:text-charcoal transition-colors">
                            View full Customer Care page
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
