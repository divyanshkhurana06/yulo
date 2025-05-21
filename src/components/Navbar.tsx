import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useWallet } from '../contexts/WalletContext';
import WalletModal from './WalletModal';

export default function Navbar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { isConnected, address, disconnect } = useWallet();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Vaults', href: '/vaults' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <>
      <nav className="bg-gray-800/50 backdrop-blur-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
                >
                  YULO
                </motion.div>
              </Link>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              {isConnected ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <WalletIcon className="h-5 w-5" />
                    <span>{address}</span>
                  </div>
                  <button
                    onClick={disconnect}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Connect Wallet
                </button>
              )}
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-white"
              >
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isConnected ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-300 px-3 py-2">
                  <WalletIcon className="h-5 w-5" />
                  <span>{address}</span>
                </div>
                <button
                  onClick={disconnect}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </motion.div>
      </nav>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
} 