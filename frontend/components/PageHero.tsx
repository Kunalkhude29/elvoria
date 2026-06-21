'use client';

import Image from 'next/image';
import { cloudinaryUrl, isCloudinaryUrl } from '@/lib/cloudinary';

interface PageHeroProps {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    mobileImage?: string;
    offerText?: string;
    ctaText?: string;
    priority?: boolean;
}

export default function PageHero({ title, subtitle, backgroundImage, mobileImage, offerText, ctaText, priority = true }: PageHeroProps) {
    if (!backgroundImage) return null;

    return (
        <section className="relative w-full overflow-hidden bg-gray-50">
            {/* ── DESKTOP: Natural aspect ratio — zero cropping, full image visible ── */}
            <div className="relative hidden md:block w-full">
                <Image
                    src={cloudinaryUrl(backgroundImage)}
                    alt={title || 'Collection Banner'}
                    width={1920}
                    height={1080}
                    priority={priority}
                    unoptimized={!isCloudinaryUrl(backgroundImage)}
                    className="w-full h-auto block"
                />
            </div>

            {/* ── MOBILE ── */}
            {mobileImage ? (
                <div className="relative block md:hidden w-full">
                    <Image
                        src={cloudinaryUrl(mobileImage)}
                        alt={title || 'Mobile Banner'}
                        width={1080}
                        height={1920}
                        priority={priority}
                        unoptimized={!isCloudinaryUrl(mobileImage)}
                        className="w-full h-auto block"
                    />
                </div>
            ) : (
                <div className="relative block md:hidden h-[70vh] w-full overflow-hidden">
                    <Image
                        src={cloudinaryUrl(backgroundImage)}
                        alt={title || 'Collection Banner'}
                        fill
                        priority={priority}
                        unoptimized={!isCloudinaryUrl(backgroundImage)}
                        className="object-cover object-top"
                    />
                </div>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center text-center p-6 bg-black/20">
                <div className="relative z-10 flex flex-col items-center justify-center px-4">
                    {offerText && (
                        <span className="text-gold font-outfit font-bold uppercase tracking-[0.3em] text-xs md:text-sm mb-4 drop-shadow-md">
                            {offerText}
                        </span>
                    )}
                    {title && (
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-outfit font-bold text-white mb-4 md:text-6 md:mb-6 drop-shadow-lg capitalize">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="text-sm md:text-xl lg:text-2xl font-outfit text-white/95 mb-8 md:mb-10 max-w-2xl drop-shadow-md">
                            {subtitle}
                        </p>
                    )}
                    {ctaText && (
                        <button className="px-8 py-3 md:px-10 md:py-4 bg-white text-charcoal font-outfit font-semibold font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-gold hover:text-white transition-all rounded-full shadow-xl hover:scale-105 active:scale-95">
                            {ctaText}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
