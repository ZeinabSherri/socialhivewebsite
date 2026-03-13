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
      <div className="max-w-md mx-auto p-1 pt-8 pb-6">
        <div className="grid grid-cols-3 gap-1">
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category;
            
            return (
              <motion.button
                key={category}
                onClick={() => onSelect(category)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  ...(isSelected ? { 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 0 0 rgba(250, 204, 21, 0)',
                      '0 0 0 6px rgba(250, 204, 21, 0.15)',
                      '0 0 0 0 rgba(250, 204, 21, 0)'
                    ]
                  } : {})
                }}
                whileHover={{ 
                  scale: 1.03,
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.25,
                  ease: [0.4, 0, 0.2, 1],
                  scale: isSelected ? { 
                    duration: 0.4, 
                    times: [0, 0.6, 1],
                    ease: "easeOut"
                  } : { duration: 0.2 },
                  boxShadow: isSelected ? {
                    duration: 0.6,
                    times: [0, 0.5, 1]
                  } : undefined
                }}
                className={`
                  w-full flex items-center justify-center
                  px-1.5 h-6 text-[10px] sm:px-2 sm:h-7 sm:text-xs md:px-2.5 md:h-8 md:text-sm
                  rounded-full border-[0.5px] font-medium
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:ring-offset-1
                  motion-reduce:transition-none motion-reduce:animate-none
                  ${isSelected 
                    ? 'text-black border-transparent shadow-md' 
                    : 'border-white/8 bg-white/4 text-white/80 hover:text-black hover:border-transparent'
                  }
                `}
                style={{
                  backgroundColor: isSelected ? 'rgb(250 204 21)' : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && window.matchMedia('(hover: hover)').matches) {
                    e.currentTarget.style.backgroundColor = 'rgb(250 204 21)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '';
                  }
                }}
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