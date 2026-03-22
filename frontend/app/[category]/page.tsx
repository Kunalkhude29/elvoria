import ProductCard from '../../components/ProductCard';
import Link from 'next/link';

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    // Await params for App Router
    const { category } = await params;

    // Decode category from URL (e.g. 'new-arrivals' -> 'New Arrivals')
    const categoryName = category.replace(/-/g, ' ');

    // Normalize category for comparison
    const normalizedCategory = category.toLowerCase();

    // Fetch live products
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`, { cache: 'no-store' });
    const ALL_PRODUCTS = res.ok ? await res.json() : [];

    // Filter products
    const products = ALL_PRODUCTS.filter((p: any) => {
        if (normalizedCategory === 'new-arrivals') return p.isNew;
        // Collections page might show all or specific collection items
        if (normalizedCategory === 'collections') return true;

        const pCat = p.category.toLowerCase();
        // Match category (singular/plural handling)
        return pCat === normalizedCategory.replace(/s$/, '') || pCat === normalizedCategory;
    });

    // Check if category is valid (simple check: if it's one of the known categories or has products)
    const validCategories = ['new-arrivals', 'collections', 'necklaces', 'earrings', 'rings', 'bracelets', 'gifting', 'women', 'men', 'shop'];
    const isValidCategory = validCategories.includes(normalizedCategory) || products.length > 0;

    if (!isValidCategory) {
        return (
            <div className="min-h-screen pt-24 pb-20 bg-ivory flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-serif text-charcoal mb-4">Category Not Found</h1>
                    <p className="text-charcoal/60 mb-8">Sorry, we couldn't find the category you're looking for.</p>
                    <Link href="/" className="px-6 py-3 bg-charcoal text-white uppercase tracking-widest text-sm hover:bg-gold transition-colors">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 bg-ivory">
            <div className="container">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif capitalize text-charcoal mb-4">{categoryName}</h1>
                    <p className="text-charcoal/60 max-w-2xl mx-auto">
                        Discover our curated collection of {categoryName}, designed to elevate your everyday style.
                    </p>
                </header>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-charcoal/50">
                        No products found in this category.
                    </div>
                )}
            </div>
        </div>
    );
}
