'use client';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SearchProvider } from './context/SearchContext';
import { CheckoutProvider } from './context/CheckoutContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <WishlistProvider>
                <SearchProvider>
                    <CheckoutProvider>
                        {children}
                    </CheckoutProvider>
                </SearchProvider>
            </WishlistProvider>
        </CartProvider>
    );
}
