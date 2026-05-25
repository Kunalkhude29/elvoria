'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cloudinaryUrl, isCloudinaryUrl } from '@/lib/cloudinary';

// Module-level cache for Hero banner
let _cachedHeroBanner: any = null;

export default function Hero({ initialBanner }: { initialBanner?: any }) {
    const [banner, setBanner] = useState<any>(_cachedHeroBanner || initialBanner || null);
    const [loading, setLoading] = useState(!banner);

    useEffect(() => {
        let isMounted = true;
        
        // If we already have a banner from SSR or cache, we can skip the initial loading state
        if (banner && !loading) {
            // Still refresh in background to keep cache updated
        }

        const fetchBanner = async () => {
            try {
                // If we already have a cached version, use it but still refresh in background
                if (_cachedHeroBanner) {
                    if (isMounted) setBanner(_cachedHeroBanner);
                    setLoading(false);
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/collections`, { next: { revalidate: 60 } } as RequestInit);
                if (res.ok) {
                    const collections = await res.json();
                    // Look for 'Women' collection
                    const womenCollection = collections.find((c: any) => 
                        c.isActive && c.name.toLowerCase() === 'women'
                    );

                    if (womenCollection && womenCollection.banners && womenCollection.banners.length > 0) {
                        const activeBanner = womenCollection.banners.find((b: any) => b.isActive);
                        if (activeBanner) {
                            _cachedHeroBanner = activeBanner;
                            if (isMounted) setBanner(activeBanner);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch hero banner", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchBanner();
        return () => { isMounted = false; };
    }, [banner, loading]);

    if (!banner && loading) return <div className="h-[85vh] w-full bg-gray-50 animate-pulse" />;
    if (!banner) return null;

    const bannerTitle = banner.title || "";
    const bannerSubtitle = banner.subtitle || "";
    const bannerOffer = banner.offerText || "";
    const bannerCta = banner.ctaText || "Shop Now";

    return (
        <section className="relative h-[85vh] w-full overflow-hidden">
            <Image
                src={cloudinaryUrl(banner.image)}
                alt={bannerTitle}
                fill
                priority
                unoptimized={!isCloudinaryUrl(banner.image)}
                className="object-cover"
            />
            <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center text-center px-4">
                <div className="max-w-3xl">
                    {bannerOffer && (
                        <span className="text-white font-outfit uppercase tracking-[0.3em] text-sm mb-4 block drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-normal">
                            {bannerOffer}
                        </span>
                    )}
                    
                    {bannerTitle && (
                        <h1 className="text-5xl md:text-7xl text-white font-outfit font-normal mb-8 tracking-tight leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] uppercase">
                            {bannerTitle.includes(' ') ? (
                                <>
                                    {bannerTitle.substring(0, bannerTitle.lastIndexOf(' '))} <br />
                                    {bannerTitle.substring(bannerTitle.lastIndexOf(' ') + 1)}
                                </>
                            ) : bannerTitle}
                        </h1>
                    )}
                    {bannerSubtitle && (
                        <p className="text-lg md:text-xl text-white font-outfit max-w-xl mx-auto mb-10 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
                            {bannerSubtitle}
                        </p>
                    )}

                </div>
            </div>
        </section>
    );
}
