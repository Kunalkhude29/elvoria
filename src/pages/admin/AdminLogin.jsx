import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';
import './AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { adminAuth, adminLogin } = useApp();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Redirect if already logged in
    if (adminAuth) {
        navigate('/admin/dashboard');
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = adminLogin(password);
        if (success) {
            navigate('/admin/dashboard');
        } else {
            setError('Invalid password. Try: admin123');
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login__container">
                <div className="admin-login__card">
                    <h1 className="admin-login__title">Admin Panel</h1>
                    <p className="admin-login__subtitle">Sign in to manage your store</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter admin password"
                                required
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <Button type="submit" variant="gold" size="large" fullWidth>
                            Sign In
                        </Button>
                    </form>

                    <p className="admin-login__hint">
                        Demo password: <code>admin123</code>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
