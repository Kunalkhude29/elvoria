'use client';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SearchProvider } from './context/SearchContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { AuthProvider } from './context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <CartProvider>
            <WishlistProvider>
                <SearchProvider>
                    <CheckoutProvider>
                        {children}
                    </CheckoutProvider>
                </SearchProvider>
            </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}
