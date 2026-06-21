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

    if (!banner && loading) return <div className="h-[70vh] md:h-[85vh] w-full bg-gray-50 animate-pulse" />;
    if (!banner) return null;

    const bannerTitle = banner.title || "";
    const bannerSubtitle = banner.subtitle || "";
    const bannerOffer = banner.offerText || "";
    const bannerCta = banner.ctaText || "Shop Now";

    return (
        <section className="w-full">
            {/* ── DESKTOP: Natural aspect ratio — zero cropping, full image visible ── */}
            <div className="relative hidden md:block w-full">
                <Image
                    src={cloudinaryUrl(banner.image)}
                    alt={bannerTitle}
                    width={1920}
                    height={1080}
                    priority
                    unoptimized={!isCloudinaryUrl(banner.image)}
                    className="w-full h-auto block"
                />
            </div>

            {/* ── MOBILE ── */}
            {banner.mobileImage ? (
                <div className="relative block md:hidden w-full">
                    <Image
                        src={cloudinaryUrl(banner.mobileImage)}
                        alt={bannerTitle}
                        width={1080}
                        height={1920}
                        priority
                        unoptimized={!isCloudinaryUrl(banner.mobileImage)}
                        className="w-full h-auto block"
                    />
                </div>
            ) : (
                <div className="relative block md:hidden h-[70vh] w-full overflow-hidden">
                    <Image
                        src={cloudinaryUrl(banner.image)}
                        alt={bannerTitle}
                        fill
                        priority
                        unoptimized={!isCloudinaryUrl(banner.image)}
                        className="object-cover object-top"
                    />
                </div>
            )}
        </section>
    );
}
