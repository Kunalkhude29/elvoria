'use client';

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: string | number;
    product: {
        id: number;
        name: string;
        images: any;
    };
}

interface Order {
    id: number;
    user?: { email: string; name?: string };
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingZip?: string;
    total: number;
    status: string;
    createdAt: string;
    items?: OrderItem[];
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const toggleExpand = (id: number) => {
        setExpandedOrderId(prev => prev === id ? null : id);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`);
                if (res.ok) {
                    setOrders(await res.json());
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
            } else {
                alert('Failed to update order status');
            }
        } catch (error) {
            console.error('Update status error:', error);
        }
    };

    const filteredOrders = statusFilter === 'ALL'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const statuses = ['ALL', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-serif font-bold text-charcoal">Manage Orders</h1>

                {/* Filters Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center space-x-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all duration-200 ease-in-out"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-charcoal" />
                        <span className="font-medium text-charcoal">Filters</span>
                    </button>

                    {isFilterOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-2 top-full overflow-hidden">
                            {statuses.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setIsFilterOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${statusFilter === status
                                            ? 'bg-stone-50 text-charcoal font-medium border-l-2 border-charcoal'
                                            : 'text-gray-500 hover:bg-stone-50 hover:text-charcoal border-l-2 border-transparent'
                                        }`}
                                >
                                    {status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wider text-charcoal/60">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-charcoal/80">
                        {filteredOrders.map(order => (
                            <React.Fragment key={order.id}>
                                <tr className="hover:bg-gray-50/50 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                                    <td className="p-4">#{order.id}</td>
                                    <td className="p-4">{order.customerName || order.user?.name || order.user?.email || order.customerEmail || order.customerPhone || 'Guest'}</td>
                                    <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4">${Number(order.total).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            className="p-1 border border-gray-300 rounded text-xs"
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>

                                {/* Expanded Order Details */}
                                {expandedOrderId === order.id && (
                                    <tr>
                                        <td colSpan={6} className="p-0 border-b border-gray-100">
                                            <div className="bg-[#fefce8] p-6 flex flex-col md:flex-row gap-8">

                                                {/* Shipping Details */}
                                                <div className="flex-1 space-y-4">
                                                    <h3 className="font-serif text-charcoal font-medium border-b border-gray-200 pb-2">Customer & Delivery Info</h3>
                                                    <div className="text-sm space-y-2 text-charcoal/70">
                                                        <p><strong className="text-charcoal mr-2">Contact:</strong> {order.customerName || order.user?.name || 'Guest'} | {order.customerEmail || order.user?.email} | {order.customerPhone}</p>
                                                        <div className="bg-white border border-gray-200 p-3 rounded-md mt-2">
                                                            <strong className="block text-charcoal mb-1">Shipping Address:</strong>
                                                            {order.shippingAddress ? (
                                                                <>
                                                                    <p>{order.shippingAddress}</p>
                                                                    <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                                                                </>
                                                            ) : (
                                                                <p className="italic text-gray-400">No specific shipping address provided.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Ordered Items */}
                                                <div className="flex-1 space-y-4">
                                                    <h3 className="font-serif text-charcoal font-medium border-b border-gray-200 pb-2">Order Summary</h3>
                                                    <div className="space-y-3 bg-white border border-gray-200 p-3 rounded-md">
                                                        {order.items && order.items.length > 0 ? (
                                                            order.items.map((item, index) => {
                                                                // Safely extract first image URL for thumbnail
                                                                let imgUrl = '/images/placeholder.webp';
                                                                if (Array.isArray(item.product?.images) && item.product.images.length > 0) {
                                                                    imgUrl = item.product.images[0];
                                                                } else if (typeof item.product?.images === 'string' && item.product.images !== '') {
                                                                    imgUrl = item.product.images;
                                                                }

                                                                return (
                                                                    <div key={index} className="flex items-center space-x-4 border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                                                        <img src={imgUrl} alt={item.product?.name || "Product"} className="w-12 h-12 object-cover rounded-md border border-gray-200 bg-gray-50 flex-shrink-0" />
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium text-charcoal">{item.product?.name || 'Unknown Product'} <span className="text-gray-400 font-normal text-xs ml-1">(ID: {item.product?.id || 'N/A'})</span></p>
                                                                            <p className="text-xs text-charcoal/60">Qty: {item.quantity}</p>
                                                                        </div>
                                                                        <div className="text-sm font-medium text-charcoal">
                                                                            ${(Number(item.price) * item.quantity).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-sm text-charcoal/50 italic">No products found in this order.</p>
                                                        )}
                                                        <div className="pt-3 border-t border-gray-200 flex justify-between font-medium">
                                                            <span>Total:</span>
                                                            <span>${Number(order.total).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
