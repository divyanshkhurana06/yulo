import express from 'express';
import cors from 'cors';
import winston from 'winston';
import config from './config.js';
import suiService from './services/sui.js';
import databaseService from './services/database.js';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// User endpoints
app.post('/users', async (req, res) => {
  try {
    const { walletAddress, ...userData } = req.body;
    const user = await databaseService.createUser(walletAddress, userData);
    res.json(user);
  } catch (error) {
    logger.error(`Error creating user: ${error}`);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/users/:walletAddress', async (req, res) => {
  try {
    const user = await databaseService.getUserByWallet(req.params.walletAddress);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logger.error(`Error getting user: ${error}`);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Vault endpoints
app.post('/vaults', async (req, res) => {
  try {
    const vault = await databaseService.createVault(req.body);
    res.json(vault);
  } catch (error) {
    logger.error(`Error creating vault: ${error}`);
    res.status(500).json({ error: 'Failed to create vault' });
  }
});

app.get('/vaults/:address', async (req, res) => {
  try {
    const vault = await databaseService.getVault(req.params.address);
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }
    res.json(vault);
  } catch (error) {
    logger.error(`Error getting vault: ${error}`);
    res.status(500).json({ error: 'Failed to get vault' });
  }
});

// Vault performance
app.get('/vaults/:address/performance', async (req, res) => {
  try {
    const vault = await databaseService.getVault(req.params.address);
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }

    const { startDate, endDate } = req.query;
    const performance = await databaseService.getVaultPerformance(
      vault.id,
      startDate,
      endDate
    );
    res.json(performance);
  } catch (error) {
    logger.error(`Error getting vault performance: ${error}`);
    res.status(500).json({ error: 'Failed to get vault performance' });
  }
});

// User vault positions
app.get('/users/:userId/vaults', async (req, res) => {
  try {
    const positions = await databaseService.getUserVaultPositions(req.params.userId);
    res.json(positions);
  } catch (error) {
    logger.error(`Error getting user vault positions: ${error}`);
    res.status(500).json({ error: 'Failed to get user vault positions' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 