'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { cloudinaryUrl, isCloudinaryUrl } from '@/lib/cloudinary';

interface ProductProps {
    id: string;
    name: string;
    price: number;
    originalPrice?: number | null;
    image: string;
    category: string;
    stock: number;
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
                category: product.category || 'Jewellery',
                stock: product.stock
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
            category: product.category,
            stock: product.stock,
            quantity: 1
        });

        setIsAdded(true);
        openCart(); // Slide drawer open

        // Reset the icon after 2 seconds
        setTimeout(() => setIsAdded(false), 2000);
    };

    const prefetchProductData = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        fetch(`${apiUrl}/api/products/${product.id}`, { priority: 'low' }).catch(() => {});
    };

    return (
        <div className="group relative" onMouseEnter={prefetchProductData}>
            <Link href={`/product/${product.id}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-4 rounded-lg">
                    {product.image ? (
                        <>
                            {console.log(`[ProductCard] product ID ${product.id} image URL:`, cloudinaryUrl(product.image))}
                            <Image
                                src={cloudinaryUrl(product.image)}
                                alt={product.name}
                                fill
                                unoptimized={!isCloudinaryUrl(product.image)}
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </>
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
                </div>
            </Link>

            {/* Quick Actions (Hover) */}
            <div className="absolute bottom-28 md:bottom-32 right-3 md:right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <button
                    onClick={toggleWishlist}
                    className={`p-2 rounded-full shadow-sm transition-colors ${isWished ? 'bg-gold text-white' : 'bg-white hover:bg-gold hover:text-white'}`}
                    aria-label="Add to Wishlist"
                >
                    <Heart className="w-3.5 h-3.5 md:w-4 md:h-4" fill={isWished ? 'currentColor' : 'none'} />
                </button>
                <button
                    onClick={handleQuickAdd}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-gold hover:text-white transition-colors"
                    aria-label="Add to Cart"
                >
                    {isAdded ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" /> : <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                </button>
            </div>

            {/* Product Info */}
            <Link href={`/product/${product.id}`} className="block text-left mt-3">
                <h3 className="text-sm md:text-base font-outfit font-medium text-charcoal/90 hover:text-gold transition-colors truncate">{product.name}</h3>
                <div className="flex items-center justify-start gap-2 mt-1">
                    <p className="text-sm md:text-base font-outfit font-semibold text-charcoal">₹{Number(product.price).toFixed(2)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs md:text-sm font-outfit font-normal text-charcoal/40 line-through">₹{Number(product.originalPrice).toFixed(2)}</p>
                    )}
                </div>
            </Link>
        </div>
    );
}
