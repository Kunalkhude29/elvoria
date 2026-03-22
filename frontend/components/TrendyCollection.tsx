'use client';

import ProductCard from './ProductCard';

const TRENDY_PRODUCTS = [
    { id: '1', name: 'Circle of Light Earrings', price: 129.00, image: '/images/product-1.jpg', category: 'Earrings', isNew: true },
    { id: '2', name: 'Blue Stripe & Stone Earrings', price: 249.00, image: '/images/product-2.jpg', category: 'Earrings', isSale: true },
    { id: '3', name: 'Bridal Paradise Pendant', price: 185.00, image: '/images/product-3.jpg', category: 'Necklaces' },
    { id: '4', name: 'Timeless Diamond Trio Ring', price: 549.00, image: '/images/product-4.jpg', category: 'Rings' }
];

export default function TrendyCollection() {
    return (
        <section className="container py-20">
            <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-serif text-charcoal mb-4">Trendy Collection</h2>
                <p className="text-charcoal/60 italic">Collect your loves with our newest arrivals.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {TRENDY_PRODUCTS.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
