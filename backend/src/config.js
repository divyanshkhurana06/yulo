import dotenv from 'dotenv';
dotenv.config();

export default {
  sui: {
    network: process.env.SUI_NETWORK || 'testnet',
    rpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
    walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
  pyth: {
    network: process.env.PYTH_NETWORK || 'testnet',
    priceFeedIds: JSON.parse(process.env.PYTH_PRICE_FEED_IDS || '[]'),
  },
  vault: {
    compoundIntervalHours: parseInt(process.env.COMPOUND_INTERVAL_HOURS || '4', 10),
    addresses: JSON.parse(process.env.VAULT_ADDRESSES || '[]'),
  },
}; 