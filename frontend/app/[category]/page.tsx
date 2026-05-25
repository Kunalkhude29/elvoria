import CategoryPageClient from '../../components/CategoryPageClient';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

async function getCategoryData(category: string) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const normalizedCategory = category.toLowerCase();

        // 1. Fetch Products
        const prodRes = await fetch(`${apiUrl}/api/products`, { next: { revalidate: 60 } });
        const allProducts = prodRes.ok ? await prodRes.json() : [];

        const filteredProducts = allProducts.filter((p: any) => {
            if (normalizedCategory === 'new-arrivals') return p.isNew;
            if (normalizedCategory === 'collections' || normalizedCategory === 'shop') return true;

            const pCat = p.category.toLowerCase();
            return pCat === normalizedCategory.replace(/s$/, '') || pCat === normalizedCategory;
        });

        // 2. Fetch Collection Banners
        const bannerRes = await fetch(`${apiUrl}/api/collections`, { next: { revalidate: 60 } });
        let matchedBanner = null;

        if (bannerRes.ok) {
            const collections = await bannerRes.json();
            const matchedCollection = collections.find((c: any) => {
                if (!c.isActive) return false;
                const collectionName = c.name.toLowerCase();
                const targetCategory = normalizedCategory.replace(/-/g, ' ');
                
                return collectionName === targetCategory || 
                       collectionName === `category: ${targetCategory}` ||
                       collectionName.split(' ').includes(targetCategory);
            });
            
            if (matchedCollection) {
                matchedBanner = matchedCollection.banners?.find((b: any) => b.isActive) || 
                              (matchedCollection.heroImage ? { image: matchedCollection.heroImage, title: matchedCollection.name } : null);
            }
        }

        return {
            products: filteredProducts,
            banner: matchedBanner
        };
    } catch (error) {
        console.error("Category SSR Fetch Error:", error);
        return { products: [], banner: null };
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const resolvedParams = await params;
    const { category } = resolvedParams;
    const { products, banner } = await getCategoryData(category);

    const categoryName = category.replace(/-/g, ' ');
    const normalizedCategory = category.toLowerCase();

    // Check if category is valid (has products or is in valid list)
    const validCategories = ['new-arrivals', 'collections', 'necklaces', 'earrings', 'rings', 'bracelets', 'bangles', 'anklets', 'gifting', 'wedding', 'daily-wear', 'women', 'men', 'shop', 'mangalsutras', 'sets', 'set'];
    const isValidCategory = validCategories.includes(normalizedCategory) || products.length > 0;

    if (!isValidCategory) {
        return (
            <div className="min-h-screen pb-20 bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-outfit text-charcoal mb-4">Category Not Found</h1>
                        <p className="text-charcoal/60 font-outfit mb-8">Sorry, we couldn't find the category you're looking for.</p>
                        <Link href="/" className="px-6 py-3 bg-charcoal text-white uppercase tracking-widest text-sm font-outfit font-semibold hover:bg-gold transition-colors">
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <CategoryPageClient 
            category={category}
            categoryName={categoryName}
            initialProducts={products}
            initialBanner={banner}
        />
    );
}
