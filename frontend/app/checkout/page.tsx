'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    LockKeyhole,
    MapPinHouse,
    PencilLine,
    Sparkles,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getAuthorizedHeaders } from '@/lib/auth';
import { fetchPincodeDetails } from '@/lib/pincode';

type CheckoutFormState = {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
};

const initialFormState: CheckoutFormState = {
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
};

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditing = searchParams.get('edit') === 'true';
    const { cart, cartTotal, isLoaded } = useCart();
    const { profile, loading: authLoading, refreshProfile } = useAuth();
    const [formData, setFormData] = useState<CheckoutFormState>(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [error, setError] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [isFetchingPin, setIsFetchingPin] = useState(false);

    const [isInitialRedirectDone, setIsInitialRedirectDone] = useState(false);

    const primaryAddress = profile?.addresses?.[0];
    const hasSavedPhone = !!(profile?.phone || primaryAddress?.phone);
    const hasSavedAddress = !!primaryAddress?.address;
    const hasSavedCheckoutDetails = hasSavedPhone && hasSavedAddress;
    
    // --- FIX: Refresh profile on mount to get latest data ---
    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    useEffect(() => {
        if (authLoading || !isLoaded || !profile || isInitialRedirectDone) return;

        if (hasSavedCheckoutDetails && !isEditing) {
            setIsInitialRedirectDone(true);
            router.replace('/checkout/summary');
        }
    }, [profile, authLoading, isLoaded, hasSavedCheckoutDetails, router, isInitialRedirectDone, isEditing]);

    useEffect(() => {
        if (!profile) {
            setFormData(initialFormState);
            return;
        }

        setFormData({
            firstName: profile.firstName || primaryAddress?.firstName || '',
            lastName: profile.lastName || primaryAddress?.lastName || '',
            phone: profile.phone || primaryAddress?.phone || '',
            address: primaryAddress?.address || '',
            apartment: primaryAddress?.apartment || '',
            city: primaryAddress?.city || '',
            state: primaryAddress?.state || '',
            pinCode: primaryAddress?.pinCode || '',
            country: primaryAddress?.country || 'India',
        });
        setShowEditor(!hasSavedPhone || !hasSavedAddress);
    }, [profile, primaryAddress, hasSavedPhone, hasSavedAddress]);

    const handleFieldChange = (field: keyof CheckoutFormState, value: string) => {
        let cleaned = value;
        if (field === 'phone') {
            cleaned = value.replace(/\D/g, '').slice(0, 10);
        } else if (field === 'pinCode') {
            cleaned = value.replace(/\D/g, '').slice(0, 6);
        }

        setFormData((current) => ({
            ...current,
            [field]: cleaned,
        }));
        setError('');
    };

    const handlePinChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.target.value.replace(/\D/g, '').slice(0, 6);
        setFormData((current) => ({ ...current, pinCode: val }));
        
        if (error && error.includes('PIN')) {
            setError('');
        }

        if (val.length !== 6) {
            setFormData((current) => ({ ...current, city: '', state: '' }));
            return;
        }

        setIsFetchingPin(true);
        setError('');
        const details = await fetchPincodeDetails(val);
        setIsFetchingPin(false);

        if (details.isValid) {
            setFormData((current) => ({ ...current, city: details.city || '', state: details.state || '' }));
        } else {
            setError(details.error || 'Invalid PIN code');
            setFormData((current) => ({ ...current, city: '', state: '' }));
        }
    };

    const validateForm = () => {
        if (formData.phone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return false;
        }
        if (!formData.address || formData.address.length < 5) {
            setError('Please provide a complete delivery address.');
            return false;
        }
        if (formData.pinCode.length < 6) {
            setError('Please enter a valid 6-digit PIN code.');
            return false;
        }
        return true;
    };

    const handleContinue = () => {
        setIsNavigating(true);
        router.push('/checkout/summary');
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!validateForm()) return;

        setIsSaving(true);

        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json',
            });

            if (!headers.Authorization) {
                router.push('/login?redirect=/checkout');
                return;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/checkout-profile`,
                {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(formData),
                }
            );

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                setError(payload.message || 'We could not save your delivery details. Please try again.');
                return;
            }

            await refreshProfile();
            setShowEditor(false);
            setIsNavigating(true);
            router.push('/checkout/summary');
        } catch (checkoutError) {
            console.error('[CHECKOUT] Save profile error:', checkoutError);
            setError('Something interrupted checkout. Please check your connection and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isLoaded || authLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="main-container pt-32 pb-20">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-5 rounded-[28px] border border-[#e8e1d7] bg-white/90 p-8 shadow-[0_20px_60px_rgba(42,32,18,0.06)] animate-pulse">
                            <div className="h-4 w-28 rounded-full bg-[#f1eadf]" />
                            <div className="h-10 w-60 rounded-full bg-[#f5eee3]" />
                            <div className="h-32 rounded-[20px] bg-[#f7f1e8]" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-14 rounded-2xl bg-[#f7f1e8]" />
                                <div className="h-14 rounded-2xl bg-[#f7f1e8]" />
                            </div>
                            <div className="h-14 rounded-2xl bg-[#f7f1e8]" />
                            <div className="h-14 rounded-2xl bg-[#f7f1e8]" />
                        </div>
                        <div className="rounded-[28px] border border-[#e8e1d7] bg-[#fbf8f3] p-8 shadow-[0_20px_60px_rgba(42,32,18,0.06)] animate-pulse">
                            <div className="h-5 w-36 rounded-full bg-[#ebe3d7]" />
                            <div className="mt-8 space-y-4">
                                <div className="h-16 rounded-2xl bg-white/80" />
                                <div className="h-16 rounded-2xl bg-white/80" />
                                <div className="h-16 rounded-2xl bg-white/80" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="main-container pt-32 pb-20">
                    <div className="mx-auto max-w-3xl rounded-[32px] border border-[#e7decf] bg-[linear-gradient(135deg,#fffdfa_0%,#f8f2e9_100%)] px-8 py-16 text-center shadow-[0_30px_80px_rgba(41,29,13,0.08)]">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#9b7a43] shadow-[0_12px_32px_rgba(155,122,67,0.16)]">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#9b7a43]">Checkout</p>
                        <h1 className="mt-4 text-4xl font-outfit text-charcoal">Your bag is waiting for its first piece.</h1>
                        <p className="mx-auto mt-4 max-w-xl text-[15px] font-outfit leading-7 text-charcoal/65">
                            Add a few favourites before we move to delivery and payment. We&apos;ll keep checkout fast once your bag has something beautiful in it.
                        </p>
                        <div className="mt-10 flex justify-center">
                            <Link href="/" className="btn-primary inline-flex items-center gap-2 rounded-full px-7">
                                Continue shopping
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f6f2ec_0%,#f8f8f6_32%,#fbfbfa_100%)] pb-20">
            <Navbar />
            <div className="main-container pt-28 pb-10">
                <div className="mb-8 flex items-center justify-between gap-4">
                    <button
                        onClick={() => router.push('/cart')}
                        className="inline-flex items-center gap-2 rounded-full border border-[#ddd2c2] bg-white/80 px-4 py-2 text-sm font-medium text-charcoal transition hover:border-[#cab08a] hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to bag
                    </button>
                    <div className="hidden items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.32em] text-charcoal/55 sm:inline-flex">
                        <LockKeyhole className="h-4 w-4" />
                        Secure checkout
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
                    <section className="rounded-[30px] border border-[#e7decf] bg-white/90 p-7 shadow-[0_25px_70px_rgba(48,36,18,0.08)] backdrop-blur">
                        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[#f0e7da] pb-6">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#9b7a43]">Delivery</p>
                                <h1 className="mt-3 text-4xl font-outfit text-charcoal">A quiet, premium checkout flow.</h1>
                                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-charcoal/65">
                                    We&apos;ll only ask for what&apos;s missing. If your phone number and address are already saved, you can move straight to payment.
                                </p>
                            </div>

                            {hasSavedCheckoutDetails && (
                                <button
                                    onClick={() => setShowEditor((current) => !current)}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#ddd2c2] px-4 py-2 text-sm font-medium text-charcoal transition hover:border-[#cab08a] hover:bg-[#f9f4ec]"
                                >
                                    <PencilLine className="h-4 w-4" />
                                    {showEditor ? 'Use saved details' : 'Edit delivery details'}
                                </button>
                            )}
                        </div>

                        {authLoading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-28 rounded-[24px] bg-[#f7f1e8]" />
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="h-14 rounded-2xl bg-[#f7f1e8]" />
                                    <div className="h-14 rounded-2xl bg-[#f7f1e8]" />
                                </div>
                                <div className="h-14 rounded-2xl bg-[#f7f1e8]" />
                                <div className="h-14 rounded-2xl bg-[#f7f1e8]" />
                            </div>
                        ) : !profile ? (
                            <div className="rounded-[24px] border border-[#eadfce] bg-[linear-gradient(135deg,#fffdfa_0%,#f8f2e8_100%)] p-8">
                                <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#9b7a43]">Sign in required</p>
                                <h2 className="mt-4 text-3xl font-outfit text-charcoal">Sign in to continue with your delivery profile.</h2>
                                <p className="mt-3 max-w-xl text-[15px] font-outfit leading-7 text-charcoal/65">
                                    We use your account to keep your saved address and contact details ready for the next order too.
                                </p>
                                <div className="mt-8">
                                    <button
                                        onClick={() => router.push('/login?redirect=/checkout')}
                                        className="btn-primary inline-flex items-center gap-2 rounded-full px-7"
                                    >
                                        Continue to sign in
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ) : hasSavedCheckoutDetails && !showEditor ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="rounded-[24px] border border-[#eadfce] bg-[linear-gradient(135deg,#fffdfa_0%,#f8f3ea_100%)] p-8 shadow-[0_15px_45px_rgba(42,32,18,0.04)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <CheckCircle2 className="h-32 w-32" />
                                    </div>
                                    <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#9b7a43]">Verified shipping profile</p>
                                            <h2 className="mt-4 text-3xl font-outfit text-charcoal">
                                                {formData.firstName || formData.lastName
                                                    ? `${formData.firstName} ${formData.lastName}`.trim()
                                                    : profile.email}
                                            </h2>
                                            <p className="mt-2 text-sm text-charcoal/70">{profile.email}</p>
                                        </div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-medium text-[#7d6234] shadow-[0_10px_24px_rgba(125,98,52,0.08)] border border-[#f0e7da]">
                                            <Sparkles className="h-4 w-4 text-[#b9955c]" />
                                            Express checkout active
                                        </div>
                                    </div>

                                    <div className="mt-10 grid gap-5 sm:grid-cols-2">
                                        <div className="rounded-[22px] bg-white/90 p-6 border border-[#f0e7da]/50 shadow-sm">
                                            <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 font-semibold">Contact</p>
                                            <p className="mt-3 text-lg font-medium text-charcoal tracking-tight">{formData.phone}</p>
                                        </div>
                                        <div className="rounded-[22px] bg-white/90 p-6 border border-[#f0e7da]/50 shadow-sm">
                                            <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 font-semibold">Delivery destination</p>
                                            <p className="mt-3 text-[15px] font-outfit leading-relaxed text-charcoal/75">
                                                {[formData.address, formData.apartment, formData.city, formData.state, formData.pinCode]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-[#efe5d7] bg-[#fcfaf7] px-7 py-5 shadow-sm">
                                    <div className="flex items-center gap-4 text-[14px] text-charcoal/70">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[#f0e7da]">
                                            <MapPinHouse className="h-5 w-5 text-[#9b7a43]" />
                                        </div>
                                        <span>Your details are secured and ready for this order.</span>
                                    </div>
                                    <button
                                        onClick={handleContinue}
                                        disabled={isNavigating}
                                        className="btn-primary min-w-[200px] h-14 inline-flex items-center justify-center gap-3 rounded-full text-base font-semibold shadow-[0_12px_28px_rgba(42,32,18,0.15)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                                    >
                                        {isNavigating ? 'Opening summary...' : 'Proceed to payment'}
                                        <ArrowRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
                                <div className="rounded-[22px] border border-[#efe5d7] bg-[#fcfaf7] px-6 py-5 flex items-center gap-4 text-[14px] text-charcoal/70 shadow-sm">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-[#f0e7da]">
                                        <Sparkles className="h-5 w-5 text-[#9b7a43]" />
                                    </div>
                                    <p>Your delivery profile is incomplete. Fill it once to enable express checkout for all future orders.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <label className="space-y-2.5">
                                        <span className="text-[11px] font-outfit font-semibold font-bold uppercase tracking-[0.2em] text-charcoal/40 ml-1">First name</span>
                                        <input
                                            value={formData.firstName}
                                            onChange={(event) => handleFieldChange('firstName', event.target.value)}
                                            className="w-full rounded-[18px] border border-[#dfd4c4] bg-[#fffefc] px-5 py-4 text-sm font-outfit font-semibold outline-none transition-all focus:border-[#b9955c] focus:ring-4 focus:ring-[#ead8bc]/30 placeholder:text-charcoal/25 shadow-sm"
                                            placeholder="e.g. Aarav"
                                            required
                                        />
                                    </label>
                                    <label className="space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal/40 ml-1">Last name</span>
                                        <input
                                            value={formData.lastName}
                                            onChange={(event) => handleFieldChange('lastName', event.target.value)}
                                            className="w-full rounded-[18px] border border-[#dfd4c4] bg-[#fffefc] px-5 py-4 text-sm outline-none transition-all focus:border-[#b9955c] focus:ring-4 focus:ring-[#ead8bc]/30 placeholder:text-charcoal/25 shadow-sm"
                                            placeholder="e.g. Sharma"
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1.1fr_0.9fr]">
                                    <label className="space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal/40 ml-1">Phone number</span>
                                        <div className="relative">
                                            <input
                                                value={formData.phone}
                                                onChange={(event) => handleFieldChange('phone', event.target.value)}
                                                className="w-full rounded-[18px] border border-[#dfd4c4] bg-[#fffefc] px-5 py-4 text-sm outline-none transition-all focus:border-[#b9955c] focus:ring-4 focus:ring-[#ead8bc]/30 placeholder:text-charcoal/25 shadow-sm"
                                                placeholder="10-digit mobile number"
                                                inputMode="numeric"
                                                required
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-charcoal/30">
                                                {formData.phone.length}/10
                                            </div>
                                        </div>
                                    </label>
                                    <label className="space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal/40 ml-1">Country</span>
                                        <input
                                            value={formData.country}
                                            onChange={(event) => handleFieldChange('country', event.target.value)}
                                            className="w-full rounded-[18px] border border-[#dfd4c4] bg-[#fbfbfb] px-5 py-4 text-sm outline-none cursor-not-allowed text-charcoal/50"
                                            placeholder="India"
                                            readOnly
                                        />
                                    </label>
                                </div>

                                <label className="space-y-2.5">
                                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal/40 ml-1">Street Address</span>
                                    <input
                                        value={formData.address}
                                        onChange={(event) => handleFieldChange('address', event.target.value)}
                                        className="w-full rounded-[18px] border border-[#dfd4c4] bg-[#fffefc] px-5 py-4 text-sm outline-none transition-all focus:border-[#b9955c] focus:ring-4 focus:ring-[#ead8bc]/30 placeholder:text-charcoal/25 shadow-sm"
                                        placeholder="House number, street name, and locality"
                                        required
                                    />
                                </label>

                                <label className="space-y-2.5">
                                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal/40 ml-1">Apartment, suite or landmark</span>
                                    <input
                                        value={formData.apartment}
                                        onChange={(event) => handleFieldChange('apartment', event.target.value)}
                                        className="w-full rounded-[18px] border border-[#dfd4c4] bg-[#fffefc] px-5 py-4 text-sm outline-none transition-all focus:border-[#b9955c] focus:ring-4 focus:ring-[#ead8bc]/30 placeholder:text-charcoal/25 shadow-sm"
                                        placeholder="Flat no, building, landmark (optional)"
                                    />
                                </label>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                    <label className="space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal/40 ml-1">City</span>
                                        <input
                                            value={formData.city}
                                            readOnly={!!formData.city && formData.pinCode.length === 6}
                                            onChange={(event) => handleFieldChange('city', event.target.value)}
                                            className={`w-full rounded-[18px] border border-[#dfd4c4] px-5 py-4 text-sm outline-none transition-all focus:border-[#b9955c] focus:ring-4 focus:ring-[#ead8bc]/30 placeholder:text-charcoal/25 shadow-sm ${formData.pinCode.length === 6 && formData.city ? 'bg-gray-100 cursor-not-allowed text-charcoal/60' : 'bg-[#fffefc]'}`}
                                            placeholder="Mumbai"
                                            required
                                        />
                                    </label>
                                    <label className="space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal/40 ml-1">State</span>
                                        <input
                                            value={formData.state}
                                            readOnly={!!formData.state && formData.pinCode.length === 6}
                                            onChange={(event) => handleFieldChange('state', event.target.value)}
                                            className={`w-full rounded-[18px] border border-[#dfd4c4] px-5 py-4 text-sm outline-none transition-all focus:border-[#b9955c] focus:ring-4 focus:ring-[#ead8bc]/30 placeholder:text-charcoal/25 shadow-sm ${formData.pinCode.length === 6 && formData.state ? 'bg-gray-100 cursor-not-allowed text-charcoal/60' : 'bg-[#fffefc]'}`}
                                            placeholder="Maharashtra"
                                            required
                                        />
                                    </label>
                                    <label className="space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal/40 ml-1">PIN code</span>
                                        <div className="relative">
                                            <input
                                                value={formData.pinCode}
                                                onChange={handlePinChange}
                                                className="w-full rounded-[18px] border border-[#dfd4c4] bg-[#fffefc] px-5 py-4 text-sm outline-none transition-all focus:border-[#b9955c] focus:ring-4 focus:ring-[#ead8bc]/30 placeholder:text-charcoal/25 shadow-sm"
                                                placeholder="400001"
                                                required
                                            />
                                            {isFetchingPin && (
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-[#dfd4c4] border-t-[#b9955c] rounded-full animate-spin" />
                                            )}
                                        </div>
                                    </label>
                                </div>

                                {error && (
                                    <div className="rounded-[22px] border border-[#efd1cf] bg-[#fff4f3] px-6 py-4 text-[14px] text-[#a1453d] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="h-2 w-2 rounded-full bg-[#a1453d]" />
                                        {error}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-[#efe5d7] bg-[#fcfaf7] px-7 py-6 shadow-sm mt-4">
                                    <div className="max-w-sm">
                                        <p className="text-[15px] font-semibold text-charcoal">Secure your profile.</p>
                                        <p className="mt-1 text-[13px] leading-relaxed text-charcoal/50">
                                            These details will be saved to your account for a faster checkout next time.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving || isNavigating}
                                        className="btn-primary min-w-[220px] h-14 inline-flex items-center justify-center gap-3 rounded-full text-base font-semibold shadow-[0_12px_28px_rgba(42,32,18,0.15)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                                    >
                                        {isSaving ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Saving...
                                            </div>
                                        ) : (
                                            <>
                                                Save and continue
                                                <ArrowRight className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                    <aside className="rounded-[30px] border border-[#e7decf] bg-[#fbf8f3] p-7 shadow-[0_25px_70px_rgba(48,36,18,0.08)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#9b7a43]">Order summary</p>
                                <h2 className="mt-3 text-2xl font-outfit text-charcoal">{cart.length} piece{cart.length > 1 ? 's' : ''} selected</h2>
                            </div>
                            <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-charcoal shadow-[0_8px_22px_rgba(42,32,18,0.08)]">
                                ₹{cartTotal.toFixed(2)}
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 rounded-[22px] border border-white/80 bg-white/80 p-4 shadow-[0_10px_24px_rgba(42,32,18,0.04)]"
                                >
                                    <div className="relative h-20 w-20 overflow-hidden rounded-[18px] bg-[#f3ece2]">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-outfit text-lg text-charcoal">{item.name}</p>
                                        <p className="mt-1 text-sm text-charcoal/55">Quantity {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-charcoal">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 rounded-[24px] border border-[#eadfce] bg-white/80 p-5">
                            <div className="flex items-center justify-between text-sm text-charcoal/65">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-sm text-charcoal/65">
                                <span>Shipping</span>
                                <span>Calculated after address confirmation</span>
                            </div>
                            <div className="mt-5 border-t border-[#efe5d7] pt-5">
                                <div className="flex items-center justify-between text-base font-outfit font-semibold font-semibold text-charcoal">
                                    <span>Total</span>
                                    <span>₹{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-[24px] border border-[#eadfce] bg-[linear-gradient(135deg,#fffdfa_0%,#f7efe2_100%)] p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#9b7a43] shadow-[0_10px_24px_rgba(155,122,67,0.12)]">
                                    <LockKeyhole className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-charcoal">Protected checkout</p>
                                    <p className="text-sm text-charcoal/60">Your profile and delivery details stay tied to your authenticated account.</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
