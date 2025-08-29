import { useState, useEffect } from 'react';

export interface CloudflareVideo {
  uid: string;
  section: 'reels' | 'explore';
  title: string;
  tags: string[];
  duration: number;
  created: string;
}

export const useCloudflareVideos = (section?: 'reels' | 'explore') => {
  const [videos, setVideos] = useState<CloudflareVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/videos.json');
        
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        
        const allVideos: CloudflareVideo[] = await response.json();
        const filteredVideos = section 
          ? allVideos.filter(video => video.section === section)
          : allVideos;
        
        setVideos(filteredVideos);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [section]);

  return { videos, loading, error };
};

export const getCloudflareStreamThumbnail = (uid: string, options?: {
  time?: string;
  height?: number;
  width?: number;
}) => {
  const CLOUDFLARE_SUBDOMAIN = "customer-fyrmd3qp3oex5c51.cloudflarestream.com";
  const params = new URLSearchParams({
    time: options?.time || '1s',
    ...(options?.height && { height: options.height.toString() }),
    ...(options?.width && { width: options.width.toString() })
  });
  
  return `https://${CLOUDFLARE_SUBDOMAIN}/${uid}/thumbnails/thumbnail.jpg?${params.toString()}`;
};