// src/lib/stream.ts
export type StreamItem = {
  uid: string;
  section: 'reels' | 'explore';
  title?: string;
  tags?: string[];
};

export async function loadStreamItems(): Promise<StreamItem[]> {
  const res = await fetch('/videos.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('videos.json not found');
  return (await res.json()) as StreamItem[];
}

export const thumbSrc = (uid: string, h = 360) =>
  `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=1s&height=${h}`;
