// Client-only wrapper for CloudflareStreamPlayer to prevent SSR issues
import React, { useState, useEffect } from 'react';
import { CloudflareStreamPlayerProps } from './CloudflareStreamPlayer';

// Lazy load the component
const CloudflareStreamPlayerBase = React.lazy(() => import('./CloudflareStreamPlayer'));

// Fallback component for SSR/loading
const VideoFallback = ({ className, poster }: { className?: string; poster?: string }) => (
  <div 
    className={className}
    style={{
      backgroundColor: '#000',
      backgroundImage: poster ? `url(${poster})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px'
    }}
  >
    <div style={{ color: 'white', opacity: 0.7 }}>Loading video...</div>
  </div>
);

// Client-only wrapper
const CloudflareStreamPlayerSSR = React.forwardRef<HTMLVideoElement, CloudflareStreamPlayerProps>(
  (props, ref) => {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
      setIsClient(true);
    }, []);

    // Only render on client side
    if (!isClient) {
      return <VideoFallback className={props.className} poster={props.poster} />;
    }
    
    return (
      <React.Suspense fallback={<VideoFallback className={props.className} poster={props.poster} />}>
        <CloudflareStreamPlayerBase {...props} ref={ref} />
      </React.Suspense>
    );
  }
);

CloudflareStreamPlayerSSR.displayName = 'CloudflareStreamPlayerSSR';

export default CloudflareStreamPlayerSSR;
export type { CloudflareStreamPlayerProps };