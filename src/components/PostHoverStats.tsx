import { useCounterAnimation } from '../hooks/useCounterAnimation';

interface PostHoverStatsProps {
  likes: number;
  comments: number;
  isVisible: boolean;
}

const PostHoverStats = ({ likes, comments, isVisible }: PostHoverStatsProps) => {
  const animatedLikes = useCounterAnimation({ 
    targetValue: isVisible ? likes : 0, 
    duration: 800,
    startDelay: 0 
  });
  
  const animatedComments = useCounterAnimation({ 
    targetValue: isVisible ? comments : 0, 
    duration: 800,
    startDelay: 100 
  });

  return (
    <div className="flex items-center justify-center space-x-4 text-sm font-semibold">
      <span>❤️ {animatedLikes}</span>
      <span>💬 {animatedComments}</span>
    </div>
  );
};

export default PostHoverStats;