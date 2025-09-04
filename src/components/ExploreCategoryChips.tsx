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
    <div className="sticky top-0 z-30 bg-transparent">
      <div className="mx-auto w-full max-w-[920px] px-4 pt-8 pb-6">
        <div className="grid grid-cols-3 gap-x-4 gap-y-4 justify-items-center">
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
                  px-3 h-9 text-sm md:px-4 md:h-10 md:text-base
                  rounded-full border font-medium
                  active:scale-[0.98] transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[--brand]/80
                  ${isSelected 
                    ? 'bg-[--brand] text-black border-transparent shadow-sm' 
                    : 'border-white/10 bg-white/5 text-white/85 hover:bg-[--brand] hover:text-black hover:border-transparent'
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