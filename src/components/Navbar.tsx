import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Vaults', href: '#vaults' },
  { name: 'Docs', href: '#' },
  { name: 'Analytics', href: '#' },
  { name: 'Community', href: '#' },
];

export default function Navbar(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-transparent">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5 flex items-center">
            <span className="sr-only">Yulo</span>
            <span className="text-2xl font-bold text-white tracking-tight">Yulo</span>
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-400 hover:text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-300 hover:text-white">
              {item.name}
            </a>
          ))}
        </div>
      </nav>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-95 p-6"
        >
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5 flex items-center">
              <span className="sr-only">Yulo</span>
              <span className="text-2xl font-bold text-white tracking-tight">Yulo</span>
            </a>
            <button
              type="button"
              className="rounded-md p-2.5 text-gray-400 hover:text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
} 