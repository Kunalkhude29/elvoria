'use client';

import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
    { name: 'Necklaces', image: '/images/product-3.png', href: '/necklaces' },
    { name: 'Earrings', image: '/images/product-1.png', href: '/earrings' },
    { name: 'Rings', image: '/images/product-4.png', href: '/rings' },
    { name: 'Bracelets', image: '/images/product-1.png', href: '/bracelets' },
    { name: 'Anklets', image: '/images/product-3.png', href: '/anklets' },
    { name: 'Bangles', image: '/images/product-1.png', href: '/bangles' },
    { name: 'Sets', image: '/images/product-2.png', href: '/sets' }
];

export default function CategoryRow() {
    return (
        <section className="w-full py-16 bg-[#fffaf5]">
            <div className="container mx-auto px-6">
                <h2 className="text-center text-3xl font-serif text-charcoal mb-12 uppercase tracking-widest">Categories</h2>

                <div className="flex overflow-x-auto gap-12 pb-8 snap-x snap-mandatory scrollbar-hide justify-start lg:justify-center px-4">
                    {CATEGORIES.map((cat) => (
                        <Link key={cat.name} href={cat.href} className="group flex flex-col items-center min-w-[120px] snap-start">
                            <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden border border-gray-100 shadow-md group-hover:shadow-lg transition-all duration-500">
                                <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {/* Overlay/Tint on hover (optional, but adds depth) */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                            </div>
                            <span className="mt-5 text-sm uppercase tracking-widest text-charcoal group-hover:text-black font-medium transition-colors duration-300">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
