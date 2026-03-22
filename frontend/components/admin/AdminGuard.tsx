'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const userInfoStr = localStorage.getItem('userInfo');

            if (!userInfoStr) {
                // Not logged in at all
                router.push('/login');
                return;
            }

            try {
                const userInfo = JSON.parse(userInfoStr);
                if (userInfo.role === 'ADMIN') {
                    // Logged in as Admin
                    setIsAuthorized(true);
                } else {
                    // Logged in but not an Admin (normal user)
                    router.push('/');
                }
            } catch (error) {
                // Invalid JSON or compromised storage
                localStorage.removeItem('userInfo');
                router.push('/login');
            }
        };

        checkAuth();
    }, [router]);

    // Don't render anything (prevent flash of content) until authorized
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-charcoal border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
