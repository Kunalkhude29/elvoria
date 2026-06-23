'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Search, RotateCcw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState<'orders' | 'requests'>('orders');

    // Requests state
    const [requests, setRequests] = useState<any[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');
    const [requestTypeFilter, setRequestTypeFilter] = useState('ALL');
    const [updatingRequest, setUpdatingRequest] = useState<number | null>(null);

    const fetchOrders = async () => {
        try {
            const headers = await getAuthorizedHeaders({ 'Content-Type': 'application/json' });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/orders`, { headers });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        setRequestsLoading(true);
        try {
            const headers = await getAuthorizedHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/order-requests`, { headers });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setRequestsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchRequests();
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const headers = await getAuthorizedHeaders({ 'Content-Type': 'application/json' });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchOrders();
        } catch (error) {
            console.error("Failed to update order status", error);
        }
    };

    const updateRequestStatus = async (requestId: number, status: string) => {
        setUpdatingRequest(requestId);
        try {
            const headers = await getAuthorizedHeaders({ 'Content-Type': 'application/json' });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/order-requests/${requestId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchRequests();
        } catch (error) {
            console.error("Failed to update request", error);
        } finally {
            setUpdatingRequest(null);
        }
    };

    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch = order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredRequests = requests.filter((req: any) => {
        const matchesStatus = requestStatusFilter === 'ALL' || req.status === requestStatusFilter;
        const matchesType = requestTypeFilter === 'ALL' || req.type === requestTypeFilter;
        return matchesStatus && matchesType;
    });

    const pendingRequestsCount = requests.filter((r: any) => r.status === 'PENDING').length;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'PROCESSING': return 'bg-orange-100 text-orange-700';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700';
            case 'OUT_FOR_DELIVERY': return 'bg-indigo-100 text-indigo-700';
            case 'RETURN_INITIATED': return 'bg-orange-100 text-orange-700';
            case 'RETURN_COLLECTED': return 'bg-teal-100 text-teal-700';
            case 'REFUND_PROCESSING': return 'bg-blue-100 text-blue-700';
            case 'REFUND_COMPLETED': return 'bg-green-100 text-green-700';
            case 'PAYMENT_FAILED': return 'bg-red-100 text-red-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRequestStatusStyle = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div>
            {/* Tab Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div className="flex items-center gap-6">
                    <h1 className="text-3xl font-outfit font-bold text-charcoal">Order Management</h1>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-4 py-1.5 rounded-md text-xs font-outfit font-bold uppercase tracking-wider transition-colors ${activeTab === 'orders' ? 'bg-white shadow text-charcoal' : 'text-gray-500 hover:text-charcoal'}`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-1.5 rounded-md text-xs font-outfit font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'requests' ? 'bg-white shadow text-charcoal' : 'text-gray-500 hover:text-charcoal'}`}
                        >
                            Customer Requests
                            {pendingRequestsCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {pendingRequestsCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {activeTab === 'orders' && (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold font-outfit font-semibold text-sm"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold font-outfit font-semibold text-sm"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="RETURN_INITIATED">Return Initiated</option>
                            <option value="RETURN_COLLECTED">Return Collected</option>
                            <option value="REFUND_PROCESSING">Refund Processing</option>
                            <option value="REFUND_COMPLETED">Refund Completed</option>
                            <option value="PAYMENT_FAILED">Payment Failed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={requestTypeFilter}
                            onChange={(e) => setRequestTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold font-outfit font-semibold text-sm"
                        >
                            <option value="ALL">All Types</option>
                            <option value="RETURN">Return</option>
                            <option value="CANCEL">Cancel</option>
                        </select>
                        <select
                            value={requestStatusFilter}
                            onChange={(e) => setRequestStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold font-outfit font-semibold text-sm"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                )}
            </div>

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 font-outfit font-semibold text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-alegreya">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading orders...</td></tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
                                ) : (
                                    filteredOrders.map((order: any) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                            onClick={(e) => {
                                                if ((e.target as HTMLElement).tagName !== 'SELECT' && (e.target as HTMLElement).tagName !== 'OPTION') {
                                                    router.push(`/admin/orders/${order.id}`);
                                                }
                                            }}
                                        >
                                            <td className="px-6 py-4 font-dm-mono font-semibold font-medium">#{order.id.toString().slice(-8)}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-outfit font-semibold font-medium text-charcoal group-hover:text-gold transition-colors">{order.customerName}</div>
                                                <div className="text-xs text-gray-400">{order.customerEmail}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-outfit font-semibold font-bold">₹{order.total}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-charcoal">{order.paymentMethod || 'COD'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] w-fit font-outfit font-semibold font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                                                        {order.status === 'RETURN_INITIATED' ? 'RETURN REQ.' : order.status}
                                                    </span>
                                                    {order.refundStatus === 'PENDING' && (
                                                        <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[10px] w-fit font-outfit font-semibold font-bold uppercase tracking-wider animate-pulse">
                                                            Refund Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <div className="p-2 text-gray-300 group-hover:text-gold transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </div>
                                                    <select
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        value={order.status}
                                                        className="text-xs border border-gray-200 rounded p-1 focus:outline-none focus:border-gold bg-white"
                                                    >
                                                        <option value="PENDING">Pending</option>
                                                        <option value="PROCESSING">Processing</option>
                                                        <option value="SHIPPED">Shipped</option>
                                                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                                        <option value="DELIVERED">Delivered</option>
                                                        <option value="RETURN_INITIATED">Return Initiated</option>
                                                        <option value="RETURN_COLLECTED">Return Collected</option>
                                                        <option value="REFUND_PROCESSING">Refund Processing</option>
                                                        <option value="REFUND_COMPLETED">Refund Completed</option>
                                                        <option value="PAYMENT_FAILED">Payment Failed</option>
                                                        <option value="CANCELLED">Cancelled</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {requestsLoading ? (
                        <div className="bg-white rounded-xl p-8 text-center text-gray-500 font-outfit">Loading requests...</div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center">
                            <p className="text-gray-400 font-outfit text-sm">No customer requests found.</p>
                        </div>
                    ) : (
                        filteredRequests.map((req: any) => (
                            <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-outfit font-bold uppercase tracking-wider ${req.type === 'RETURN' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                {req.type === 'RETURN' ? <RotateCcw className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {req.type} Request
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-outfit font-bold uppercase tracking-wider ${getRequestStatusStyle(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Link
                                                href={`/admin/orders/${req.orderId}`}
                                                className="text-sm font-outfit font-bold text-charcoal hover:text-gold transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Order #{req.orderId}
                                            </Link>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-sm font-outfit text-gray-600">{req.order?.customerName}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-sm font-outfit text-gray-500">{req.order?.customerEmail}</span>
                                        </div>
                                        {req.order?.customerPhone && (
                                            <p className="text-xs text-gray-400 font-outfit">{req.order.customerPhone}</p>
                                        )}
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-xs text-gray-400 font-outfit">
                                            {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-sm font-outfit font-bold text-charcoal">₹{req.order?.total}</p>
                                            {req.order?.refundStatus === 'PENDING' && (
                                                <span className="text-[10px] text-red-600 font-bold uppercase">Refund Req.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-[10px] font-outfit font-bold uppercase tracking-wider text-gray-400 mb-1">Customer's Reason</p>
                                    <p className="text-sm font-outfit text-charcoal leading-relaxed">{req.reason}</p>
                                </div>

                                {/* Action buttons */}
                                {req.status === 'PENDING' && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <button
                                            disabled={updatingRequest === req.id}
                                            onClick={() => updateRequestStatus(req.id, 'APPROVED')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-outfit font-bold rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            disabled={updatingRequest === req.id}
                                            onClick={() => updateRequestStatus(req.id, 'REJECTED')}
                                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-outfit font-bold rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                        {updatingRequest === req.id && (
                                            <span className="text-xs text-gray-400 font-outfit">Updating...</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
