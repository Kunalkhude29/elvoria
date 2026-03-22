import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryRow from '../components/CategoryRow';
import CuratedSection from '../components/CuratedSection';
import TrendingSection from '../components/TrendingSection';
import CustomerReviews from '../components/CustomerReviews';

export default function Home() {
  return (
    <main className="min-h-screen bg-ivory pb-20">
      <Navbar />
      <Hero />
      <CategoryRow />
      <CuratedSection />
      <TrendingSection />
      <CustomerReviews />
    </main>
  );
}
