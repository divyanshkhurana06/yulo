import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Vaults from './components/Vaults';
import Footer from './components/Footer';
import VaultsPage from './pages/VaultsPage';
import VaultDetailPage from './pages/VaultDetailPage';
import ProfilePage from './pages/ProfilePage';

const networkConfig = {
  mainnet: { url: getFullnodeUrl('mainnet') },
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect={true}>
          <Router>
            <div className="min-h-screen bg-gray-900">
              <Navbar />
              <Routes>
                <Route path="/" element={
                  <>
                    <Hero />
                    <Vaults />
                  </>
                } />
                <Route path="/vaults" element={<VaultsPage />} />
                <Route path="/vault/:id" element={<VaultDetailPage id="1" />} />
                <Route path="/profile/:walletAddress" element={<ProfilePage />} />
              </Routes>
              <Footer />
            </div>
          </Router>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App; 