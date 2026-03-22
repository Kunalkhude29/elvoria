'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="relative w-full h-[85vh] md:h-[90vh] flex items-center bg-gradient-to-r from-[#FFF0F5] via-[#FFFACD] to-[#FAF9F6] overflow-hidden">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full relative z-10">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-start justify-center order-2 md:order-1"
                >
                    <h1 className="text-6xl md:text-8xl font-[family-name:var(--font-script)] font-normal leading-tight mb-6 text-charcoal">
                        Timeless <br className="hidden md:block" /> Jewellery
                    </h1>

                    <p className="text-lg md:text-xl text-charcoal/80 mb-10 max-w-md font-light">
                        Crafted for everyday elegance. Discover our exclusive collection of fine jewellery.
                    </p>

                    <button className="px-10 py-4 bg-charcoal text-white text-sm font-medium tracking-widest uppercase hover:bg-gold transition-all duration-300 shadow-lg rounded-full">
                        Shop Now
                    </button>
                </motion.div>

                {/* Right Image */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative w-full h-[50vh] md:h-full order-1 md:order-2"
                >
                    <div className="absolute top-0 right-0 w-full h-full md:w-[120%] md:-right-[10%]">
                        <Image
                            src="/images/banner_right_v2.png"
                            alt="Elegant Jewellery Model"
                            fill
                            className="object-cover object-center md:object-left-top"
                            priority
                            quality={100}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Background Decor - Optional overlay for texture if needed, currently just hidden or transparent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-transparent to-transparent hidden md:block -z-0" />
        </section>
    );
}
