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
        <section className="w-full pt-6 md:pt-10 pb-4">
            <div className="main-container">
                <div className="flex flex-col items-center mb-4 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-outfit text-black uppercase tracking-[0.05em] md:tracking-[0.1em] font-medium text-center">
                        CURATED FOR YOU
                    </h2>
                </div>

                {/* Mobile-only Layout */}
                <div className="flex flex-col gap-4 md:hidden">
                    {/* 1st Card: Full-width Horizontal Banner */}
                    <Link href={CURATED_ITEMS[0].href} className="group relative h-[180px] overflow-hidden block rounded-[10px]">
                        <Image
                            src={CURATED_ITEMS[0].image}
                            alt={CURATED_ITEMS[0].name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                        <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="text-xl font-outfit tracking-[0.15em] uppercase">{CURATED_ITEMS[0].name}</h3>
                            <span className="text-[10px] font-outfit font-semibold uppercase tracking-[0.2em] border-b border-white pb-0.5 block w-fit mt-1">Shop Now</span>
                        </div>
                    </Link>

                    {/* 2nd & 3rd Cards: Side-by-side vertical cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {[CURATED_ITEMS[1], CURATED_ITEMS[2]].map((item) => (
                            <Link key={item.name} href={item.href} className="group flex flex-col bg-[#f5f4f0] rounded-[10px] overflow-hidden">
                                <div className="relative aspect-[1.05] w-full overflow-hidden bg-gray-100">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="py-4 px-2 flex items-center justify-center gap-1 bg-[#f5f4f0] group-hover:bg-[#ebeae5] transition-colors duration-300">
                                    <span className="text-[13px] font-outfit font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                                        {item.name}
                                        <svg className="w-3.5 h-3.5 text-charcoal transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10" fill="currentColor" />
                                            <path d="M10 8L14 12L10 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Desktop-only Layout */}
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                    {CURATED_ITEMS.map((item) => (
                        <Link key={item.name} href={item.href} className="group relative h-[400px] overflow-hidden block rounded-[10px]">
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />

                            <div className="absolute bottom-6 left-6 text-white">
                                <h3 className="text-2xl font-outfit tracking-[0.15em] uppercase group-hover:translate-x-2 transition-transform duration-300">{item.name}</h3>
                                <span className="text-xs font-outfit font-semibold uppercase tracking-[0.2em] border-b border-white pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 block w-fit mt-1">Shop Now</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
