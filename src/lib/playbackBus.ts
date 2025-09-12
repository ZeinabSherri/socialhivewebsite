// Global playback bus to prevent audio overlaps
type PlaybackListener = (activeReelId: string | null) => void;

class PlaybackBus {
  private listeners: Set<PlaybackListener> = new Set();
  private currentActiveId: string | null = null;

  subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setActive(reelId: string | null) {
    if (this.currentActiveId !== reelId) {
      this.currentActiveId = reelId;
      this.listeners.forEach(listener => listener(reelId));
    }
  }

  getCurrentActive(): string | null {
    return this.currentActiveId;
  }
}

export const playbackBus = new PlaybackBus();