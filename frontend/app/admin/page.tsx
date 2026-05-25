'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingCart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        totalCustomers: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        // Fetch dashboard stats
        const fetchStats = async () => {
            try {
                const headers = await getAuthorizedHeaders();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/dashboard/stats`, {
                    headers
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        totalOrders: data.totalOrders || 0,
                        totalProducts: data.totalProducts || 0,
                        totalRevenue: data.totalRevenue || 0,
                        totalCustomers: data.totalCustomers || 0
                    });
                    setRecentOrders(data.recentOrders || []);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-outfit font-bold text-charcoal">Dashboard Overview</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                        <div className={`p-4 rounded-full ${card.bg} mr-4`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-outfit font-semibold text-gray-500 mb-1">{card.title}</p>
                            <h3 className="text-2xl font-outfit font-bold text-charcoal">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-outfit font-bold text-charcoal">Recent Orders</h2>
                    <Link href="/admin/orders" className="text-sm font-outfit font-semibold text-blue-600 hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-outfit font-semibold text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-alegreya">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent orders found.</td>
                                </tr>
                            ) : (
                                recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-outfit font-semibold font-medium">#{order.id.toString().slice(-8)}</td>
                                        <td className="px-6 py-4">{order.customerName || 'Guest'}</td>
                                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-outfit font-semibold font-bold">₹{order.total}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-outfit font-semibold font-medium ${
                                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
