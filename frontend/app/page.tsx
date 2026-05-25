import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryRow from '../components/CategoryRow';
import dynamic from 'next/dynamic';

// Lazy load below-the-fold components with NO SSR for maximum initial speed
// This ensures their JS/Rendering doesn't compete with the Hero banner's FCP
const CuratedSection = dynamic(() => import('../components/CuratedSection'));
const TrendingSection = dynamic(() => import('../components/TrendingSection'));
const CustomerReviews = dynamic(() => import('../components/CustomerReviews'));

async function getHeroBanner() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const res = await fetch(`${apiUrl}/api/collections`, { 
      next: { revalidate: 60 } // Cache on the server for 60 seconds
    });
    
    if (!res.ok) return null;
    
    const collections = await res.json();
    const womenCollection = collections.find((c: any) => 
      c.isActive && c.name.toLowerCase() === 'women'
    );

    if (womenCollection?.banners?.length > 0) {
      return womenCollection.banners.find((b: any) => b.isActive) || null;
    }
    return null;
  } catch (error) {
    console.error("SSR Fetch Error:", error);
    return null;
  }
}

export default async function Home() {
  const initialBanner = await getHeroBanner();

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      {/* Pass SSR data to Hero for instant rendering */}
      <Hero initialBanner={initialBanner} />
      <CategoryRow />
      
      {/* Lower sections are lazy-loaded to prioritize the Hero banner above-the-fold */}
      <CuratedSection />
      <TrendingSection />
      <CustomerReviews />
    </main>
  );
}
