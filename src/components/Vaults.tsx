import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Vault {
  name: string;
  apy: string;
  tvl: string;
  risk: string;
  lockup: string;
  description: string;
}

const vaults: Vault[] = [
  {
    name: 'SUI-USDC Vault',
    apy: '12.5%',
    tvl: '$2.5M',
    risk: 'Low',
    lockup: 'None',
    description: 'Optimized yield farming strategy for SUI-USDC pair',
  },
  {
    name: 'SUI-ETH Vault',
    apy: '15.8%',
    tvl: '$1.8M',
    risk: 'Medium',
    lockup: '7 days',
    description: 'High-yield strategy with ETH exposure',
  },
  {
    name: 'Stablecoin Vault',
    apy: '8.2%',
    tvl: '$4.2M',
    risk: 'Very Low',
    lockup: 'None',
    description: 'Stable yield from multiple stablecoin pairs',
  },
];

export default function Vaults(): JSX.Element {
  return (
    <section id="vaults" className="py-24 bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="gradient-text">Active Vaults</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Choose from our selection of optimized yield farming strategies
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {vaults.map((vault, index) => (
            <motion.div
              key={vault.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="gradient-border"
            >
              <div className="p-6 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-white">{vault.name}</h3>
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-gray-400">{vault.risk} Risk</span>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">APY</span>
                    <span className="text-2xl font-bold text-green-400">{vault.apy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TVL</span>
                    <span className="text-white">{vault.tvl}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Lockup</span>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-white">{vault.lockup}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-400">{vault.description}</p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full btn-primary flex items-center justify-center"
                >
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                  Deposit
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 