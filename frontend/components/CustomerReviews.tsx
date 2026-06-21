'use client';

import { useState } from 'react';
import { Star, ChevronDown, CheckCircle, Upload } from 'lucide-react';

export default function CustomerReviews() {
    const [sort, setSort] = useState('Most Recent');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    // Empty array to simulate no reviews yet
    const reviews: any[] = [];

    const sortOptions = [
        'Most Recent',
        'Highest Rating',
        'Lowest Rating',
        'Only Pictures',
        'Pictures First',
        'Videos First',
        'Most Helpful'
    ];

    if (isWritingReview) {
        return (
            <section className="w-full py-16 md:py-24 border-t border-gray-100 bg-white">
                <div className="main-container max-w-3xl mx-auto">
                    <h2 className="text-xl md:text-2xl font-outfit text-charcoal text-center mb-8">
                        Write a review
                    </h2>

                    <form className="space-y-8" onSubmit={(e) => { 
                        e.preventDefault(); 
                        if (rating === 0) {
                            alert('Please select a star rating.');
                            return;
                        }
                        setIsWritingReview(false); 
                        alert('Review submitted!'); 
                    }}>
                        {/* Rating Selection */}
                        <div className="text-center">
                            <label className="block text-sm font-outfit text-charcoal mb-2">Rating *</label>
                            <div className="flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="p-1 focus:outline-none"
                                    >
                                        <Star 
                                            className={`w-6 h-6 ${star <= (hoverRating || rating) ? 'fill-black text-black' : 'text-gray-300 stroke-2'}`} 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-outfit text-charcoal mb-2 text-center">Review Title *</label>
                            <input 
                                type="text"
                                required
                                minLength={3}
                                placeholder="Give your review a title"
                                className="w-full border border-gray-300 rounded-sm px-4 py-3 font-outfit text-sm focus:outline-none focus:border-black"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-outfit text-charcoal mb-2 text-center">Review content *</label>
                            <textarea 
                                required
                                minLength={10}
                                placeholder="Start writing here..."
                                rows={5}
                                className="w-full border border-gray-300 rounded-sm px-4 py-3 font-outfit text-sm focus:outline-none focus:border-black resize-y"
                            ></textarea>
                        </div>

                        {/* Picture/Video Upload */}
                        <div>
                            <label className="block text-sm font-outfit text-charcoal mb-2 text-center">Picture/Video (optional)</label>
                            <div className="flex justify-center">
                                <label className="w-24 h-24 border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-black transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <input type="file" className="hidden" accept="image/*,video/*" />
                                </label>
                            </div>
                        </div>

                        {/* Name & Email */}
                        <div className="space-y-6 pt-4">
                            <div>
                                <label className="block text-sm font-outfit text-charcoal mb-2 text-center">
                                    Display name (displayed publicly like John Smith <ChevronDown className="inline w-3 h-3" />) *
                                </label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Display name"
                                    className="w-full border border-gray-300 rounded-sm px-4 py-3 font-outfit text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-outfit text-charcoal mb-2 text-center">Email address *</label>
                                <input 
                                    type="email"
                                    required
                                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                    title="Please enter a valid email address"
                                    placeholder="Your email address"
                                    className="w-full border border-gray-300 rounded-sm px-4 py-3 font-outfit text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-center text-gray-500 font-outfit leading-relaxed px-4">
                            How we use your data: We'll only contact you about the review you left, and only if necessary. By submitting your review, you agree to Judge.me's terms, privacy and content policies.
                        </p>

                        <div className="flex justify-center gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setIsWritingReview(false)}
                                className="px-6 py-3 border border-black text-black font-outfit font-medium text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel review
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-3 bg-black text-white font-outfit font-medium text-sm hover:bg-charcoal transition-colors"
                            >
                                Submit Review
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full py-16 md:py-24 border-t border-gray-100 bg-white">
            <div className="main-container max-w-4xl mx-auto">
                <h2 className="text-xl md:text-2xl font-outfit text-charcoal text-center mb-10">
                    Customer Reviews
                </h2>

                {reviews.length === 0 ? (
                    <div className="flex justify-center items-center gap-8 py-8 border-t border-gray-100">
                        <div className="flex flex-col items-center">
                            <div className="flex text-gray-300 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="w-5 h-5 stroke-2" />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 font-outfit">Be the first to write a review</span>
                        </div>
                        <div className="w-px h-12 bg-gray-200 hidden sm:block"></div>
                        <button 
                            onClick={() => setIsWritingReview(true)}
                            className="bg-black text-white px-8 py-3.5 font-outfit font-medium text-sm hover:bg-charcoal transition-colors"
                        >
                            Write a review
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Rating Overview */}
                        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 md:gap-4 mb-16">
                            {/* Left: Overall Rating */}
                            <div className="text-center md:text-left flex flex-col items-center md:items-start">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-black">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="w-5 h-5 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-lg text-charcoal font-outfit">4.81 out of 5</span>
                                </div>
                                <div className="text-sm text-gray-500 font-outfit flex items-center gap-1">
                                    Based on 204 reviews 
                                    <span className="text-teal-400 bg-teal-50 p-0.5 rounded-sm"><CheckCircle className="w-3 h-3" /></span>
                                </div>
                            </div>

                            {/* Middle: Rating Breakdown */}
                            <div className="flex flex-col gap-1.5 w-full max-w-[300px]">
                                {[
                                    { stars: 5, count: 169, percent: 82 },
                                    { stars: 4, count: 32, percent: 15 },
                                    { stars: 3, count: 2, percent: 1 },
                                    { stars: 2, count: 1, percent: 1 },
                                    { stars: 1, count: 0, percent: 0 }
                                ].map((row) => (
                                    <div key={row.stars} className="flex items-center gap-3 text-sm">
                                        <div className="flex text-black w-24">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={`w-3.5 h-3.5 ${star <= row.stars ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                        <div className="flex-1 h-3 bg-gray-100 rounded-sm overflow-hidden">
                                            <div className="h-full bg-black" style={{ width: `${row.percent}%` }}></div>
                                        </div>
                                        <div className="text-gray-400 w-8 text-right font-outfit">{row.count}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Right: Write Review Button */}
                            <div className="w-full md:w-auto flex justify-center md:justify-end">
                                <button 
                                    onClick={() => setIsWritingReview(true)}
                                    className="bg-black text-white px-8 py-3.5 font-outfit font-medium text-sm hover:bg-charcoal transition-colors w-full md:w-auto"
                                >
                                    Write a review
                                </button>
                            </div>
                        </div>

                        <div className="h-px w-full bg-gray-100 mb-6"></div>

                        {/* Sort Dropdown */}
                        <div className="flex justify-start mb-10 relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 text-sm font-outfit text-charcoal hover:text-black transition-colors"
                            >
                                {sort} <ChevronDown className="w-4 h-4" />
                            </button>
                            
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 text-white rounded-lg py-2 z-10 shadow-xl overflow-hidden">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => { setSort(option); setIsDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm font-outfit transition-colors hover:bg-gray-700 ${sort === option ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                                        >
                                            {sort === option && <span className="mr-2">✓</span>}
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-12">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-12 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex text-black mb-3">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                        <div className="text-xs text-gray-400 font-outfit">{review.date}</div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center relative">
                                            <span className="text-gray-500 font-outfit font-medium">{review.name.charAt(0)}</span>
                                            {review.verified && (
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                                    <div className="bg-black text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                                        <CheckCircle className="w-2.5 h-2.5" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-outfit text-sm text-charcoal">{review.name}</span>
                                            {review.verified && (
                                                <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded font-outfit font-medium">Verified</span>
                                            )}
                                        </div>
                                    </div>

                                    {review.title && (
                                        <h4 className="font-outfit font-medium text-charcoal mb-2">{review.title}</h4>
                                    )}
                                    <p className="text-gray-600 font-outfit text-sm leading-relaxed">
                                        {review.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
