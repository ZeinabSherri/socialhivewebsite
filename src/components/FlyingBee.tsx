import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import beeAnimation from "../assets/bee-flying.json";

interface FlyingBeeProps {
  postRefs: React.RefObject<HTMLDivElement>[];
}

const FlyingBee: React.FC<FlyingBeeProps> = ({ postRefs }) => {
  const { scrollY } = useScroll();
  const [boxes, setBoxes] = useState<DOMRect[]>([]);
  const [docHeight, setDocHeight] = useState(0);
  const [winHeight, setWinHeight] = useState(0);

  useEffect(() => {
    const update = () => {
      const rects = postRefs.map(ref =>
        ref.current?.getBoundingClientRect() ?? new DOMRect()
      );
      setBoxes(rects);
      setDocHeight(document.documentElement.scrollHeight);
      setWinHeight(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [postRefs]);

  // Pin the bee to the right edge of the "active" post with smooth transitions
  const baseX = useTransform(scrollY, (y: number) => {
    if (boxes.length === 0 || !docHeight || !winHeight) return 0;
    const prog = y / (docHeight - winHeight);
    const idx = Math.min(Math.floor(prog * boxes.length), boxes.length - 1);
    const b = boxes[idx];
    return b.left + b.width - 80; // moved further left for better mobile visibility
  });

  // Y = top of the post + a bit of padding with smooth transitions
  const beeY = useTransform(scrollY, (y: number) => {
    if (boxes.length === 0 || !docHeight || !winHeight) return 0;
    const prog = y / (docHeight - winHeight);
    const idx = Math.min(Math.floor(prog * boxes.length), boxes.length - 1);
    return (boxes[idx]?.top ?? 0) + 20;
  });

  // Add a smoother zig-zag wiggle on X
  const wiggle = useTransform(scrollY, (y: number) => {
    if (boxes.length === 0 || !docHeight || !winHeight) return 0;
    const prog = y / (docHeight - winHeight);
    const idx = Math.min(Math.floor(prog * boxes.length), boxes.length - 1);
    const postProg = prog * boxes.length - idx;
    return Math.sin(postProg * Math.PI * 2) * 15; // Reduced frequency and amplitude for smoother movement
  });

  // **Here's the TS-safe combination** of baseX + wiggle
  const finalX = useTransform(
    [baseX, wiggle] as const,
    ([bx, w]: [number, number]) => bx + w
  );

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: finalX,
        y: beeY,
        width: 60,
        height: 60,
        zIndex: 1000,
        pointerEvents: "none",
      }}
      animate={{
        scale: [1, 1.02, 1],
        rotate: [0, 1, -1, 0],
      }}
      transition={{
        scale: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
        x: {
          type: "spring",
          stiffness: 80,
          damping: 25,
        },
        y: {
          type: "spring",
          stiffness: 80,
          damping: 25,
        },
      }}
    >
      <Player
        autoplay
        loop
        src={beeAnimation}
        style={{ width: "100%", height: "100%" }}
      />
    </motion.div>
  );
};

export default FlyingBee;
