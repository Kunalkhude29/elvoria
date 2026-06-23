'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const stores = [
    {
        id: 1,
        title: "Shweta One Gram Gold, Karad",
        address: "Near Bank of India, Raviwar Peth,\nKarad, Maharashtra 415110",
        link: "https://www.google.com/maps/place/Shweta+one+gram+Gold,+KARAD/@17.2881971,74.1797995,17z/data=!3m1!4b1!4m6!3m5!1s0x3bc18300657005a9:0xa57b041a13f4f374!8m2!3d17.2881971!4d74.1797995!16s%2Fg%2F11vyl_xrc3?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D",
        image: "/images/store-image-1.jpeg"
    },
    {
        id: 2,
        title: "Shweta One Gram Gold, Satara",
        address: "Near Shete Chowk, Lokmat Building,\nSatara, Maharashtra 415002",
        link: "https://www.google.com/maps/place/Shweta+One+Gram+Gold+Satara/data=!4m2!3m1!1s0x0:0x6e6284c670ee333c?sa=X&ved=1t:2428&ictx=111",
        image: "/images/store-image-2.jpeg"
    },
    {
        id: 3,
        title: "Shweta One Gram Gold, Ishwarpur",
        address: "Gandhi Chowk, Opposite to Bombay Tailor,\nIshwarpur, Maharashtra 415409",
        link: "https://www.google.com/maps/place/SHWETA+ONE+GRAM+GOLD,+ishwarpur/@17.0494386,74.2650749,17z/data=!4m6!3m5!1s0x3bc17500494a4fc7:0xd7172961cbc18215!8m2!3d17.0494386!4d74.2650749!16s%2Fg%2F11zg6_4890?hl=en-GB&entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D",
        image: "/images/store-image-3.jpeg"
    }
];

export default function VisitOurStores() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const nextStore = () => setCurrentIndex((prev) => (prev + 1) % stores.length);
    const prevStore = () => setCurrentIndex((prev) => (prev === 0 ? stores.length - 1 : prev - 1));

    // Optional auto-slide every 5 seconds
    useEffect(() => {
        const timer = setInterval(nextStore, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDragging(true);
        if ('touches' in e) {
            setTouchStartX(e.touches[0].clientX);
        } else {
            setTouchStartX((e as React.MouseEvent).clientX);
        }
    };

    const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging) return;
        if ('touches' in e) {
            setTouchEndX(e.touches[0].clientX);
        } else {
            setTouchEndX((e as React.MouseEvent).clientX);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        if (!touchStartX || !touchEndX) return;
        
        const distance = touchStartX - touchEndX;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextStore();
        } else if (isRightSwipe) {
            prevStore();
        }
        
        // Reset values
        setTouchStartX(0);
        setTouchEndX(0);
    };

    const activeStore = stores[currentIndex];

    return (
        <section className="w-full pb-16 pt-8 md:pb-24 md:pt-4 bg-white overflow-hidden">
            <div className="main-container max-w-6xl mx-auto px-4">
                <h2 className="text-center text-xl md:text-2xl font-outfit text-charcoal mb-10 md:mb-16 uppercase tracking-[0.05em] md:tracking-[0.1em]">
                    Visit Our Stores
                </h2>
                
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                    {/* Image Section */}
                    <div 
                        className="w-full md:w-1/2 aspect-[4/5] md:aspect-square bg-gray-50 overflow-hidden shadow-sm relative group cursor-grab active:cursor-grabbing"
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDragMove}
                        onTouchEnd={handleDragEnd}
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        style={{ userSelect: 'none' }}
                    >
                        {stores.map((store, index) => (
                            <div
                                key={store.id}
                                className={`absolute inset-0 transition-opacity duration-700 ${
                                    index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                }`}
                            >
                                <Image 
                                    src={store.image} 
                                    alt={`Store located in ${store.title}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority={index === 0}
                                    draggable="false"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                                />
                            </div>
                        ))}
                        {/* Fallback overlay if image hasn't loaded or isn't uploaded yet */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-0">
                            <span className="text-sm font-outfit tracking-widest text-gray-400 uppercase text-center px-4">
                                Loading store images...
                            </span>
                        </div>
                    </div>

                    {/* Store Details Section with Slider Controls */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left relative min-h-[250px]">
                        
                        {/* Content */}
                        <div className="space-y-6 transition-opacity duration-500">
                            <h3 className="text-2xl md:text-3xl font-outfit font-bold tracking-widest uppercase text-charcoal">
                                {activeStore.title}
                            </h3>
                            <p className="text-base md:text-lg text-charcoal/70 leading-relaxed max-w-md mx-auto md:mx-0 font-outfit whitespace-pre-line">
                                {activeStore.address}
                            </p>
                            
                            <div className="pt-4">
                                <a 
                                    href={activeStore.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block px-8 py-4 bg-charcoal text-white text-sm font-bold tracking-[0.15em] uppercase hover:bg-black transition-colors"
                                >
                                    Get Directions
                                </a>
                            </div>
                        </div>

                        {/* Slider Dots */}
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-12">
                            {stores.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                        idx === currentIndex ? 'bg-charcoal w-8' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Go to store ${idx + 1}`}
                                />
                            ))}
                        </div>
                        
                    </div>
                </div>
            </div>
        </section>
    );
}
