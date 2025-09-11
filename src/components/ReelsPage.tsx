'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import InfiniteReelsFeed from './reels/InfiniteReelsFeed';

// Create a query client for this component tree
const queryClient = new QueryClient();

const ReelsPage = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-black overflow-x-hidden">
        {/* Mobile Layout (< md) - Keep existing mobile behavior for now */}
        <div className="md:hidden">
          <motion.div
            className="fixed inset-0 bg-black z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full h-full">
              {/* Header */}
              <div
                className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2"
                style={{
                  paddingTop: 'max(8px, env(safe-area-inset-top))',
                  paddingLeft: 'max(16px, env(safe-area-inset-left))',
                  paddingRight: 'max(16px, env(safe-area-inset-right))'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                
                <button
                  onClick={() => window.history.back()}
                  className="relative text-white hover:text-gray-300 p-2"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <div className="relative text-white text-center">
                  <h2 className="font-semibold">Reels</h2>
                </div>
                
                <div className="w-10" /> {/* Spacer for centering */}
              </div>

              {/* Mobile infinite feed - TODO: Implement mobile version */}
              <div className="w-full h-full pt-16">
                <InfiniteReelsFeed />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop & Tablet Layout (md+) - Instagram-style centered cards */}
        <div className="hidden md:grid grid-cols-[240px_minmax(420px,540px)_72px_1fr] gap-8 min-h-screen">
          {/* Left Sidebar */}
          <LeftSidebar 
            activeTab="reels"
            onTabChange={() => {}}
            onAddClick={() => {}}
            showAddPage={false}
          />

          {/* Main content - Infinite scroll centered cards */}
          <InfiniteReelsFeed />

          {/* Action Rail (sticky) - TODO: Connect to current video */}
          <div className="sticky top-24 h-fit">
            {/* Will need to connect this to the currently visible reel */}
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </QueryClientProvider>
  );
};

// Removed VideoStage component - integrated into main layout

export default ReelsPage;