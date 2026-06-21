'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ question, children, isOpen, onClick }: { question: string, children: React.ReactNode, isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="border-b border-gray-200 py-6">
            <button 
                onClick={onClick}
                className="w-full flex justify-between items-center text-left focus:outline-none group"
            >
                <span className="text-sm font-outfit text-charcoal font-medium group-hover:text-gold transition-colors">{question}</span>
                <span className="text-charcoal/50 ml-4 flex-shrink-0">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
            </button>
            <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}
            >
                <div className="text-sm font-outfit text-charcoal/70 leading-relaxed space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function CustomerCarePage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        if (openIndex === index) {
            setOpenIndex(null);
        } else {
            setOpenIndex(index);
        }
    };

    const sections = [
        {
            title: "SHIPPING",
            items: [
                {
                    question: "How soon can I expect my SHWETA jewellery?",
                    content: (
                        <>
                            <p><strong>Shipping Time:</strong></p>
                            <p>Typically delivered within 5-7 working days. Products are shipped out within 1-2 working days unless a different shipping timeline is mentioned on the product page.</p>
                            <p>For pre-order items, please note they will be shipped within 8-10 days and will take an additional 3-4 working days to reach the customer.</p>
                            <p><strong>Orders cannot be cancelled once placed.</strong></p>
                        </>
                    )
                },
                {
                    question: "Is the ₹120 partial payment for COD orders refundable?",
                    content: (
                        <p>For COD orders, ₹120 is collected as a non-refundable security amount and is deducted from the total payable amount at the time of delivery.</p>
                    )
                }
            ]
        },
        {
            title: "CONTACT US",
            items: [
                {
                    question: "How can I get in touch with SHWETA jewellery?",
                    content: (
                        <>
                            <p>Our customer care team is available to assist you. You can reach us by phone at the following numbers:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>+91 9156104740</li>
                                <li>+91 9209674740</li>
                                <li>+91 7249564740</li>
                            </ul>
                            <p className="mt-4">Available Monday to Saturday between 11 AM and 6 PM.</p>
                        </>
                    )
                }
            ]
        },
        {
            title: "RETURNS OR EXCHANGE",
            items: [
                {
                    question: "It doesn't fit, Can I exchange it?",
                    content: (
                        <p>Yes, we offer exchanges for size issues within 7 days of delivery. Please ensure the product is unused and in its original packaging with all tags intact.</p>
                    )
                },
                {
                    question: "Can I return or cancel my order?",
                    content: (
                        <p>Orders once placed cannot be cancelled. Returns are only accepted if you receive a damaged or incorrect product, supported by a valid unboxing video.</p>
                    )
                }
            ]
        },
        {
            title: "MISSING / DAMAGED PRODUCT",
            items: [
                {
                    question: "Request Proof",
                    content: (
                        <p>For any missing or damaged product concerns, an unboxing video is required and will be considered as the only valid proof for a replacement.</p>
                    )
                }
            ]
        }
    ];

    let globalItemIndex = 0;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 md:py-24">
                <div className="space-y-16">
                    {sections.map((section, sectionIdx) => (
                        <div key={sectionIdx}>
                            <h2 className="text-sm font-outfit font-bold tracking-[0.15em] text-charcoal uppercase mb-6">
                                {section.title}
                            </h2>
                            <div className="border-t border-gray-200">
                                {section.items.map((item) => {
                                    const currentIndex = globalItemIndex++;
                                    return (
                                        <FAQItem 
                                            key={currentIndex}
                                            question={item.question}
                                            isOpen={openIndex === currentIndex}
                                            onClick={() => toggleAccordion(currentIndex)}
                                        >
                                            {item.content}
                                        </FAQItem>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer disclaimer */}
                <div className="mt-20 pt-10 border-t border-gray-200 text-center text-xs font-outfit text-charcoal/60 leading-relaxed max-w-2xl mx-auto space-y-6">
                    <p>
                        Please be informed that returns or exchanges are applicable only on purchases made through our official online store, and we do not provide customer care service via Instagram DMs.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
