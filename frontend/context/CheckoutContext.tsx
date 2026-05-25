'use client';

import React, { createContext, useContext, useState } from 'react';

interface CheckoutContextType {
    isCheckoutOpen: boolean;
    openCheckout: () => void;
    closeCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const openCheckout = () => setIsCheckoutOpen(true);
    const closeCheckout = () => setIsCheckoutOpen(false);

    return (
        <CheckoutContext.Provider value={{ isCheckoutOpen, openCheckout, closeCheckout }}>
            {children}
        </CheckoutContext.Provider>
    );
}

export function useCheckout() {
    const context = useContext(CheckoutContext);
    if (context === undefined) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
}
