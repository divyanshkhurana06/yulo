import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface Vault {
  id: string;
  name: string;
  apy: number;
  tvl: number;
  risk: 'Low' | 'Medium' | 'High';
  description: string;
}

const vaults: Vault[] = [
  {
    id: '1',
    name: 'SUI-USDC LP',
    apy: 24.5,
    tvl: 1250000,
    risk: 'Low',
    description: 'Stable LP position with auto-compounding rewards'
  },
  {
    id: '2',
    name: 'SUI-ETH LP',
    apy: 45.2,
    tvl: 850000,
    risk: 'Medium',
    description: 'Volatile LP position with higher yield potential'
  },
  {
    id: '3',
    name: 'SUI Single Staking',
    apy: 12.8,
    tvl: 2500000,
    risk: 'Low',
    description: 'Simple SUI staking with auto-compounding'
  }
];

const VaultsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Yield Vaults
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Choose from our selection of optimized yield vaults
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vaults.map((vault, index) => (
            <motion.div
              key={vault.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{vault.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  vault.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                  vault.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {vault.risk} Risk
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                  <span className="text-2xl font-bold text-green-400">{vault.apy}%</span>
                  <span className="text-gray-400">APY</span>
                </div>

                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-xl font-semibold">
                    ${(vault.tvl / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-gray-400">TVL</span>
                </div>

                <p className="text-gray-400 text-sm">{vault.description}</p>

                <button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  onClick={() => window.location.href = `/vault/${vault.id}`}
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VaultsPage; 