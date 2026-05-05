import { useEffect } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import WalletConnect from '../components/WalletConnect';
import SearchBar from '../components/SearchBar';
import HomeCoinsPreview from '../components/HomeCoinsPreview';
import FeatureStory from '../components/FeatureStory';
import CTA from '../components/CTA';

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
    <Layout>
      <Hero />
      <WalletConnect />
      <SearchBar />
      <HomeCoinsPreview />
      <FeatureStory />
      <CTA />
    </Layout>
  );
};

export default Home;