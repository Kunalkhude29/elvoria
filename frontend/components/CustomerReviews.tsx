'use client';

import { Star, User } from 'lucide-react';
import Image from 'next/image';

const REVIEWS = [
    {
        id: 1,
        name: 'Sarah M.',
        rating: 5,
        text: "Absolutely in love with my new earrings! The quality is exceptional and they look even better in person.",
        image: null // Placeholder for now, can add real images later
    },
    {
        id: 2,
        name: 'Jessica T.',
        rating: 5,
        text: "The packaging was so luxurious, and the necklace is stunning. Will definitely be shopping here again.",
        image: null
    },
    {
        id: 3,
        name: 'Emily R.',
        rating: 5,
        text: "Customer service was amazing, and the rings fit perfectly. A truly premium experience from start to finish.",
        image: null
    }
];

export default function CustomerReviews() {
    return (
        <section className="w-full py-10 md:py-20 border-t border-gray-50">
            <div className="main-container">
                <h2 className="text-center text-xl md:text-2xl font-outfit text-charcoal mb-4 md:mb-8 uppercase tracking-[0.05em] md:tracking-[0.1em]">Customer Love</h2>

                <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 md:gap-10 lg:gap-16 pb-4 md:pb-0 scroll-smooth snap-x snap-mandatory no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {REVIEWS.map((review) => (
                        <div 
                            key={review.id} 
                            className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-auto snap-center flex flex-col items-center text-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-stone-100 hover:shadow-md transition-all duration-300"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-6 text-gold">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>

                            {/* Review Text */}
                            <p className="text-charcoal/85 font-outfit italic text-base md:text-lg leading-relaxed mb-8 flex-1">
                                "{review.text}"
                            </p>

                            {/* User Profile */}
                            <div className="flex items-center gap-3 mt-auto">
                                <div className="w-10 h-10 rounded-full bg-beige/30 flex items-center justify-center overflow-hidden border border-stone-100">
                                    {review.image ? (
                                        <Image src={review.image} alt={review.name} width={40} height={40} className="object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-charcoal/50" />
                                    )}
                                </div>
                                <span className="text-xs font-outfit font-bold uppercase tracking-widest text-charcoal">{review.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
