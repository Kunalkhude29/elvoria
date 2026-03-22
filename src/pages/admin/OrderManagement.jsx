import React from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';
import '../admin/Dashboard.css';

const OrderManagement = () => {
    const { orders, updateOrderStatus } = useApp();

    const handleStatusChange = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus);
        alert('Order status updated!');
    };

    const sortedOrders = [...orders].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
        <div className="dashboard">
            <h1>Order Management</h1>

            <div className="dashboard-section">
                <h2>All Orders ({orders.length})</h2>
                {orders.length === 0 ? (
                    <p className="empty-message">No orders yet</p>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="order-id">#{order.id.slice(-8)}</td>
                                        <td>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <div>
                                                <p style={{ fontWeight: 600 }}>{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    {order.customerInfo.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td>{order.items.length} items</td>
                                        <td className="amount">₹{order.total.toLocaleString('en-IN')}</td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                style={{
                                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '2px solid var(--color-border)',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: 'var(--font-size-sm)',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                            </select>
                                        </td>
                                        <td>
                                            <details>
                                                <summary style={{ cursor: 'pointer', color: 'var(--color-champagne)', fontWeight: 600 }}>
                                                    View Details
                                                </summary>
                                                <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-beige)', borderRadius: 'var(--radius-sm)' }}>
                                                    <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Items:</h4>
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                                                            • {item.name} x {item.quantity} {item.size ? `(Size: ${item.size})` : ''}
                                                        </div>
                                                    ))}
                                                    <h4 style={{ marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>Shipping:</h4>
                                                    <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                                        {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.state} - {order.customerInfo.pincode}
                                                        <br />
                                                        Phone: {order.customerInfo.phone}
                                                    </p>
                                                </div>
                                            </details>
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

export default OrderManagement;
