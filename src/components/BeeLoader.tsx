import { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface BeeLoaderProps {
  onComplete: () => void;
}

const beeAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 90,
  "w": 512,
  "h": 512,
  "nm": "Bee Flying",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Bee Body",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 100},
        "r": {"a": 1, "k": [
          {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 0, "s": [0]},
          {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 45, "s": [5]},
          {"t": 90, "s": [0]}
        ]},
        "p": {"a": 1, "k": [
          {"i": {"x": 0.667, "y": 1}, "o": {"x": 0.333, "y": 0}, "t": 0, "s": [256, 256], "to": [5, -3], "ti": [-5, 3]},
          {"i": {"x": 0.667, "y": 1}, "o": {"x": 0.333, "y": 0}, "t": 45, "s": [286, 238], "to": [5, 3], "ti": [-5, -3]},
          {"t": 90, "s": [256, 256], "to": [0, 0], "ti": [0, 0]}
        ]},
        "a": {"a": 0, "k": [0, 0]},
        "s": {"a": 1, "k": [
          {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 0, "s": [100, 100, 100]},
          {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 15, "s": [105, 95, 100]},
          {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 30, "s": [95, 105, 100]},
          {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 45, "s": [105, 95, 100]},
          {"t": 90, "s": [100, 100, 100]}
        ]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "el",
              "p": {"a": 0, "k": [0, 0]},
              "s": {"a": 0, "k": [60, 40]},
              "nm": "Body"
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [1, 0.8, 0, 1]},
              "o": {"a": 0, "k": 100},
              "r": 1,
              "bm": 0,
              "nm": "Body Fill"
            },
            {
              "ty": "st",
              "c": {"a": 0, "k": [0, 0, 0, 1]},
              "o": {"a": 0, "k": 100},
              "w": {"a": 0, "k": 2},
              "lc": 1,
              "lj": 1,
              "ml": 4,
              "bm": 0,
              "nm": "Body Stroke"
            }
          ],
          "nm": "Bee Body",
          "bm": 0
        }
      ],
      "ip": 0,
      "op": 90,
      "st": 0,
      "bm": 0
    },
    {
      "ddd": 0,
      "ind": 2,
      "ty": 4,
      "nm": "Wings",
      "sr": 1,
      "ks": {
        "o": {"a": 0, "k": 80},
        "r": {"a": 1, "k": [
          {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 0, "s": [0]},
          {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 5, "s": [15]},
          {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 10, "s": [-15]},
          {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 15, "s": [15]},
          {"t": 20, "s": [0]}
        ]},
        "p": {"a": 0, "k": [256, 256]},
        "a": {"a": 0, "k": [0, 0]},
        "s": {"a": 1, "k": [
          {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 0, "s": [100, 100, 100]},
          {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 5, "s": [120, 80, 100]},
          {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 10, "s": [80, 120, 100]},
          {"t": 15, "s": [100, 100, 100]}
        ]}
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ty": "el",
              "p": {"a": 0, "k": [-20, -10]},
              "s": {"a": 0, "k": [25, 35]},
              "nm": "Left Wing"
            },
            {
              "ty": "el",
              "p": {"a": 0, "k": [20, -10]},
              "s": {"a": 0, "k": [25, 35]},
              "nm": "Right Wing"
            },
            {
              "ty": "fl",
              "c": {"a": 0, "k": [0.9, 0.9, 1, 0.6]},
              "o": {"a": 0, "k": 60},
              "r": 1,
              "bm": 0,
              "nm": "Wings Fill"
            }
          ],
          "nm": "Wings",
          "bm": 0
        }
      ],
      "ip": 0,
      "op": 90,
      "st": 0,
      "bm": 0
    }
  ],
  "markers": []
};

export default function BeeLoader({ onComplete }: BeeLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade out to complete
    }, prefersReducedMotion ? 1000 : 3000);

    return () => clearTimeout(timer);
  }, [onComplete, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Player
              autoplay
              loop
              src={beeAnimation}
              style={{ height: '100px', width: '100px' }}
              className="opacity-80"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 1, x: 0, y: 0 }}
            animate={{
              scale: [1, 1.2, 0.3],
              x: [0, 50, 200],
              y: [0, -30, -100],
              rotate: [0, 10, 45]
            }}
            transition={{
              duration: 2.5,
              ease: [0.4, 0, 0.2, 1],
              times: [0, 0.4, 1]
            }}
            style={{ perspective: '1000px' }}
          >
            <motion.div
              animate={{
                rotateY: [0, 15, 45],
                rotateX: [0, -10, -20]
              }}
              transition={{
                duration: 2.5,
                ease: "easeInOut",
                times: [0, 0.4, 1]
              }}
            >
              <Player
                autoplay
                loop
                src={beeAnimation}
                style={{ height: '120px', width: '120px' }}
                className="drop-shadow-lg"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}