'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, User, Phone, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAuthorizedHeaders } from '@/lib/auth';

export default function CompleteProfilePage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { profile, loading: authLoading, refreshProfile } = useAuth();

    useEffect(() => {
        if (!authLoading && !profile) {
            router.push('/login?redirect=/complete-profile');
        } else if (!authLoading && profile?.firstName && profile?.phone) {
            router.push('/');
        }
    }, [profile, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/profile`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ firstName, lastName, phone })
            });

            if (res.ok) {
                await refreshProfile();
                router.push('/');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center font-outfit font-semibold">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center p-4 md:p-6 font-outfit">
            <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-[0_20px_60px_rgba(42,32,18,0.05)] border border-[#e8e1d7]">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#fcf9f2] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-gold" />
                    </div>
                    <h1 className="text-3xl font-outfit text-charcoal mb-3">Complete Profile</h1>
                    <p className="text-charcoal/50 text-[15px] italic">Tell us a bit more to personalize your experience.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-outfit font-semibold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-[10px] font-outfit font-semibold font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-3 ml-1">First Name</label>
                            <div className="relative">
                                <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Aarav"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full border-b border-gray-200 py-4 pl-8 font-outfit font-semibold text-charcoal focus:outline-none focus:border-gold transition-colors bg-transparent placeholder:text-charcoal/20"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-[10px] font-outfit font-semibold font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-3 ml-1">Last Name</label>
                            <input
                                type="text"
                                required
                                placeholder="Sharma"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full border-b border-gray-200 py-4 font-outfit font-semibold text-charcoal focus:outline-none focus:border-gold transition-colors bg-transparent placeholder:text-charcoal/20"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-[10px] font-outfit font-semibold font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-3 ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                            <input
                                type="tel"
                                required
                                placeholder="10-digit mobile number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="w-full border-b border-gray-200 py-4 pl-8 font-outfit font-semibold text-charcoal focus:outline-none focus:border-gold transition-colors bg-transparent placeholder:text-charcoal/20"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full btn-primary h-14 rounded-full flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <span>Save & Continue</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
