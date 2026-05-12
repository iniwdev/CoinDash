import Layout from "@/components/layout/Layout";
import Hero from "@/components/ui/Hero";
import PortfolioWalletCards from "@/features/portfolio/components/PortfolioWalletCards";
import SearchBar from "@/features/market-data/components/SearchBar";
import HomeCoinsPreview from "@/features/market-data/components/HomeCoinsPreview";
import FeatureStory from "@/components/ui/FeatureStory";
import CTA from "@/components/ui/CTA";
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Layout>
        <Hero />
        <PortfolioWalletCards />
        <SearchBar />
        <HomeCoinsPreview />
        <FeatureStory />
        <CTA />
      </Layout>
    </div>
  );
};

export default Home;