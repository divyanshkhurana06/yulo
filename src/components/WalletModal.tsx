import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useWallet } from '../contexts/WalletContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps): JSX.Element {
  const { wallets, connect, selectedWallet, setSelectedWallet } = useWallet();

  const handleWalletSelect = async (wallet: any) => {
    try {
      setSelectedWallet(wallet);
      await connect();
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-800 rounded-xl shadow-xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {wallets.length > 0 ? (
                wallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletSelect(wallet)}
                    className="w-full flex items-center justify-between p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {wallet.icon && (
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-white font-medium">{wallet.name}</span>
                    </div>
                    {selectedWallet?.id === wallet.id && (
                      <span className="text-green-400">Connected</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No wallets found</p>
                  <p className="text-sm text-gray-500">
                    Please install a wallet extension to continue
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 