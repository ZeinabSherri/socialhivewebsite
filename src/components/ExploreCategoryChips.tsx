import React from 'react';
import { motion } from 'framer-motion';

interface ExploreCategoryChipsProps {
  categories: readonly string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const ExploreCategoryChips: React.FC<ExploreCategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelect
}) => {
  return (
    <div className="sticky top-0 z-30 bg-transparent backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[920px] px-4 pt-8 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-8">
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category;
            
            return (
              <motion.button
                key={category}
                onClick={() => onSelect(category)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  ...(isSelected ? { scale: [1, 1.05, 1] } : {})
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.2,
                  scale: isSelected ? { duration: 0.22, times: [0, 0.6, 1] } : undefined
                }}
                className={`
                  inline-flex items-center justify-center
                  text-sm h-9 px-4 sm:text-base sm:h-10 sm:px-5
                  rounded-full font-medium
                  active:scale-[0.98] transition-colors duration-150
                  focus:outline-none focus:ring-2 focus:ring-[--brand]/80
                  ${isSelected 
                    ? 'bg-[var(--brand)] text-black font-semibold border-transparent shadow-sm' 
                    : 'border border-white/12 bg-white/6 text-white/90 hover:bg-white/10'
                  }
                `}
                aria-pressed={isSelected}
                aria-label={`Filter by ${category}`}
              >
                {category}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExploreCategoryChips;