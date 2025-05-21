import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSuiClient, useCurrentAccount, useConnectWallet, useDisconnectWallet, useWallets } from '@mysten/dapp-kit';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  balance: string;
  selectedWallet: any | null;
  setSelectedWallet: (wallet: any) => void;
  wallets: any[];
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  connect: async () => {},
  disconnect: async () => {},
  balance: '0',
  selectedWallet: null,
  setSelectedWallet: () => {},
  wallets: [],
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: connect } = useConnectWallet();
  const { mutateAsync: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const [balance, setBalance] = useState('0');
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  // Debug logs for wallet detection
  useEffect(() => {
    console.log('=== Wallet Detection Debug ===');
    console.log('Available wallets:', wallets);
    console.log('Wallet details:', wallets.map(w => ({
      id: w.id,
      name: w.name,
      icon: w.icon,
      version: w.version,
      features: w.features
    })));
    console.log('Current account:', account);
    console.log('==========================');
  }, [wallets, account]);

  useEffect(() => {
    if (account) {
      // Here you would typically fetch the balance using Sui SDK
      setBalance('1000');
    }
  }, [account, client]);

  const handleConnect = async () => {
    console.log('Starting wallet connection...');
    console.log('Selected wallet:', selectedWallet);
    console.log('Available wallets:', wallets);

    try {
      if (!selectedWallet && wallets.length > 0) {
        console.log('No wallet selected, using first available wallet:', wallets[0]);
        setSelectedWallet(wallets[0]);
        await connect({ wallet: wallets[0] });
      } else if (selectedWallet) {
        console.log('Using selected wallet:', selectedWallet);
        await connect({ wallet: selectedWallet });
      } else {
        console.error('No wallets available');
        throw new Error('No wallets available. Please install a wallet extension.');
      }
      console.log('Wallet connected successfully');
    } catch (error: unknown) {
      console.error('Failed to connect wallet:', error);
      // Reset selected wallet on error
      setSelectedWallet(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setSelectedWallet(null);
      console.log('Wallet disconnected successfully');
    } catch (error: unknown) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected: !!account,
        address: account ? account.address : null,
        connect: handleConnect,
        disconnect: handleDisconnect,
        balance,
        selectedWallet,
        setSelectedWallet,
        wallets,
      }}
    >
      {/* Wallet selection UI (simple dropdown) */}
      {!account && wallets.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-gray-800 rounded mb-2">
          <label htmlFor="wallet-select" className="text-white">Select Wallet:</label>
          <select
            id="wallet-select"
            className="bg-gray-700 text-white p-1 rounded"
            value={selectedWallet?.id || ''}
            onChange={e => {
              const wallet = wallets.find(w => w.id === e.target.value) || null;
              setSelectedWallet(wallet);
            }}
          >
            <option value="">-- Choose Wallet --</option>
            {wallets.map(wallet => (
              <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
            ))}
          </select>
          <button
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleConnect}
            disabled={!selectedWallet}
          >
            Connect
          </button>
        </div>
      )}
      {children}
    </WalletContext.Provider>
  );
}; 