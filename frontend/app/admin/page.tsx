'use client';

import { useState, useEffect } from 'react';

// Define the shape of our stats data from the backend
interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: any[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userInfoStr = localStorage.getItem('userInfo');
                let token = '';
                if (userInfoStr) {
                    try {
                        const userInfo = JSON.parse(userInfoStr);
                        token = userInfo.token;
                    } catch (e) {
                        console.error('Error parsing userInfo from localStorage', e);
                    }
                }

                // Ensure backend is running on 5000 (standard Express port in this setup)
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/dashboard/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch dashboard stats');
                const data = await res.json();
                setStats(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Error connecting to API');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8 text-charcoal flex items-center justify-center min-h-[400px]">Loading live dashboard...</div>;
    }

    if (error || !stats) {
        return <div className="p-8 text-red-500">Error: {error}</div>;
    }

    const statCards = [
        { label: 'Total Revenue', value: `$${Number(stats.totalRevenue).toFixed(2)}`, change: '' },
        { label: 'Total Orders', value: stats.totalOrders.toString(), change: '' },
        { label: 'Products', value: stats.totalProducts.toString(), change: '' },
        { label: 'Customers', value: stats.totalCustomers.toString(), change: '' }
    ];

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-charcoal mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {statCards.map(stat => (
                    <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-charcoal/60 text-sm uppercase tracking-wider mb-2">{stat.label}</h3>
                        <p className="text-2xl font-bold text-charcoal mb-1">{stat.value}</p>
                        <span className="text-xs text-charcoal/40 font-medium">Real-time data</span>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-serif font-bold text-charcoal mb-6">Recent Orders (Live)</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-charcoal/80">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-charcoal/60">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer Contact</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {stats.recentOrders.length > 0 ? (
                                stats.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50">
                                        <td className="p-4">#{order.id}</td>
                                        <td className="p-4">{order.user?.email || order.customerEmail || order.customerPhone || 'Guest'}</td>
                                        <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4">${Number(order.total).toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-charcoal/50">No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
