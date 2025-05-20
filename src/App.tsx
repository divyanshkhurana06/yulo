import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Vaults from './components/Vaults';
import Footer from './components/Footer';

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main>
        <Hero />
        <Vaults />
      </main>
      <Footer />
    </div>
  );
} 