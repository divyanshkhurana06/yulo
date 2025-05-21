const { PythClient } = require('pyth-client');
const config = require('../config');

class PythService {
  constructor() {
    this.client = new PythClient({
      network: config.pyth.network,
    });
  }

  async getPrice(feedId) {
    try {
      const price = await this.client.getPrice(feedId);
      return {
        price: price.price,
        confidence: price.confidence,
        timestamp: price.timestamp,
      };
    } catch (error) {
      console.error(`Error getting price for feed ${feedId}:`, error);
      throw error;
    }
  }

  async getPrices() {
    try {
      const prices = {};
      for (const feedId of config.pyth.priceFeedIds) {
        prices[feedId] = await this.getPrice(feedId);
      }
      return prices;
    } catch (error) {
      console.error('Error getting prices:', error);
      throw error;
    }
  }
}

module.exports = new PythService(); 