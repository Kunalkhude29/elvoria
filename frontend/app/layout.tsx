import type { Metadata } from 'next';
import { Archivo_Narrow } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { AuthProvider } from '../context/AuthContext';
import { SearchProvider } from '../context/SearchContext';
import { CheckoutProvider } from '../context/CheckoutContext';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import SearchOverlay from '../components/SearchOverlay';
import CheckoutDrawer from '../components/CheckoutDrawer';

const archivoNarrow = Archivo_Narrow({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-archivo',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'SHWETA | Premium Jewellery',
    description: 'Discover exquisite jewellery collections at SHWETA. Shop rings, necklaces, earrings and more.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={archivoNarrow.variable}>
            <body className="font-archivo bg-white antialiased">
                <AuthProvider>
                    <SearchProvider>
                        <CartProvider>
                            <CheckoutProvider>
                                <WishlistProvider>
                                    <main className="min-h-screen">
                                        {children}
                                    </main>
                                    <CartDrawer />
                                    <SearchOverlay />
                                    <CheckoutDrawer />
                                    <Footer />
                                </WishlistProvider>
                            </CheckoutProvider>
                        </CartProvider>
                    </SearchProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
