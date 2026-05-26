'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function LoginPageContent() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
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
                setError(data.message || 'Failed to send OTP');
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
                router.push(redirect);
            } else {
                setError(data.message || 'Invalid OTP');
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
                            {step === 'email' ? 'Welcome Back' : 'Verify Identity'}
                        </h1>
                        <p className="text-charcoal/50 text-[15px] italic">
                            {step === 'email' 
                                ? 'Sign in to your premium jewellery portal.' 
                                : `We've sent a 6-digit code to ${email}`}
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
                                    <span>Continue</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-outfit font-semibold font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-3 ml-1">Enter 6-Digit Code</label>
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
                                        <span>Verify & Sign In</span>
                                        <ShieldCheck className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full text-xs font-outfit font-semibold uppercase tracking-widest text-charcoal/40 hover:text-gold transition-colors"
                            >
                                Change Email
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-12 text-center pt-8 border-t border-gray-100/50">
                    <p className="text-charcoal/40 text-xs font-outfit font-semibold uppercase tracking-widest mb-2">Secure Premium Access</p>
                    <p className="text-charcoal/30 text-[11px]">
                        By continuing, you agree to SHWETA's <br />
                        <Link href="/terms" className="underline hover:text-gold">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-gold">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center p-4 md:p-6 font-outfit">
                <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-[0_20px_60px_rgba(42,32,18,0.05)] border border-[#e8e1d7] flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-charcoal/40 mb-4" />
                    <p className="text-charcoal/50 text-[15px]">Loading login portal...</p>
                </div>
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}

