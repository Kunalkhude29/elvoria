'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAuthSession } from '@/lib/auth';

type Address = {
    id?: number;
    firstName?: string | null;
    lastName?: string | null;
    address?: string | null;
    apartment?: string | null;
    city?: string | null;
    state?: string | null;
    pinCode?: string | null;
    phone?: string | null;
    country?: string | null;
    isDefault?: boolean;
};

type Profile = {
    id: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    receivesOffers: boolean;
    addresses?: Address[];
    authenticatedUserId?: string | null;
};

type AuthContextType = {
    user: Profile | null; // Using Profile as the user object
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => {},
    refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<Profile | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const clearAuthState = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setProfile(null);
        setUser(null);
    }, []);

    const fetchProfile = useCallback(async (token: string, authenticatedUserId: string | null = null) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.ok) {
                const data = await res.json();
                const enrichedProfile = {
                    ...data,
                    authenticatedUserId: authenticatedUserId || data.id,
                };
                setProfile(enrichedProfile);
                setUser(enrichedProfile);
                localStorage.setItem('userInfo', JSON.stringify(enrichedProfile));
            } else if (res.status === 401) {
                clearAuthState();
            }
        } catch (err) {
            console.error('[AUTH CONTEXT] Error fetching profile:', err);
        }
    }, [clearAuthState]);

    const signOut = useCallback(async () => {
        clearAuthState();
        window.location.href = '/';
    }, [clearAuthState]);

    const refreshProfile = useCallback(async () => {
        const session = await getAuthSession();
        if (session) {
            await fetchProfile(session.token);
        }
    }, [fetchProfile]);

    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            try {
                // 1. Show cached user immediately — zero-delay render
                const cachedUser = localStorage.getItem('userInfo');
                if (cachedUser) {
                    try {
                        const parsedUser = JSON.parse(cachedUser);
                        setUser(parsedUser);
                        setProfile(parsedUser);
                    } catch {
                        localStorage.removeItem('userInfo');
                    }
                }

                // 2. Validate session & refresh profile silently in background
                const session = await getAuthSession();
                if (session) {
                    await fetchProfile(session.token);
                } else {
                    // No valid session — clear any stale cache
                    clearAuthState();
                }
            } catch (err) {
                console.error('[AUTH CONTEXT] Init error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount only — fetchProfile & clearAuthState are stable useCallback refs

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
