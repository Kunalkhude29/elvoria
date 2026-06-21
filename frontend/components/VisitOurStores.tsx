'use client';

import React, { useState, useEffect } from 'react';

const stores = [
    {
        id: 1,
        title: "Shweta One Gram Gold, Karad",
        address: "Near Bank of India, Raviwar Peth,\nKarad, Maharashtra 415110",
        link: "https://www.google.com/maps/place/17%C2%B017'17.8%22N+74%C2%B010'47.5%22E/@17.288369,74.1798954,3a,75y,267.77h,99.63t/data=!3m7!1e1!3m5!1soSigSNnATd784rHEmXamUg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-9.627333716489588%26panoid%3DoSigSNnATd784rHEmXamUg%26yaw%3D267.76821361862426!7i16384!8i8192!4m4!3m3!8m2!3d17.2882786!4d74.179863?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D",
        image: "/images/store-image-1.jpeg"
    },
    {
        id: 2,
        title: "Shweta One Gram Gold, Satara",
        address: "Near Shete Chowk, Lokmat Building,\nSatara, Maharashtra 415002",
        link: "https://www.google.com/maps/place/42b,+Khalcha+Rasta,+Shete+Chowk,+Rajeshpura+Peth,+Satara,+Maharashtra+415002/@17.6866756,73.9958657,3a,75y,347.01h,96.57t/data=!3m7!1e1!3m5!1sg3KxtPa-EQ-cKxyQL_mKtQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-6.566404013423892%26panoid%3Dg3KxtPa-EQ-cKxyQL_mKtQ%26yaw%3D347.00968702075403!7i16384!8i8192!4m15!1m8!3m7!1s0x3bc239976e218cc1:0xf18af08b48ce87cd!2s42b,+Khalcha+Rasta,+Shete+Chowk,+Rajeshpura+Peth,+Satara,+Maharashtra+415002!3b1!8m2!3d17.686479!4d73.9957608!16s%2Fg%2F11vsjlvf9r!3m5!1s0x3bc239976e218cc1:0xf18af08b48ce87cd!8m2!3d17.686479!4d73.9957608!16s%2Fg%2F11vsjlvf9r?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D",
        image: "/images/store-image-2.jpeg"
    },
    {
        id: 3,
        title: "Shweta One Gram Gold, Ishwarpur",
        address: "Gandhi Chowk, Opposite to Bombay Tailor,\nIshwarpur, Maharashtra 415409",
        link: "https://maps.google.com/?q=Shweta+One+Gram+Gold,+Gandhi+Chowk,+Opposite+to+Bombay+Tailor,+Ishwarpur,+Maharashtra+415409",
        image: "/images/store-image-3.jpeg"
    }
];

export default function VisitOurStores() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextStore = () => setCurrentIndex((prev) => (prev + 1) % stores.length);
    const prevStore = () => setCurrentIndex((prev) => (prev === 0 ? stores.length - 1 : prev - 1));

    // Optional auto-slide every 5 seconds
    useEffect(() => {
        const timer = setInterval(nextStore, 5000);
        return () => clearInterval(timer);
    }, []);

    const activeStore = stores[currentIndex];

    return (
        <section className="w-full pb-16 pt-8 md:pb-24 md:pt-4 bg-white overflow-hidden">
            <div className="main-container max-w-6xl mx-auto px-4">
                <h2 className="text-center text-xl md:text-2xl font-outfit text-charcoal mb-10 md:mb-16 uppercase tracking-[0.05em] md:tracking-[0.1em]">
                    Visit Our Stores
                </h2>
                
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                    {/* Image Section */}
                    <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-square bg-gray-50 overflow-hidden shadow-sm relative group">
                        {/* We use a key on the image element so React reloads it when the src changes */}
                        <img 
                            key={activeStore.image}
                            src={activeStore.image} 
                            alt={`Store located in ${activeStore.title}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-10"
                        />
                        {/* Fallback overlay if image hasn't loaded or isn't uploaded yet */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-0">
                            <span className="text-sm font-outfit tracking-widest text-gray-400 uppercase text-center px-4">
                                Waiting for image:<br/><b className="lowercase">{activeStore.image}</b>
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
