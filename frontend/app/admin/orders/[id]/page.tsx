'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Calendar, CreditCard, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchOrder = async () => {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/orders/${resolvedParams.id}`;
        console.log('Fetching order from:', url);
        try {
            const headers = await getAuthorizedHeaders();
            const res = await fetch(url, {
                headers
            });
            console.log('Order fetch response status:', res.status);
            
            const text = await res.text();
            
            if (res.ok) {
                try {
                    const data = JSON.parse(text);
                    console.log('Order data received:', data);
                    setOrder(data);
                } catch (jsonError) {
                    console.error('Failed to parse order JSON. Raw response:', text);
                }
            } else {
                console.error('Order fetch failed with status:', res.status, 'Response:', text);
            }
        } catch (error) {
            console.error("Failed to fetch order", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [resolvedParams.id]);

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/orders/${resolvedParams.id}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchOrder();
            }
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-outfit font-semibold uppercase tracking-widest">Loading order details...</div>;
    if (!order) return <div className="p-8 text-center text-red-500 font-outfit font-semibold uppercase tracking-widest">Order not found</div>;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DELIVERED': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'SHIPPED': return <Truck className="w-5 h-5 text-blue-500" />;
            case 'PENDING': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-charcoal">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-outfit font-bold text-charcoal">Order <span className="font-dm-mono">#{order.id.toString().slice(-8)}</span></h1>
                        <p className="text-xs text-gray-400 font-outfit font-semibold uppercase tracking-widest mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-outfit font-semibold uppercase tracking-widest text-gray-400 font-bold px-3">Status:</span>
                    <select 
                        value={order.status}
                        onChange={(e) => updateStatus(e.target.value)}
                        disabled={updating}
                        className="bg-gray-50 text-charcoal text-xs font-outfit font-semibold font-bold uppercase tracking-widest px-4 py-2 rounded-lg focus:outline-none border-none cursor-pointer disabled:opacity-50"
                    >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Items */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                            <Package className="w-5 h-5 text-gold" />
                            <h2 className="font-outfit font-bold text-charcoal uppercase tracking-widest">Order Items</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 text-[10px] font-outfit font-semibold uppercase tracking-widest text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Product</th>
                                        <th className="px-6 py-4 text-center">Price</th>
                                        <th className="px-6 py-4 text-center">Qty</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.items.map((item: any) => (
                                        <tr key={item.id} className="font-outfit">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                        {item.product?.images?.[0] ? (
                                                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-6 h-6" /></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-outfit font-semibold font-bold text-charcoal">{item.product?.name || 'Unknown Product'}</p>
                                                        <p className="text-xs text-gray-400 font-dm-mono">ID: #{item.productId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">₹{item.price}</td>
                                            <td className="px-6 py-4 text-center font-bold">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right font-bold">₹{item.price * item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50/30">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-6 text-right font-outfit font-semibold uppercase tracking-widest text-gray-400 text-xs font-bold">Total Amount</td>
                                        <td className="px-6 py-6 text-right font-outfit font-bold text-2xl text-charcoal">₹{order.total}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Shipping */}
                <div className="space-y-8">
                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                            <User className="w-5 h-5 text-gold" />
                            <h2 className="font-outfit font-bold text-charcoal uppercase tracking-widest">Customer Details</h2>
                        </div>
                        <div className="p-6 space-y-4 font-outfit font-semibold">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><User className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Name</p>
                                    <p className="text-charcoal font-bold">{order.customerName || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Mail className="w-4 h-4" /></div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Email</p>
                                    <p className="text-charcoal font-medium break-all">{order.customerEmail || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Phone className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Phone</p>
                                    <p className="text-charcoal font-medium">{order.customerPhone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gold" />
                            <h2 className="font-outfit font-bold text-charcoal uppercase tracking-widest">Shipping Address</h2>
                        </div>
                        <div className="p-6 space-y-6 font-outfit font-semibold">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><MapPin className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Address</p>
                                    <p className="text-charcoal font-medium leading-relaxed">
                                        {order.shippingAddress}<br />
                                        {order.shippingCity}, {order.shippingState} - {order.shippingZip}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
