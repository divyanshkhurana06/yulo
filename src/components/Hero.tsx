import React from 'react';
import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

const features: Feature[] = [
  {
    title: 'Auto-Compound',
    description: 'Automatically harvest and reinvest your rewards for optimal yield.',
    icon: '🔄',
  },
  {
    title: 'Smart Strategies',
    description: 'Advanced algorithms to find the best yield opportunities across DeFi.',
    icon: '🧠',
  },
  {
    title: 'Secure & Trusted',
    description: 'Built on Sui blockchain with battle-tested smart contracts.',
    icon: '🔒',
  },
];

export default function Hero(): JSX.Element {
  return (
    <div className="relative overflow-hidden bg-gray-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 to-secondary-900/30 mix-blend-multiply" />
      </div>
      
      <div className="relative pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              <span className="gradient-text">Auto-Compounding</span> Yield Optimizer
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
              Maximize your DeFi yields with automated compounding strategies. 
              Set it and forget it - we'll handle the rest.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Get Started
              </motion.button>
              <motion.a
                href="#learn-more"
                whileHover={{ scale: 1.05 }}
                className="text-sm font-semibold leading-6 text-white"
              >
                Learn more <span aria-hidden="true">→</span>
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ scale: 1.05 }}
                className="card"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 