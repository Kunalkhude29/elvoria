import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
    { name: 'Necklaces', image: '/images/product-3.png', href: '/necklaces' },
    { name: 'Rings', image: '/images/product-4.png', href: '/rings' },
    { name: 'Bracelets', image: '/images/product-1.png', href: '/bracelets' },
    { name: 'Earrings', image: '/images/product-1.png', href: '/earrings' },
    { name: 'Charms', image: '/images/product-3.png', href: '/charms' },
    { name: 'Gift Sets', image: '/images/product-2.png', href: '/gifts' }
];

export default function PopularCategories() {
    return (
        <section className="w-full py-10 md:py-16">
            <div className="main-container">
                <h2 className="text-xl md:text-2xl font-outfit text-center text-charcoal mb-4 md:mb-8">Popular Categories</h2>

                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {CATEGORIES.map((cat) => (
                        <Link key={cat.name} href={cat.href} className="group flex flex-col items-center">
                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[10px] overflow-hidden border border-gray-100 group-hover:border-gold transition-colors duration-300">
                                <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <span className="mt-4 text-xs uppercase tracking-widest text-charcoal group-hover:text-gold transition-colors">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
