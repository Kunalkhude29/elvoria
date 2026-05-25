'use client';

import ProductCard from './ProductCard';

const TRENDY_PRODUCTS = [
    { id: '1', name: 'Circle of Light Earrings', price: 129.00, image: '/images/product-1.jpg', category: 'Earrings', isNew: true, stock: 10 },
    { id: '2', name: 'Blue Stripe & Stone Earrings', price: 249.00, image: '/images/product-2.jpg', category: 'Earrings', isSale: true, stock: 10 },
    { id: '3', name: 'Bridal Paradise Pendant', price: 185.00, image: '/images/product-3.jpg', category: 'Necklaces', stock: 10 },
    { id: '4', name: 'Timeless Diamond Trio Ring', price: 549.00, image: '/images/product-4.jpg', category: 'Rings', stock: 10 }
];

export default function TrendyCollection() {
    return (
        <section className="w-full py-10 md:py-20">
            <div className="main-container">
                <div className="text-center mb-4 md:mb-8">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-outfit text-charcoal mb-2 md:mb-3">Trendy Collection</h2>
                    <p className="text-charcoal/60 italic text-sm">Collect your loves with our newest arrivals.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {TRENDY_PRODUCTS.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
