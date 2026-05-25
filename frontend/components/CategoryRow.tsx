'use client';

import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
    { name: 'Necklaces', image: '/images/product-3.png', href: '/necklaces' },
    { name: 'Earrings', image: '/images/product-1.png', href: '/earrings' },
    { name: 'Rings', image: '/images/product-4.png', href: '/rings' },
    { name: 'Bracelets', image: '/images/product-1.png', href: '/bracelets' },
    { name: 'Mangalsutras', image: '/images/product-3.png', href: '/mangalsutras' },
    { name: 'Sets', image: '/images/product-2.png', href: '/sets' }
];

export default function CategoryRow() {
    return (
        <section className="w-full pt-10 md:pt-16 pb-4 bg-white">
            <div className="main-container">
                <div className="flex flex-col items-center mb-4 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-outfit text-black uppercase tracking-[0.05em] md:tracking-[0.1em] font-medium text-center">
                        CATEGORIES
                    </h2>
                </div>

                <div className="grid grid-cols-3 lg:grid-cols-6 gap-1 md:gap-2">
                    {CATEGORIES.map((cat) => (
                        <Link key={cat.name} href={cat.href} className="group relative aspect-square overflow-hidden rounded-[10px] shadow-sm hover:shadow-md transition-shadow duration-300 block">
                            <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                            {/* Text Context */}
                            <div className="absolute bottom-3 sm:bottom-5 left-2 sm:left-5 right-2 sm:right-5 flex items-center justify-between text-white/90 group-hover:text-white transition-colors duration-300">
                                <span className="font-outfit font-semibold tracking-wider sm:tracking-[0.15em] font-medium uppercase text-[10px] sm:text-sm border-b border-transparent group-hover:border-white/50 transition-colors duration-300 pb-0.5 leading-tight">
                                    {cat.name}
                                </span>
                                <span className="hidden sm:inline-block opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75">
                                    →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
