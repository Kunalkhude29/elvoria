import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminAuth, adminLogout, orders, products } = useApp();

    if (!adminAuth) {
        navigate('/admin/login');
        return null;
    }

    const handleLogout = () => {
        adminLogout();
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path;

    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar__header">
                    <h2 className="admin-sidebar__logo">LUXE ADMIN</h2>
                </div>

                <nav className="admin-nav">
                    <Link
                        to="/admin/dashboard"
                        className={`admin-nav__item ${isActive('/admin/dashboard') ? 'active' : ''}`}
                    >
                        <span className="admin-nav__icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/admin/products"
                        className={`admin-nav__item ${isActive('/admin/products') ? 'active' : ''}`}
                    >
                        <span className="admin-nav__icon">💎</span>
                        <span>Products</span>
                    </Link>
                    <Link
                        to="/admin/orders"
                        className={`admin-nav__item ${isActive('/admin/orders') ? 'active' : ''}`}
                    >
                        <span className="admin-nav__icon">📦</span>
                        <span>Orders</span>
                        {pendingOrders > 0 && (
                            <span className="admin-nav__badge">{pendingOrders}</span>
                        )}
                    </Link>
                </nav>

                <div className="admin-sidebar__footer">
                    <Button variant="ghost" onClick={() => navigate('/')}>
                        ← Back to Store
                    </Button>
                    <Button variant="secondary" onClick={handleLogout}>
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
