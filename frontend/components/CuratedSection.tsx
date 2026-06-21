import Link from 'next/link';
import Image from 'next/image';

const CURATED_ITEMS = [
    { key: 'wedding',    name: 'Wedding',    defaultImage: '/images/product-3.png', href: '/wedding' },
    { key: 'daily-wear', name: 'Daily Wear', defaultImage: '/images/product-1.png', href: '/daily-wear' },
    { key: 'gifting',    name: 'Gifting',    defaultImage: '/images/product-2.png', href: '/gifting' },
];

async function getCuratedImages(): Promise<Record<string, string>> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const res = await fetch(`${apiUrl}/api/homepage-images`, { next: { revalidate: 60 } });
        if (!res.ok) return {};
        const data: { key: string; image: string }[] = await res.json();
        const map: Record<string, string> = {};
        data.forEach(d => { map[d.key] = d.image; });
        return map;
    } catch {
        return {};
    }
}

export default async function CuratedSection() {
    const dbImages = await getCuratedImages();

    const items = CURATED_ITEMS.map(item => ({
        ...item,
        image: dbImages[item.key] || item.defaultImage,
    }));

    return (
        <section className="w-full pt-6 md:pt-10 pb-4">
            <div className="main-container">
                <div className="flex flex-col items-center mb-4 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-outfit text-black uppercase tracking-[0.05em] md:tracking-[0.1em] font-medium text-center">
                        CURATED FOR YOU
                    </h2>
                </div>
            </div>

            {/* Unified Responsive Layout (1 Full Width, 2 Side-by-Side) */}
            <div className="flex flex-col gap-4 md:gap-6">
                {/* 1st Card: Full-width Edge-to-Edge Banner */}
                <Link href={items[0].href} className="group relative w-full overflow-hidden block">
                    <Image
                        src={items[0].image}
                        alt={items[0].name}
                        width={1920}
                        height={1080}
                        unoptimized={items[0].image.startsWith('http')}
                        className="w-full h-auto block"
                    />
                </Link>

                {/* 2nd & 3rd Cards: Side-by-side vertical cards */}
                <div className="main-container">
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        {[items[1], items[2]].map((item) => (
                            <Link key={item.name} href={item.href} className="group flex flex-col bg-[#f5f4f0] rounded-[10px] overflow-hidden">
                                <div className="relative aspect-[1.05] md:aspect-[1.25] w-full overflow-hidden bg-gray-100">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        unoptimized={item.image.startsWith('http')}
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="py-4 md:py-6 px-2 flex items-center justify-center gap-1 bg-[#f5f4f0] group-hover:bg-[#ebeae5] transition-colors duration-300">
                                    <span className="text-[13px] md:text-base font-outfit font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5 md:gap-2">
                                        {item.name}
                                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-charcoal transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10" fill="currentColor" />
                                            <path d="M10 8L14 12L10 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
