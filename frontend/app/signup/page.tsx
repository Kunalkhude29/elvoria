'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { refreshProfile } = useAuth();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/user/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await res.json();
            if (res.ok) {
                setStep('otp');
            } else {
                setError(data.message || 'Failed to send verification code');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/user/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.user));
                await refreshProfile();
                router.push('/');
            } else {
                setError(data.message || 'Invalid verification code');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center p-4 md:p-6 font-outfit">
            <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-[0_20px_60px_rgba(42,32,18,0.05)] border border-[#e8e1d7]">
                <div className="text-center mb-10">
                    <Link href="/" className="text-4xl font-outfit font-bold text-charcoal tracking-widest inline-block mb-8">SHWETA</Link>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-outfit text-charcoal">
                            {step === 'email' ? 'Join SHWETA' : 'Confirm Email'}
                        </h1>
                        <p className="text-charcoal/50 text-[15px] italic">
                            {step === 'email' 
                                ? 'Create your premium account in seconds.' 
                                : `Verification code sent to ${email}`}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-outfit font-semibold text-center">
                        {error}
                    </div>
                )}

                {step === 'email' ? (
                    <form onSubmit={handleSendOtp} className="space-y-8">
                        <div className="relative">
                            <label className="block text-[10px] font-outfit font-semibold font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-3 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
                                <input
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border-b border-gray-200 py-4 pl-8 font-outfit font-semibold text-charcoal focus:outline-none focus:border-gold transition-colors bg-transparent placeholder:text-charcoal/20"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full btn-primary h-14 rounded-full flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <span>Create Account</span>
                                    <Sparkles className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-outfit font-semibold font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-3 ml-1">Verification Code</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full border-b-2 border-gray-100 py-4 text-center text-3xl font-outfit tracking-[0.5em] text-charcoal focus:outline-none focus:border-gold transition-colors bg-transparent placeholder:text-charcoal/10"
                            />
                        </div>
                        <div className="space-y-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full btn-primary h-14 rounded-full flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <span>Confirm & Join</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full text-xs font-outfit font-semibold uppercase tracking-widest text-charcoal/40 hover:text-gold transition-colors"
                            >
                                Use a different email
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-12 text-center pt-8 border-t border-gray-100/50">
                    <p className="text-charcoal/60 font-outfit mb-4 italic">Already have an account?</p>
                    <Link href="/login" className="text-sm font-outfit font-semibold uppercase tracking-widest text-charcoal border-b border-charcoal pb-1 hover:text-gold hover:border-gold transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
