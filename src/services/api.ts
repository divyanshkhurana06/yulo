import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  wallet_address: string;
  username?: string;
  email?: string;
  created_at: string;
}

export interface Vault {
  id: string;
  address: string;
  name: string;
  description: string;
  strategy_type: string;
  risk_level: string;
  created_at: string;
  apy?: number;
}

export interface VaultPerformance {
  id: string;
  vault_id: string;
  timestamp: string;
  tvl: number;
  apy: number;
  earned: number;
}

export interface UserVaultPosition {
  id: string;
  user_id: string;
  vault_id: string;
  amount: number;
  created_at: string;
  vault: Vault;
}

export const apiService = {
  // User endpoints
  getUser: async (walletAddress: string): Promise<User> => {
    const response = await api.get(`/users/${walletAddress}`);
    return response.data;
  },

  createUser: async (walletAddress: string, userData: Partial<User>): Promise<User> => {
    const response = await api.post('/users', { walletAddress, ...userData });
    return response.data;
  },

  // Vault endpoints
  getVault: async (address: string): Promise<Vault> => {
    const response = await api.get(`/vaults/${address}`);
    return response.data;
  },

  getVaultPerformance: async (
    address: string,
    startDate: string,
    endDate: string
  ): Promise<VaultPerformance[]> => {
    const response = await api.get(`/vaults/${address}/performance`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // User vault positions
  getUserVaultPositions: async (userId: string): Promise<UserVaultPosition[]> => {
    const response = await api.get(`/users/${userId}/vaults`);
    return response.data;
  },
};

export default apiService; 