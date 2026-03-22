'use client';

import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useState } from 'react';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Signup attempt', formData);
        // TODO: Integrate with backend
    };

    return (
        <div className="min-h-screen bg-ivory pb-20">
            <Navbar />
            <div className="container pt-32 flex justify-center">
                <div className="w-full max-w-md bg-white p-8 border border-gray-100 shadow-sm">
                    <h1 className="text-3xl font-serif text-center mb-8">Create Account</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm uppercase tracking-widest text-charcoal/60 mb-2">First Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 outline-none focus:border-charcoal transition-colors"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm uppercase tracking-widest text-charcoal/60 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 outline-none focus:border-charcoal transition-colors"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm uppercase tracking-widest text-charcoal/60 mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full p-3 border border-gray-200 outline-none focus:border-charcoal transition-colors"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm uppercase tracking-widest text-charcoal/60 mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full p-3 border border-gray-200 outline-none focus:border-charcoal transition-colors"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="w-full btn-primary">Create Account</button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-charcoal/60">Already have an account?</p>
                        <Link href="/login" className="text-charcoal font-medium hover:text-gold transition-colors mt-2 inline-block uppercase tracking-wider text-xs">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
