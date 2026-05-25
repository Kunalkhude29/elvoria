import Link from 'next/link';
import Image from 'next/image';

const HIGHLIGHTS = [
    {
        title: "Just Launched",
        subtitle: "Deck The Halls",
        button: "See More",
        image: "/images/highlight-1.jpg", // Placeholder
        link: "/new-arrivals"
    },
    {
        title: "Flat 20% Off",
        subtitle: "Necklaces & Body Jewels",
        button: "Shop Now",
        image: "/images/highlight-2.jpg", // Placeholder
        link: "/necklaces"
    },
    {
        title: "New Collection",
        subtitle: "Jewelry & Charm Rings",
        button: "Shop Now",
        image: "/images/highlight-3.jpg", // Placeholder
        link: "/rings"
    }
];

export default function HighlightSection() {
    return (
        <section className="w-full py-16">
            <div className="main-container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {HIGHLIGHTS.map((item, idx) => (
                        <div key={idx} className="relative group overflow-hidden bg-beige/30 h-[300px] flex items-center justify-center text-center rounded-[10px]">
                            {/* Placeholder for real image */}
                            <div className="absolute inset-0 bg-gray-200 animate-pulse group-hover:bg-gray-300 transition-colors" />

                            <div className="relative z-10 px-6">
                                <h3 className="text-sm uppercase tracking-widest text-charcoal/60 mb-2">{item.title}</h3>
                                <h2 className="text-2xl font-outfit text-charcoal mb-6">{item.subtitle}</h2>
                                <Link href={item.link} className="inline-block border-b border-charcoal text-sm uppercase tracking-wider pb-1 hover:text-gold hover:border-gold transition-colors">
                                    {item.button}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
