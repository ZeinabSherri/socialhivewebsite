// Enhanced playback bus for instant coordination and race-condition prevention
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
      // Emit to all listeners instantly for hard stop coordination
      this.listeners.forEach(listener => listener(reelId));
    }
  }

  getCurrentActive(): string | null {
    return this.currentActiveId;
  }

  // Instant coordination - force stop all others
  forceStopOthers(excludeReelId: string) {
    this.listeners.forEach(listener => listener(excludeReelId));
  }
}

export const playbackBus = new PlaybackBus();