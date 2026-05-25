import ProductDetailClient from '../../../components/ProductDetailClient';
import Navbar from '../../../components/Navbar';
import Link from 'next/link';

async function getProduct(id: string) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        // The Cache-Control header on the backend will allow this to be fast
        const res = await fetch(`${apiUrl}/api/products/${id}`, { 
            next: { revalidate: 60 } // Cache on server for 60s
        });
        
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("PDP SSR Fetch Error:", error);
        return null;
    }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const initialProduct = await getProduct(resolvedParams.id);

    if (!initialProduct) {
        return (
            <div className="min-h-screen pb-20 bg-ivory flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-outfit text-charcoal mb-4">Product Not Found</h1>
                    <Link href="/" className="text-gold hover:underline">Return to Home</Link>
                </div>
            </div>
        );
    }

    return <ProductDetailClient initialProduct={initialProduct} />;
}
