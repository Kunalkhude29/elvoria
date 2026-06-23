'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Calendar, CreditCard, Truck, CheckCircle, Clock, XCircle, Send, X } from 'lucide-react';
import Link from 'next/link';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    const [showShipModal, setShowShipModal] = useState(false);
    const [shipData, setShipData] = useState({ weight: 0.5, length: 10, breadth: 10, height: 10 });
    const [shippingError, setShippingError] = useState('');

    const pushToShiprocket = async () => {
        setUpdating(true);
        setShippingError('');
        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/shipping/order/${resolvedParams.id}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(shipData)
            });
            if (res.ok) {
                setShowShipModal(false);
                fetchOrder();
            } else {
                const data = await res.json();
                setShippingError(data.message || 'Failed to push to Shiprocket');
            }
        } catch (error) {
            console.error("Failed to push to shiprocket", error);
            setShippingError('Network error');
        } finally {
            setUpdating(false);
        }
    };

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

                <div className="flex items-center gap-3">
                    {order.awbCode ? (
                        <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-3 py-2 rounded-lg font-outfit uppercase tracking-widest border border-gray-200">
                            Shipment Created
                        </span>
                    ) : (
                        <button 
                            onClick={() => setShowShipModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-outfit font-bold px-3 py-2 rounded-lg uppercase tracking-widest transition-colors flex items-center gap-2"
                        >
                            <Send className="w-3 h-3" /> Ship via Shiprocket
                        </button>
                    )}

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

                    {/* Payment Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-gold" />
                            <h2 className="font-outfit font-bold text-charcoal uppercase tracking-widest">Payment Details</h2>
                        </div>
                        <div className="p-6 space-y-4 font-outfit font-semibold">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><CreditCard className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Method</p>
                                    <p className="text-charcoal font-bold">{order.paymentMethod || 'COD'}</p>
                                </div>
                            </div>
                            {order.razorpayPaymentId && (
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><CreditCard className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Transaction ID</p>
                                        <p className="text-charcoal font-bold text-xs font-dm-mono break-all">{order.razorpayPaymentId}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Shiprocket Tracking Info */}
                    {order.awbCode && (
                        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm overflow-hidden mt-8">
                            <div className="p-6 border-b border-indigo-100 flex items-center gap-3 bg-indigo-100/50">
                                <Send className="w-5 h-5 text-indigo-600" />
                                <h2 className="font-outfit font-bold text-indigo-900 uppercase tracking-widest">Shiprocket Tracking</h2>
                            </div>
                            <div className="p-6 space-y-4 font-outfit font-semibold">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Package className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">AWB Number</p>
                                        <p className="text-indigo-900 font-bold">{order.awbCode}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Truck className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Courier</p>
                                        <p className="text-indigo-900 font-bold">{order.courierName || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><CheckCircle className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Shipment Status</p>
                                        <p className="text-indigo-900 font-bold">{order.shipmentStatus || 'Pending'}</p>
                                    </div>
                                </div>
                                {order.trackingUrl && (
                                    <div className="mt-4">
                                        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline">
                                            Track Shipment
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Shipment Modal */}
            {showShipModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-outfit font-bold text-charcoal text-xl">Create Shipment</h2>
                            <button onClick={() => setShowShipModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-500 font-outfit mb-4">Please verify or update the package dimensions before pushing to Shiprocket.</p>
                            
                            {shippingError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">{shippingError}</div>}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Weight (kg)</label>
                                    <input type="number" step="0.1" value={shipData.weight} onChange={(e) => setShipData({...shipData, weight: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-dm-mono text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Length (cm)</label>
                                    <input type="number" value={shipData.length} onChange={(e) => setShipData({...shipData, length: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-dm-mono text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Breadth (cm)</label>
                                    <input type="number" value={shipData.breadth} onChange={(e) => setShipData({...shipData, breadth: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-dm-mono text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Height (cm)</label>
                                    <input type="number" value={shipData.height} onChange={(e) => setShipData({...shipData, height: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-dm-mono text-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button onClick={() => setShowShipModal(false)} className="px-5 py-2.5 rounded-lg font-outfit font-bold text-sm text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-wider">Cancel</button>
                            <button onClick={pushToShiprocket} disabled={updating} className="px-5 py-2.5 rounded-lg font-outfit font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center gap-2">
                                {updating ? 'Processing...' : <><Send className="w-4 h-4"/> Confirm Shipment</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
