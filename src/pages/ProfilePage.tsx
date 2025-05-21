import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiService, { User, UserVaultPosition } from '../services/api';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, CurrencyDollarIcon, WalletIcon } from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [positions, setPositions] = useState<UserVaultPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userData = await apiService.getUser(walletAddress!);
        setUser(userData);

        // Fetch user's vault positions
        const positionsData = await apiService.getUserVaultPositions(userData.id);
        setPositions(positionsData);
      } catch (err) {
        setError('Failed to load user data. Please try again later.');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchUserData();
    }
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">User not found</div>
      </div>
    );
  }

  // Calculate total values, adding a check for position.vault
  const totalValueLocked = positions.reduce((sum, pos) => sum + pos.amount, 0);
  const totalEarned = positions.reduce((sum, pos) => {
    // Add check: ensure position.vault exists before accessing apy
    const earned = pos.vault ? (pos.amount * (pos.vault.apy || 0)) / 100 : 0;
    return sum + earned;
  }, 0);

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
            Your Profile
          </h1>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <WalletIcon className="h-5 w-5 text-gray-400" />
            <p className="text-gray-400">{user.wallet_address}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-400" />
              <span className="text-2xl font-bold">${totalValueLocked.toLocaleString()}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">Total Value Locked</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                ${totalEarned.toLocaleString()}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">Total Earned</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-400" />
              <span className="text-2xl font-bold">{positions.length}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">Active Positions</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h2 className="text-2xl font-semibold mb-6">Your Positions</h2>
          <div className="space-y-4">
            {positions.map((position) => (
              // Add check: only render position if position.vault exists
              position.vault && (
                <motion.div
                  key={position.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: position.id.charCodeAt(0) * 0.1 }}
                  className="bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{position.vault.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {position.amount.toLocaleString()} tokens (${position.amount.toLocaleString()})
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                        <span className="text-green-400">
                          {position.vault.apy?.toFixed(1)}% APY
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Earned: ${((position.amount * (position.vault.apy || 0)) / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    onClick={() => window.location.href = `/vault/${position.id}`}
                  >
                    Manage Position
                  </button>
                </motion.div>
              )
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage; 