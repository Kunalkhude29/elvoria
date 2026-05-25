'use client';

import Image from 'next/image';
import { cloudinaryUrl, isCloudinaryUrl } from '@/lib/cloudinary';

interface PageHeroProps {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    offerText?: string;
    ctaText?: string;
    priority?: boolean;
}

export default function PageHero({ title, subtitle, backgroundImage, offerText, ctaText, priority = true }: PageHeroProps) {
    if (!backgroundImage) return null;

    return (
        <section className="relative w-full overflow-hidden aspect-[21/9] md:aspect-[2726/1158] bg-gray-50">
            {/* Optimized Background Image */}
            <Image
                src={cloudinaryUrl(backgroundImage)}
                alt={title || 'Collection Banner'}
                fill
                priority={priority}
                unoptimized={!isCloudinaryUrl(backgroundImage)}
                className="object-cover"
            />

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
