'use client';

import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Because the backend has separate endpoints for User and Admin, 
            // we will first try to log in as admin, then as user.
            let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('userInfo', JSON.stringify(data));
                router.push('/admin');
                return;
            }

            // If not admin, try regular user login
            res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('userInfo', JSON.stringify(data));
                router.push('/');
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Invalid email or password');
            }
        } catch (err: any) {
            setError('Failed to connect to the server. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ivory pb-20">
            <Navbar />
            <div className="container pt-32 flex justify-center">
                <div className="w-full max-w-md bg-white p-8 border border-gray-100 shadow-sm">
                    <h1 className="text-3xl font-serif text-center mb-8">Sign In</h1>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 text-sm rounded mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm uppercase tracking-widest text-charcoal/60 mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full p-3 border border-gray-200 outline-none focus:border-charcoal transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm uppercase tracking-widest text-charcoal/60 mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full p-3 border border-gray-200 outline-none focus:border-charcoal transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="text-center text-sm text-charcoal/60 mt-4">
                            <Link href="#" className="hover:text-gold transition-colors">Forgot Password?</Link>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-charcoal/60">Don't have an account?</p>
                        <Link href="/signup" className="text-charcoal font-medium hover:text-gold transition-colors mt-2 inline-block uppercase tracking-wider text-xs">Create Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
