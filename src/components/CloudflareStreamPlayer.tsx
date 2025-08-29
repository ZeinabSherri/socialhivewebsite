import { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface CloudflareStreamPlayerProps {
  uid: string;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  lazyLoad?: boolean;
}

const CloudflareStreamPlayer = ({ 
  uid, 
  className,
  autoplay = false,
  muted = true,
  controls = true,
  lazyLoad = true
}: CloudflareStreamPlayerProps) => {
  const [isInView, setIsInView] = useState(!lazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Replace with your actual Cloudflare Stream subdomain
  const CLOUDFLARE_SUBDOMAIN = "customer-fyrmd3qp3oex5c51.cloudflarestream.com";
  
  useEffect(() => {
    if (!lazyLoad) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px',
        threshold: 0.1 
      }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [lazyLoad]);

  const iframeSrc = `https://${CLOUDFLARE_SUBDOMAIN}/${uid}/iframe?${new URLSearchParams({
    autoplay: autoplay ? 'true' : 'false',
    muted: muted ? 'true' : 'false',
    controls: controls ? 'true' : 'false',
    loop: 'true'
  }).toString()}`;

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full bg-gray-900 rounded-lg overflow-hidden", className)}
    >
      {isInView && (
        <iframe
          src={iframeSrc}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
        />
      )}
      
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        </div>
      )}
    </div>
  );
};

export default CloudflareStreamPlayer;