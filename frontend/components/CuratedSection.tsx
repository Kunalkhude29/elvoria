'use client';

import Link from 'next/link';
import Image from 'next/image';

const CURATED_ITEMS = [
    { name: 'Wedding', image: '/images/product-3.png', href: '/wedding' },
    { name: 'Daily Wear', image: '/images/product-1.png', href: '/daily-wear' },
    { name: 'Gifting', image: '/images/product-2.png', href: '/gifting' }
];

export default function CuratedSection() {
    return (
        <section className="container py-16">
            <h2 className="text-center text-2xl font-serif text-charcoal mb-10 uppercase tracking-widest">Curated For You</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CURATED_ITEMS.map((item) => (
                    <Link key={item.name} href={item.href} className="group relative h-[400px] overflow-hidden block">
                        <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />

                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-2xl font-serif tracking-wide uppercase group-hover:translate-x-2 transition-transform duration-300">{item.name}</h3>
                            <span className="text-xs uppercase tracking-widest border-b border-white pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Shop Now</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
