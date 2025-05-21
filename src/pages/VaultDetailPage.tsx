import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, CurrencyDollarIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface VaultDetailProps {
  id: string;
}

const VaultDetailPage: React.FC<VaultDetailProps> = ({ id }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  // Mock vault data - in real app, fetch this based on id
  const vault = {
    name: 'SUI-USDC LP',
    apy: 24.5,
    tvl: 1250000,
    risk: 'Low',
    description: 'Stable LP position with auto-compounding rewards',
    userDeposit: 5000,
    userShares: 5000
  };

  const handleDeposit = () => {
    // Implement deposit logic
    console.log('Depositing:', amount);
  };

  const handleWithdraw = () => {
    // Implement withdraw logic
    console.log('Withdrawing:', amount);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl p-8"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {vault.name}
              </h1>
              <p className="mt-2 text-gray-400">{vault.description}</p>
            </div>
            <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400">
              {vault.risk} Risk
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-bold text-green-400">{vault.apy}%</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">APY</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-bold">
                  ${(vault.tvl / 1000000).toFixed(2)}M
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Total Value Locked</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-purple-400" />
                <span className="text-2xl font-bold">${vault.userDeposit}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Your Deposit</p>
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-6">
            <div className="flex space-x-4 mb-6">
              <button
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  activeTab === 'deposit'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                onClick={() => setActiveTab('deposit')}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Deposit</span>
                </div>
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  activeTab === 'withdraw'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                onClick={() => setActiveTab('withdraw')}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  <span>Withdraw</span>
                </div>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Amount to {activeTab}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter amount to ${activeTab}`}
                />
              </div>

              <button
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
              >
                {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VaultDetailPage; 