'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductProps {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    isNew?: boolean;
    isSale?: boolean;
}

export default function ProductCard({ product }: { product: ProductProps }) {
    const { addToCart, openCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [isAdded, setIsAdded] = useState(false);
    const pathname = usePathname();

    const isWished = isInWishlist(product.id);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isWished) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category || 'Jewellery'
            }, pathname);
        }
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if this was accidentally wrapped in a link

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });

        setIsAdded(true);
        openCart(); // Slide drawer open

        // Reset the icon after 2 seconds
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="group relative">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex justify-center items-center text-xs text-charcoal/40 font-medium">
                        NO IMAGE
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isNew && <span className="px-2 py-1 text-[10px] uppercase font-medium bg-white text-charcoal">New</span>}
                    {product.isSale && <span className="px-2 py-1 text-[10px] uppercase font-medium bg-gold text-white">Sale</span>}
                </div>

                {/* Quick Actions (Hover) */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={toggleWishlist}
                        className={`p-2 rounded-full shadow-sm transition-colors ${isWished ? 'bg-gold text-white' : 'bg-white hover:bg-gold hover:text-white'}`}
                        aria-label="Add to Wishlist"
                    >
                        <Heart className="w-4 h-4" fill={isWished ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={handleQuickAdd}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-gold hover:text-white transition-colors"
                        aria-label="Add to Cart"
                    >
                        {isAdded ? <Check className="w-4 h-4 text-green-500" /> : <ShoppingBag className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="text-center">
                <p className="text-xs text-charcoal/60 uppercase tracking-widest mb-1">{product.category}</p>
                <Link href={`/product/${product.id}`}>
                    <h3 className="text-base font-serif text-charcoal hover:text-gold transition-colors truncate">{product.name}</h3>
                </Link>
                <p className="text-sm font-medium text-charcoal mt-1">${Number(product.price).toFixed(2)}</p>
            </div>
        </div>
    );
}
