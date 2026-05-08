import { useEffect } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import PortfolioWalletCards from '../components/PortfolioWalletCards';
import SearchBar from '../components/SearchBar';
import HomeCoinsPreview from '../components/HomeCoinsPreview';
import FeatureStory from '../components/FeatureStory';
import CTA from '../components/CTA';
import './Home.css';

const Home = () => {
  useEffect(() => {
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

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