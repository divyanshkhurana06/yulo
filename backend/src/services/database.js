import { createClient } from '@supabase/supabase-js';
import config from '../config.js';

class DatabaseService {
  constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.key);
  }

  // User Management
  async createUser(walletAddress, userData = {}) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert([
          {
            wallet_address: walletAddress,
            ...userData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserByWallet(walletAddress) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Vault Management
  async createVault(vaultData) {
    try {
      const { data, error } = await this.supabase
        .from('vaults')
        .insert([vaultData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating vault:', error);
      throw error;
    }
  }

  async getVault(address) {
    try {
      const { data, error } = await this.supabase
        .from('vaults')
        .select('*')
        .eq('address', address)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting vault:', error);
      throw error;
    }
  }

  async updateVault(vaultId, vaultData) {
    try {
      const { data, error } = await this.supabase
        .from('vaults')
        .update(vaultData)
        .eq('id', vaultId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating vault:', error);
      throw error;
    }
  }

  // User Vault Positions
  async createUserVaultPosition(userId, vaultId, amount) {
    try {
      const { data, error } = await this.supabase
        .from('user_vault_positions')
        .insert([
          {
            user_id: userId,
            vault_id: vaultId,
            amount,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user vault position:', error);
      throw error;
    }
  }

  async getUserVaultPositions(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_vault_positions')
        .select(`
          *,
          vaults (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user vault positions:', error);
      throw error;
    }
  }

  // Performance Tracking
  async storeVaultPerformance(vaultId, data) {
    try {
      const { data: result, error } = await this.supabase
        .from('vault_performance')
        .insert([
          {
            vault_id: vaultId,
            timestamp: new Date().toISOString(),
            ...data,
          },
        ]);

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error storing vault performance:', error);
      throw error;
    }
  }

  async getVaultPerformance(vaultId, startDate, endDate) {
    try {
      const { data, error } = await this.supabase
        .from('vault_performance')
        .select('*')
        .eq('vault_id', vaultId)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting vault performance:', error);
      throw error;
    }
  }

  // Price Data
  async storePriceData(feedId, priceData) {
    try {
      const { data: result, error } = await this.supabase
        .from('price_data')
        .insert([
          {
            feed_id: feedId,
            timestamp: new Date().toISOString(),
            ...priceData,
          },
        ]);

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error storing price data:', error);
      throw error;
    }
  }

  // User Activity
  async logUserActivity(userId, activityType, details = {}) {
    try {
      const { data, error } = await this.supabase
        .from('user_activity')
        .insert([
          {
            user_id: userId,
            activity_type: activityType,
            details,
          },
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging user activity:', error);
      throw error;
    }
  }
}

export default new DatabaseService(); 