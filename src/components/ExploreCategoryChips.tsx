import React from 'react';
import { motion } from 'framer-motion';

interface ExploreCategoryChipsProps {
  categories: readonly string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const SPANS = [2, 2, 2, 3, 3]; // 3-2-3-2 pattern
const spanForIndex = (i: number) => SPANS[i % SPANS.length];

const ExploreCategoryChips: React.FC<ExploreCategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelect
}) => {
  return (
    <div className="sticky top-0 z-30 bg-transparent backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[920px] px-4 pt-8 pb-6">
        <div className="grid grid-cols-6 gap-x-4 gap-y-4 justify-items-center">
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
                style={{
                  gridColumn: `span ${spanForIndex(index)} / span ${spanForIndex(index)}`
                }}
                className={`
                  inline-flex items-center justify-center rounded-full
                  text-sm h-9 px-4 md:text-base md:h-10 md:px-5
                  font-medium transition-colors duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/80
                  ${isSelected 
                    ? 'bg-[var(--brand)] text-black font-semibold border-transparent shadow-sm' 
                    : 'border border-white/12 bg-white/6 text-white/90 hover:bg-[var(--brand)] hover:text-black hover:border-transparent'
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