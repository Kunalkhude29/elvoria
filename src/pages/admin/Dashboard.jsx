import React from 'react';
import { useApp } from '../../context/AppContext';
import './Dashboard.css';

const Dashboard = () => {
    const { orders, products } = useApp();

    // Calculate statistics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < 5).length;

    const recentOrders = orders.slice(-5).reverse();

    return (
        <div className="dashboard">
            <h1 className="dashboard__title">Dashboard</h1>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__icon">💰</div>
                    <div className="stat-card__content">
                        <p className="stat-card__label">Total Revenue</p>
                        <p className="stat-card__value">₹{totalRevenue.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon">📦</div>
                    <div className="stat-card__content">
                        <p className="stat-card__label">Total Orders</p>
                        <p className="stat-card__value">{totalOrders}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon">⏳</div>
                    <div className="stat-card__content">
                        <p className="stat-card__label">Pending Orders</p>
                        <p className="stat-card__value">{pendingOrders}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon">✓</div>
                    <div className="stat-card__content">
                        <p className="stat-card__label">Delivered</p>
                        <p className="stat-card__value">{deliveredOrders}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon">💎</div>
                    <div className="stat-card__content">
                        <p className="stat-card__label">Total Products</p>
                        <p className="stat-card__value">{totalProducts}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon">⚠️</div>
                    <div className="stat-card__content">
                        <p className="stat-card__label">Low Stock</p>
                        <p className="stat-card__value">{lowStockProducts}</p>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="dashboard-section">
                <h2>Recent Orders</h2>
                {recentOrders.length === 0 ? (
                    <p className="empty-message">No orders yet</p>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="order-id">#{order.id.slice(-8)}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>{order.customerInfo.email}</td>
                                        <td className="amount">₹{order.total.toLocaleString('en-IN')}</td>
                                        <td>
                                            <span className={`status-badge status-badge--${order.status}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
