import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import config from '../config.js';

class SuiService {
  constructor() {
    this.client = new SuiClient({ url: config.sui.rpcUrl });
    if (config.sui.walletPrivateKey) {
      this.keypair = Ed25519Keypair.fromSecretKey(
        Buffer.from(config.sui.walletPrivateKey, 'hex')
      );
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.client.getBalance({
        owner: address,
      });
      return balance;
    } catch (error) {
      console.error(`Error getting balance for ${address}:`, error);
      throw error;
    }
  }

  async getVaultInfo(vaultAddress) {
    try {
      const object = await this.client.getObject({
        id: vaultAddress,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      return object;
    } catch (error) {
      console.error(`Error getting vault info for ${vaultAddress}:`, error);
      throw error;
    }
  }

  async compoundVault(vaultAddress) {
    if (!this.keypair) {
      throw new Error('Wallet private key not configured');
    }

    try {
      const txb = await this.client.moveCall({
        target: `${vaultAddress}::vault::compound`,
        arguments: [],
      });

      const result = await this.client.signAndExecuteTransactionBlock({
        signer: this.keypair,
        transactionBlock: txb,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      return result;
    } catch (error) {
      console.error(`Error compounding vault ${vaultAddress}:`, error);
      throw error;
    }
  }
}

export default new SuiService(); 