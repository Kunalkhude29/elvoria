'use client';

import Navbar from '../../components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist, WishlistItem } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, activeNavTab } = useWishlist();
    const { addToCart, openCart } = useCart();
    const [movingItem, setMovingItem] = useState<string | null>(null);

    const getRedirectUrl = () => {
        if (!activeNavTab) return '/';
        if (activeNavTab === '/women') return '/';
        return activeNavTab;
    };

    const redirectUrl = getRedirectUrl();

    const handleMoveToCart = (item: WishlistItem) => {
        setMovingItem(item.id);

        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category || 'Jewellery',
            stock: item.stock ?? 10,
            quantity: 1
        });

        removeFromWishlist(item.id);

        setTimeout(() => {
            setMovingItem(null);
            openCart();
        }, 500);
    };

    return (
        <div className="min-h-screen bg-ivory flex flex-col">
            <Navbar />

            {wishlist.length === 0 ? (
                <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
                    <h1 className="text-2xl md:text-5xl font-serif text-charcoal mb-3 md:mb-4 text-center">Your Wishlist is Waiting.</h1>
                    <p className="text-charcoal/60 text-center max-w-[500px] mb-8 md:mb-10 text-sm md:text-base">
                        Save your favorite pieces and revisit them anytime.
                    </p>
                    <Link
                        href={redirectUrl}
                        className="px-8 py-3 lg:py-4 bg-transparent border border-charcoal text-charcoal rounded-md text-xs md:text-sm font-medium tracking-widest uppercase hover:bg-charcoal hover:text-white transition-all duration-300"
                    >
                        CONTINUE SHOPPING
                    </Link>
                </main>
            ) : (
                <main className="flex-1 container mx-auto px-6 pt-24 md:pt-32 pb-16 md:pb-24">
                    <div className="flex items-end justify-between mb-6 md:mb-12 border-b border-gray-200 pb-4">
                        <h1 className="text-2xl md:text-3xl font-serif text-charcoal">Your Wishlist</h1>
                        <span className="text-sm text-charcoal/60 uppercase tracking-widest">{wishlist.length} Items</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {wishlist.map(item => (
                            <div key={item.id} className="group relative flex flex-col">
                                <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
                                    <Image
                                        src={item.image || '/images/hero.png'}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        unoptimized
                                    />
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => removeFromWishlist(item.id)}
                                            className="p-2 bg-white rounded-full shadow-sm hover:text-red-500 transition-colors"
                                            aria-label="Remove from Wishlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="text-center flex-1 flex flex-col">
                                    <p className="text-xs text-charcoal/60 uppercase tracking-widest mb-1">{item.category}</p>
                                    <Link href={`/product/${item.id}`} className="flex-1 block">
                                        <h3 className="text-base font-serif text-charcoal hover:text-gold transition-colors truncate mb-1">{item.name}</h3>
                                    </Link>
                                    <p className="text-sm font-medium text-charcoal mb-4">₹{Number(item.price).toFixed(2)}</p>

                                    <button
                                        onClick={() => handleMoveToCart(item)}
                                        disabled={movingItem === item.id}
                                        className="w-full py-3 bg-transparent border border-charcoal text-charcoal text-xs font-medium uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all duration-300 disabled:opacity-50"
                                    >
                                        {movingItem === item.id ? 'Moving...' : 'Move to Cart'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            )}
        </div>
    );
}
