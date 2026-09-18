'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronDown, CheckCircle, Upload, ThumbsUp, ThumbsDown, Loader2, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';

interface Review {
    id: number;
    rating: number;
    title: string | null;
    content: string;
    images: string[];
    userName: string;
    createdAt: string;
    helpfulCount: number;
    notHelpfulCount: number;
}

export default function CustomerReviews({ productId }: { productId: number }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sort, setSort] = useState('Most Recent');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { profile } = useAuth();
    
    // Writing Review State
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    
    // Image Upload State
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/reviews/product/${productId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('image', e.target.files[0]);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const url = await res.text();
                setUploadedImages([...uploadedImages, url]);
            } else {
                alert('Image upload failed');
            }
        } catch (error) {
            console.error('Upload error', error);
            alert('An error occurred during upload');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleWriteReviewClick = async () => {
        if (!profile) {
            alert('Please log in to write a review');
            return;
        }

        if (profile.role === 'ADMIN') {
            setIsWritingReview(true);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/reviews/check-eligibility/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.eligible) {
                setIsWritingReview(true);
            } else {
                alert(data.message || 'Buy a product to write a review');
            }
        } catch (error) {
            console.error('Error checking eligibility', error);
            alert('Something went wrong. Please try again later.');
        }
    };

    const deleteReview = async (id: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/reviews/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                fetchReviews();
            } else {
                alert('Failed to delete review');
            }
        } catch (error) {
            console.error('Delete error', error);
            alert('An error occurred');
        }
    };

    const handleVote = async (id: number, type: 'helpful' | 'notHelpful') => {
        const votedReviews = JSON.parse(localStorage.getItem('votedReviews') || '{}');
        if (votedReviews[id]) {
            alert('You have already voted on this review.');
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/reviews/${id}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type })
            });

            if (res.ok) {
                votedReviews[id] = type;
                localStorage.setItem('votedReviews', JSON.stringify(votedReviews));
                
                setReviews(reviews.map(r => {
                    if (r.id === id) {
                        return {
                            ...r,
                            helpfulCount: type === 'helpful' ? r.helpfulCount + 1 : r.helpfulCount,
                            notHelpfulCount: type === 'notHelpful' ? r.notHelpfulCount + 1 : r.notHelpfulCount
                        };
                    }
                    return r;
                }));
            }
        } catch (error) {
            console.error('Voting error', error);
        }
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a star rating.');
            return;
        }

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    rating,
                    title,
                    content,
                    userName,
                    userEmail,
                    images: uploadedImages
                })
            });

            if (res.ok) {
                alert('Review submitted successfully!');
                setIsWritingReview(false);
                // Reset form
                setRating(0);
                setTitle('');
                setContent('');
                setUserName('');
                setUserEmail('');
                setUploadedImages([]);
                fetchReviews(); // Refresh reviews
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Submit error', error);
            alert('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const sortOptions = [
        'Most Recent',
        'Highest Rating',
        'Lowest Rating'
    ];

    // Derived stats
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : '0.0';

    if (isWritingReview) {
        return (
            <section className="w-full py-16 md:py-24 border-t border-gray-100 bg-white">
                <div className="main-container max-w-3xl mx-auto">
                    <h2 className="text-xl md:text-2xl font-outfit text-charcoal text-center mb-8">
                        Write a review
                    </h2>

                    <form className="space-y-8" onSubmit={submitReview}>
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
                            <label className="block text-sm font-outfit text-charcoal mb-2 text-center">Review Title (optional)</label>
                            <input 
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
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
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Start writing here..."
                                rows={5}
                                className="w-full border border-gray-300 rounded-sm px-4 py-3 font-outfit text-sm focus:outline-none focus:border-black resize-y"
                            ></textarea>
                        </div>

                        {/* Picture Upload */}
                        <div>
                            <label className="block text-sm font-outfit text-charcoal mb-2 text-center">Picture (optional)</label>
                            <div className="flex flex-wrap justify-center gap-4">
                                {uploadedImages.map((img, i) => (
                                    <div key={i} className="relative w-24 h-24 border border-gray-200 group">
                                        <Image src={img} alt="Upload preview" fill className="object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => setUploadedImages(uploadedImages.filter((_, index) => index !== i))}
                                            className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-24 h-24 border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-black transition-colors">
                                    {isUploadingImage ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : <Upload className="w-8 h-8 text-gray-400" />}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                                </label>
                            </div>
                        </div>

                        {/* Name & Email */}
                        <div className="space-y-6 pt-4">
                            <div>
                                <label className="block text-sm font-outfit text-charcoal mb-2 text-center">
                                    Display name (displayed publicly like John Smith) *
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={userName}
                                    onChange={e => setUserName(e.target.value)}
                                    placeholder="Display name"
                                    className="w-full border border-gray-300 rounded-sm px-4 py-3 font-outfit text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-outfit text-charcoal mb-2 text-center">Email address *</label>
                                <input 
                                    type="email"
                                    required
                                    value={userEmail}
                                    onChange={e => setUserEmail(e.target.value)}
                                    placeholder="Your email address"
                                    className="w-full border border-gray-300 rounded-sm px-4 py-3 font-outfit text-sm focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setIsWritingReview(false)}
                                className="px-6 py-3 border border-black text-black font-outfit font-medium text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmitting || isUploadingImage}
                                className="px-6 py-3 bg-black text-white font-outfit font-medium text-sm hover:bg-charcoal transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        );
    }

    if (isLoading) {
        return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    return (
        <section className="w-full py-16 md:py-24 border-t border-gray-100 bg-white">
            <div className="main-container max-w-4xl mx-auto">
                <h2 className="text-xl md:text-2xl font-outfit text-charcoal font-bold mb-10 text-left md:text-center">
                    Customer Reviews ({reviews.length})
                </h2>

                {reviews.length === 0 ? (
                    <div className="flex justify-center items-center gap-8 py-8 border-t border-gray-100">
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-gray-500 font-outfit">Be the first to write a review</span>
                        </div>
                        <button 
                            onClick={handleWriteReviewClick}
                            className="bg-black text-white px-8 py-3.5 font-outfit font-medium text-sm hover:bg-charcoal transition-colors"
                        >
                            Write a review
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Rating Overview (Simplified for Myntra style) */}
                        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl font-semibold font-outfit text-charcoal">{averageRating}</div>
                                <div className="flex flex-col">
                                    <div className="flex text-teal-600 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`w-4 h-4 ${star <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500 font-outfit">{reviews.length} Verified Buyers</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleWriteReviewClick}
                                className="border-2 border-black text-black px-6 py-2 font-outfit font-medium text-sm hover:bg-gray-50 transition-colors"
                            >
                                Write a review
                            </button>
                        </div>

                        {/* Reviews List (Myntra Style) */}
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                                    {/* Top Row: Rating Badge & Text */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="bg-teal-600 text-white px-1.5 py-0.5 rounded text-xs font-semibold flex items-center gap-0.5 mt-0.5 whitespace-nowrap">
                                            {review.rating} <Star className="w-3 h-3 fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-charcoal font-outfit text-sm leading-relaxed">
                                                {review.title && <span className="font-semibold block mb-1">{review.title}</span>}
                                                {review.content}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Images if any */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 ml-11 mb-4 mt-2 overflow-x-auto pb-2">
                                            {review.images.map((img, idx) => (
                                                <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border border-gray-200">
                                                    <Image src={img} alt="Review image" fill className="object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bottom Row: User, Date, and Helpful buttons */}
                                    <div className="flex justify-between items-center ml-11 mt-2">
                                        <div className="text-xs text-gray-500 font-outfit flex items-center gap-2">
                                            <span>{review.userName}</span>
                                            <span className="w-px h-3 bg-gray-300"></span>
                                            <span>{new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-gray-400">
                                            {profile?.role === 'ADMIN' && (
                                                <button onClick={() => deleteReview(review.id)} className="flex items-center gap-1.5 hover:text-red-600 transition-colors mr-2">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => handleVote(review.id, 'helpful')} className="flex items-center gap-1.5 hover:text-black transition-colors">
                                                <ThumbsUp className="w-4 h-4" />
                                                <span className="text-xs font-outfit">{review.helpfulCount}</span>
                                            </button>
                                            <button onClick={() => handleVote(review.id, 'notHelpful')} className="flex items-center gap-1.5 hover:text-black transition-colors">
                                                <ThumbsDown className="w-4 h-4" />
                                                <span className="text-xs font-outfit">{review.notHelpfulCount}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
