'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { LogOut, User, Package, MapPin, X, ChevronDown, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAuthorizedHeaders } from '@/lib/auth';
import { validatePhone, formatPhoneAsYouType } from '@/lib/phoneValidation';
import { fetchPincodeDetails } from '@/lib/pincode';
import NotificationToggle from '@/components/NotificationToggle';

export default function ProfilePage() {
    const { user, loading, signOut, refreshProfile } = useAuth();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('profile');
    const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    
    // Profile Edit State
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

    const getOrderStatusMessage = (order: any) => {
        switch (order.status) {
            case 'PENDING': return 'Order received';
            case 'PROCESSING': return 'We are preparing your order';
            case 'SHIPPED': return 'Your order is on the way';
            case 'OUT_FOR_DELIVERY': return 'Your order is out for delivery';
            case 'DELIVERED': return 'Order delivered successfully';
            case 'RETURN_INITIATED': {
                const approvedReturn = order.requests?.find((req: any) => req.type === 'RETURN' && req.status === 'APPROVED');
                if (approvedReturn) {
                    return 'Return Initiated • Return pickup will be arranged shortly.';
                }
                return 'Return Initiated';
            }
            case 'RETURN_COLLECTED': return 'Return product collected successfully. We are processing your refund amount.';
            case 'REFUND_PROCESSING': return 'We are processing your refund amount.';
            case 'REFUND_COMPLETED': return 'Refund Completed • Amount refunded successfully.';
            case 'CANCELLED': 
                if (order.refundStatus === 'PENDING' || order.refundStatus === 'COMPLETED') {
                    return 'Order Cancelled • Refund Initiated • Amount will be credited within 2–3 working days';
                }
                return 'Order Cancelled';
            default: return order.status;
        }
    };
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        firstName: '',
        lastName: '',
        receivesOffers: false
    });
    
    // Address state
    const [addresses, setAddresses] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [isFetchingOrders, setIsFetchingOrders] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);


    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        state: 'Maharashtra', // Default state or first option
        pinCode: '',
        phone: '',
        country: 'India',
        isDefault: false
    });
    const [isFetchingPin, setIsFetchingPin] = useState(false);

    const router = useRouter();

    const fetchAddresses = async () => {
        try {
            const headers = await getAuthorizedHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/addresses`, {
                headers
            });
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            } else {
                console.error('[PROFILE] Failed to fetch addresses:', res.status);
            }
        } catch (e) {
            console.error('[PROFILE] Address fetch error:', e);
        }
    };

    const fetchOrders = async () => {
        setIsFetchingOrders(true);
        try {
            const headers = await getAuthorizedHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/orders/myorders`, {
                headers
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
                setOrderError(null);
            } else {
                const errorData = await res.json().catch(() => ({}));
                const msg = errorData.message || `Error ${res.status}`;
                console.error('[PROFILE] Failed to fetch orders:', res.status, msg);
                setOrderError(msg);
            }

        } catch (e) {
            console.error('[PROFILE] Order fetch error:', e);
        } finally {
            setIsFetchingOrders(false);
        }
    };

    useEffect(() => {
        if (loading) return;


        if (!user) {
            router.push('/login?redirect=/profile');
            return;
        }

        if (user.role === 'ADMIN') {
            router.push('/admin');
            return;
        }

        setUserInfo(user);
        if (user.addresses) {
            setAddresses(user.addresses);
        }

        fetchAddresses();
        fetchOrders();
    }, [user, loading, router]);


    const handlePinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setFormData(prev => ({ ...prev, pinCode: val }));

        if (val.length !== 6) {
            setFormData(prev => ({ ...prev, city: '', state: '' }));
            return;
        }

        setIsFetchingPin(true);
        const details = await fetchPincodeDetails(val);
        setIsFetchingPin(false);

        if (details.isValid) {
            setFormData(prev => ({ ...prev, city: details.city || '', state: details.state || '' }));
        } else {
            alert(details.error || 'Invalid PIN code');
            setFormData(prev => ({ ...prev, city: '', state: '' }));
        }
    };

    const handleLogout = () => {
        signOut();
    };

    const handleSaveAddress = async () => {
        if (!formData.firstName || !formData.address || !formData.city || !formData.pinCode || !formData.phone) {
            alert('Please fill out all required fields');
            return;
        }
        
        const phoneValidation = validatePhone(formData.phone, 'IN');
        if (!phoneValidation.isValid) {
            alert(phoneValidation.error || 'Invalid phone number');
            return;
        }
        
        setIsSaving(true);
        
        const payload = {
            ...formData,
            phone: phoneValidation.formatted
        };

        const url = editingAddressId 
            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/addresses/${editingAddressId}`
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/addresses`;
        const method = editingAddressId ? 'PUT' : 'POST';

        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                setIsAddAddressModalOpen(false);
                fetchAddresses();
                await refreshProfile();
                // Reset form
                setFormData({
                    firstName: '', lastName: '', address: '', apartment: '',
                    city: '', state: 'Maharashtra', pinCode: '', phone: '', country: 'India', isDefault: false
                });
                setEditingAddressId(null);
            } else {
                const errorStr = await res.text();
                alert(`Failed to save address: ${res.status} ${errorStr}`);
            }
        } catch(e: any) {
            alert(`An error occurred: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAddress = async () => {
        if (!editingAddressId) return;
        
        setIsDeleting(true);
        try {
            const headers = await getAuthorizedHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/addresses/${editingAddressId}`, {
                method: 'DELETE',
                headers
            });
            if (res.ok) {
                setIsAddAddressModalOpen(false);
                fetchAddresses();
                await refreshProfile();
            } else {
                alert('Failed to delete address');
            }
        } catch(e) {
            alert('An error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            const headers = await getAuthorizedHeaders({
                'Content-Type': 'application/json'
            });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/profile`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(profileFormData)
            });
            
            if (res.ok) {
                const data = await res.json();
                const updatedInfo = { ...userInfo, ...data };
                setUserInfo(updatedInfo);
                localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
                await refreshProfile();
                setIsEditProfileModalOpen(false);
            } else {
                const errorStr = await res.text();
                alert(`Failed to update profile: ${res.status} ${errorStr}`);
            }
        } catch(e: any) {
            alert(`An error occurred: ${e.message}`);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const openEditModal = (addr: any) => {
        setFormData({
            firstName: addr.firstName || '',
            lastName: addr.lastName || '',
            address: addr.address || '',
            apartment: addr.apartment || '',
            city: addr.city || '',
            state: addr.state || 'Maharashtra',
            pinCode: addr.pinCode || '',
            country: addr.country || 'India',
            phone: addr.phone || '',
            isDefault: addr.isDefault || false
        });
        setEditingAddressId(addr.id);
        setIsAddAddressModalOpen(true);
    };

    if (loading || !userInfo) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
                <Navbar />
                <div className="flex-1 w-full max-w-5xl mx-auto px-6 pt-24">
                    <div className="flex gap-8 mb-12 border-b border-gray-200 pb-4 animate-pulse">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-48 bg-white rounded-xl shadow-sm animate-pulse" />
                        <div className="h-48 bg-white rounded-xl shadow-sm animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
            <Navbar />
            
            <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-10 pb-24">
                
                {/* Tabs syncing with the style from the screenshot */}
                <div className="flex gap-8 mb-12 border-b border-gray-200 pb-4">
                    <button 
                        onClick={() => setActiveTab('orders')} 
                        className={`text-sm ${activeTab === 'orders' ? 'text-black font-semibold border-b-2 border-black pb-4 -mb-[18px]' : 'text-gray-500 hover:text-black font-medium'}`}
                    >
                        Orders
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')} 
                        className={`text-sm ${activeTab === 'profile' ? 'text-black font-semibold border-b-2 border-black pb-4 -mb-[18px]' : 'text-gray-500 hover:text-black font-medium'}`}
                    >
                        Profile
                    </button>
                </div>

                {activeTab === 'orders' ? (
                    <div className="animate-in fade-in duration-300">
                        <h1 className="text-[20px] font-bold text-black mb-6 tracking-tight">Orders</h1>
                        
                        {isFetchingOrders ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 bg-white rounded-xl shadow-sm animate-pulse" />
                                ))}
                            </div>
                        ) : orderError ? (
                            <div className="bg-red-50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] border border-red-100">
                                <p className="text-red-700 font-medium mb-2">Failed to load orders</p>
                                <p className="text-red-500 text-sm">{orderError}</p>
                                <button 
                                    onClick={() => fetchOrders()}
                                    className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : orders.length === 0 ? (

                            <div className="bg-white rounded-xl py-24 px-8 flex flex-col items-center justify-center min-h-[300px]">
                                <h2 className="text-[15px] font-bold text-black mb-3">No orders yet</h2>
                                <Link href="/" className="text-[14px] text-gray-800 hover:text-black underline underline-offset-4 decoration-gray-300 hover:decoration-black transition-all">
                                    Go to store to place an order.
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6 border-b border-gray-100 pb-6">
                                            <div className="space-y-1">
                                                <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">Order Number</p>
                                                <p className="text-[15px] font-bold text-black">#ELV-{order.id}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">Date Placed</p>
                                                <p className="text-[15px] font-medium text-black">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">Status</p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
                                                    order.status === 'DELIVERED' ? 'bg-green-50 text-green-700' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700' :
                                                    order.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                                                    order.status === 'RETURN_INITIATED' ? 'bg-purple-50 text-purple-700' :
                                                    'bg-orange-50 text-orange-700'
                                                }`}>
                                                    {getOrderStatusMessage(order)}
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">Total</p>
                                                <p className="text-[15px] font-bold text-black">₹{parseFloat(order.total).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {order.items.map((item: any) => (
                                                <Link 
                                                    key={item.id} 
                                                    href={`/product/${item.product.id}`}
                                                    className="flex items-center gap-4 group hover:opacity-80 transition-opacity"
                                                >
                                                    <div className="relative h-16 w-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                                        <img 
                                                            src={Array.isArray(item.product.images) ? item.product.images[0] : (typeof item.product.images === 'string' ? JSON.parse(item.product.images)[0] : '')} 
                                                            alt={item.product.name}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[14px] font-semibold text-black truncate group-hover:text-gold transition-colors">{item.product.name}</h4>
                                                        <p className="text-[13px] text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[14px] font-medium text-black">₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        {order.awbCode && (
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <OrderTracking 
                                                    awbCode={order.awbCode} 
                                                    courierName={order.courierName} 
                                                    shipmentStatus={order.shipmentStatus} 
                                                />
                                            </div>
                                        )}

                                        {/* Help Button */}
                                        <div className="mt-6 pt-5 border-t border-gray-100 flex justify-end">
                                            <Link
                                                href={`/order-help/${order.id}`}
                                                className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-black font-medium transition-colors group"
                                            >
                                                <HelpCircle className="w-4 h-4 group-hover:text-black transition-colors" />
                                                Need help with this order?
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (

                    <div className="animate-in fade-in duration-300 max-w-full">
                        <h1 className="text-[20px] font-bold text-black mb-6 tracking-tight">Profile</h1>
                        
                        <div className="space-y-6">
                            {/* Profile Info Box */}
                            <div className="bg-white rounded-xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-6">
                                <div>
                                    <div 
                                        className="flex items-center gap-2 mb-1 hover:cursor-pointer group w-max"
                                        onClick={() => {
                                            setProfileFormData({
                                                firstName: userInfo.firstName || '',
                                                lastName: userInfo.lastName || '',
                                                receivesOffers: userInfo.receivesOffers || false
                                            });
                                            setIsEditProfileModalOpen(true);
                                        }}
                                    >
                                        <span className="text-[13px] text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Name</span>
                                        <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </div>
                                    <div className="text-[15px] font-medium text-black min-h-[20px]">
                                        {userInfo.firstName || userInfo.lastName ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : ''}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[13px] text-gray-500 font-medium mb-1">Email</div>
                                    <div className="text-[15px] font-medium text-black">{userInfo.email || 'N/A'}</div>
                                </div>
                                {userInfo.phone && (
                                    <div>
                                        <div className="text-[13px] text-gray-500 font-medium mb-1">Phone</div>
                                        <div className="text-[15px] font-medium text-black">{userInfo.phone}</div>
                                    </div>
                                )}
                            </div>

                            <NotificationToggle />

                            {/* Addresses Box */}
                            <div className="bg-white rounded-xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center gap-6 mb-5">
                                    <h2 className="text-[15px] font-bold text-black">Addresses</h2>
                                    <button 
                                        onClick={() => {
                                            setFormData({
                                                firstName: '', lastName: '', address: '', apartment: '',
                                                city: '', state: 'Maharashtra', pinCode: '', phone: '', country: 'India', isDefault: false
                                            });
                                            setEditingAddressId(null);
                                            setIsAddAddressModalOpen(true);
                                        }} 
                                        className="text-[14px] text-gray-600 hover:text-black font-medium flex items-center transition-colors"
                                    >
                                        <span className="mr-1 text-lg font-light leading-none mb-[2px]">+</span> Add
                                    </button>
                                </div>
                                
                                {addresses.length === 0 ? (
                                    <div className="bg-[#fcfcfc] border border-gray-100 rounded-lg p-4 flex items-center justify-start gap-2.5">
                                        <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-[14px] text-gray-600">No addresses added</span>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} className="text-[14.5px] text-black">
                                                <div 
                                                    className="flex items-center gap-2 mb-3 hover:cursor-pointer group w-max"
                                                    onClick={() => openEditModal(addr)}
                                                >
                                                    <span className="text-[13.5px] text-gray-500 font-medium group-hover:text-gray-700 transition-colors">
                                                        {addr.isDefault ? 'Default address' : 'Address'}
                                                    </span>
                                                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </div>
                                                <div className="leading-[1.4] space-y-[2px]">
                                                    <p>{addr.firstName} {addr.lastName}</p>
                                                    {addr.apartment && <p>{addr.apartment}</p>}
                                                    <p>{addr.address}</p>
                                                    <p>{addr.pinCode} {addr.city} {addr.state}</p>
                                                    <p>{addr.country}</p>
                                                    <p>{addr.phone}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sign Out Box */}
                            <div className="flex items-center gap-4 pt-1">
                                <button 
                                    onClick={handleLogout}
                                    className="px-5 py-2 bg-white border border-gray-200 rounded-lg text-[14px] font-medium text-black hover:bg-gray-50 hover:border-gray-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                >
                                    Sign out
                                </button>
                                <span className="text-[13px] text-gray-500 font-medium">Sign out of all devices</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Edit Profile Modal */}
            {isEditProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setIsEditProfileModalOpen(false)}></div>
                    <div className="relative bg-white rounded-xl w-full max-w-[540px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="flex items-center justify-between px-6 pt-6 pb-4">
                            <h3 className="text-[20px] font-bold text-black tracking-tight">Edit profile</h3>
                            <button onClick={() => setIsEditProfileModalOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="px-6 pb-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="text" placeholder="First name" value={profileFormData.firstName} onChange={e => setProfileFormData({...profileFormData, firstName: e.target.value})} className="w-full px-3 py-3.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-500" />
                                    <input type="text" placeholder="Last name" value={profileFormData.lastName} onChange={e => setProfileFormData({...profileFormData, lastName: e.target.value})} className="w-full px-3 py-3.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-500" />
                                </div>

                                <div className="relative">
                                    <label className="block text-[11px] text-gray-500 absolute left-3 top-2 pointer-events-none">Email</label>
                                    <input type="text" readOnly disabled value={userInfo.email || userInfo.phone || ''} className="w-full pt-6 pb-2 px-3 border border-gray-300 rounded-lg text-[14px] text-black bg-white outline-none cursor-not-allowed opacity-80" />
                                </div>

                                <div className="flex items-center gap-3 pt-2 pl-1 cursor-pointer w-max group" onClick={() => setProfileFormData({...profileFormData, receivesOffers: !profileFormData.receivesOffers})}>
                                    <input type="checkbox" checked={profileFormData.receivesOffers} readOnly className="w-[18px] h-[18px] rounded-[4px] border-gray-300 accent-[#333] text-black focus:ring-black cursor-pointer pointer-events-none" />
                                    <label className="text-[14px] text-gray-800 font-medium select-none pointer-events-none group-hover:text-black transition-colors">Email me with news and offers</label>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-5 flex items-center justify-end gap-3 bg-white">
                            <button onClick={() => setIsEditProfileModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-black text-[14px] font-medium rounded-lg shadow-sm transition-all">
                                Cancel
                            </button>
                            <button disabled={isSavingProfile} onClick={handleSaveProfile} className="px-6 py-2.5 bg-[#333333] hover:bg-black text-white text-[14px] font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50">
                                {isSavingProfile ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Overlay */}
            {isAddAddressModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setIsAddAddressModalOpen(false)}></div>
                    <div className="relative bg-white rounded-xl w-full max-w-[540px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4">
                            <h3 className="text-[20px] font-bold text-black tracking-tight">
                                {editingAddressId ? 'Edit address' : 'Add address'}
                            </h3>
                            <button onClick={() => setIsAddAddressModalOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="px-6 pb-6 overflow-y-auto">
                            <div className="space-y-4">
                                {/* Country Select */}
                                <div className="relative bg-white border border-gray-300 rounded-lg focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                                    <label className="block text-[11px] text-gray-500 absolute left-3 top-2 pointer-events-none">Country/region</label>
                                    <select 
                                        className="w-full pt-6 pb-2 px-3 text-[14px] text-black bg-transparent outline-none appearance-none cursor-pointer"
                                        value={formData.country}
                                        onChange={e => setFormData({...formData, country: e.target.value})}
                                    >
                                        <option value="India">India (+91)</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="text" placeholder="First name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-3.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-500" />
                                    <input type="text" placeholder="Last name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-3.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-500" />
                                </div>

                                <input type="text" placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-3.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-500" />
                                <input type="text" placeholder="Apartment, suite, etc (optional)" value={formData.apartment} onChange={e => setFormData({...formData, apartment: e.target.value})} className="w-full px-3 py-3.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-500" />

                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_1fr] gap-4">
                                    <input type="text" placeholder="City" value={formData.city} readOnly={!!formData.city && formData.pinCode.length === 6} onChange={e => setFormData({...formData, city: e.target.value})} className={`w-full px-3 py-3.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-500 ${formData.pinCode.length === 6 && formData.city ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} />
                                    <div className="relative bg-white border border-gray-300 rounded-lg focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all overflow-hidden">
                                        <label className="block text-[11px] text-gray-500 absolute left-3 top-2 pointer-events-none">State</label>
                                        <input 
                                            type="text"
                                            className={`w-full pt-6 pb-2 px-3 text-[14px] text-black outline-none ${formData.pinCode.length === 6 && formData.state ? 'bg-gray-100 cursor-not-allowed' : 'bg-transparent'}`}
                                            value={formData.state}
                                            readOnly={!!formData.state && formData.pinCode.length === 6}
                                            onChange={e => setFormData({...formData, state: e.target.value})}
                                            placeholder="State"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input type="text" placeholder="PIN code (6 digits)" value={formData.pinCode} onChange={handlePinChange} className="w-full px-3 py-3.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-500" />
                                        {isFetchingPin && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                                        )}
                                    </div>
                                </div>

                                <div className="relative bg-white border border-gray-300 rounded-lg focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all overflow-hidden flex items-center">
                                    <div className="w-full relative">
                                        <label className="block text-[11px] text-gray-500 absolute left-3 top-2 pointer-events-none">Phone</label>
                                        <input type="text" placeholder="+91 " value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhoneAsYouType(e.target.value, 'IN')})} className="w-full pt-6 pb-2 pl-3 pr-3 text-[14px] text-black bg-transparent outline-none" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2 pl-1 cursor-pointer w-max group" onClick={() => setFormData({...formData, isDefault: !formData.isDefault})}>
                                    <input type="checkbox" checked={formData.isDefault} readOnly className="w-[18px] h-[18px] rounded-[4px] border-gray-300 accent-[#333] text-black focus:ring-black cursor-pointer pointer-events-none" />
                                    <label className="text-[14px] text-gray-800 font-medium select-none pointer-events-none group-hover:text-black transition-colors">This is my default address</label>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 pt-5 border-t border-gray-100 flex items-center justify-between bg-white w-full">
                            <div>
                                {editingAddressId && (
                                    <button 
                                        disabled={isDeleting}
                                        onClick={handleDeleteAddress} 
                                        className="text-[14px] text-red-500 hover:text-red-600 font-medium decoration-transparent hover:underline hover:underline-offset-4 transition-all disabled:opacity-50"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-5">
                                <button onClick={() => setIsAddAddressModalOpen(false)} className="text-[14px] text-gray-600 hover:text-black font-medium decoration-transparent hover:underline hover:underline-offset-4 transition-all">
                                    Cancel
                                </button>
                                <button disabled={isSaving} onClick={handleSaveAddress} className="px-6 py-2.5 bg-[#333333] hover:bg-black text-white text-[14px] font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50">
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Footer matching screenshot */}
            <footer className="w-full bg-[#fafafa] pb-10">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="border-t border-gray-200 pt-6 flex gap-6 text-[12px] text-gray-500 font-medium">
                        <Link href="#" className="hover:underline underline-offset-2">Refund policy</Link>
                        <Link href="#" className="hover:underline underline-offset-2">Shipping</Link>
                        <Link href="#" className="hover:underline underline-offset-2">Privacy policy</Link>
                        <Link href="#" className="hover:underline underline-offset-2">Terms of service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function OrderTracking({ awbCode, courierName, shipmentStatus }: { awbCode: string, courierName?: string, shipmentStatus?: string }) {
    const [trackingData, setTrackingData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = async () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsExpanded(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/shipping/track/${awbCode}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setTrackingData(data);
            } else {
                setError('Failed to fetch live tracking data');
            }
        } catch (e) {
            setError('An error occurred while fetching tracking details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">Shipment Details</p>
                    <div className="flex items-center gap-3">
                        <span className="text-[14px] font-semibold text-black">{courierName || 'Shiprocket'}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-[14px] text-gray-600 font-mono text-sm">{awbCode}</span>
                    </div>
                </div>
                <button 
                    onClick={handleTrack}
                    className="px-4 py-2 bg-charcoal text-white text-[13px] font-medium rounded hover:bg-black transition-colors flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>
                            <Package className="w-4 h-4" />
                            <span>{isExpanded ? 'Hide Tracking' : 'Track Shipment'}</span>
                        </>
                    )}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4 bg-gray-50 rounded-lg p-5 border border-gray-100">
                    {isLoading ? (
                        <div className="h-24 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                    ) : trackingData && trackingData.tracking_data ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${
                                    trackingData.tracking_data.shipment_status === 7 ? 'bg-green-100 text-green-700' : 
                                    trackingData.tracking_data.shipment_status === 9 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {trackingData.tracking_data.shipment_track?.[0]?.current_status || 'In Transit'}
                                </span>
                                {trackingData.tracking_data.etd && (
                                    <span className="text-[13px] text-gray-600 font-medium ml-auto">
                                        Expected: {new Date(trackingData.tracking_data.etd).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                )}
                            </div>
                            
                            {/* Tracking Timeline */}
                            <div className="relative border-l border-gray-200 ml-3 pl-6 space-y-6">
                                {(() => {
                                    const activities = trackingData.tracking_data.shipment_track_activities || trackingData.tracking_data.shipment_track || [];
                                    if (!activities || activities.length === 0) {
                                        return <p className="text-[14px] text-gray-500">No tracking history available yet.</p>;
                                    }

                                    return activities.map((activity: any, idx: number) => {
                                        const title = activity.activity || activity.current_status || 'Tracking Assigned';
                                        const dateStr = activity.date || activity.updated_time_stamp;
                                        const isValidDate = dateStr && new Date(dateStr).getTime() > 0;

                                        return (
                                            <div key={idx} className="relative">
                                                <div className="absolute -left-[31px] top-1 w-3 h-3 bg-white border-2 border-charcoal rounded-full" />
                                                <p className="text-[14px] font-medium text-black">{title}</p>
                                                {isValidDate ? (
                                                    <p className="text-[12px] text-gray-500 mt-1">
                                                        {activity.location && `${activity.location} • `}
                                                        {new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                ) : (
                                                    <p className="text-[12px] text-gray-500 mt-1">
                                                        Pending courier pickup
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No tracking data available yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}
