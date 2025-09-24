type PlaybackListener = (activeId: string | null, prevId: string | null) => void;

class PlaybackBus {
  private listeners: Map<string, PlaybackListener> = new Map();
  private currentActiveId: string | null = null;
  private hasUserInteracted = false;

  subscribe(playerId: string, listener: PlaybackListener): () => void {
    this.listeners.set(playerId, listener);
    return () => {
      this.listeners.delete(playerId);
      if (this.currentActiveId === playerId) {
        this.currentActiveId = null;
      }
    };
  }

  activate(playerId: string, force = false) {
    if (this.currentActiveId === playerId && !force) return;
    
    const prevId = this.currentActiveId;
    this.currentActiveId = playerId;

    // Notify previous active player first to ensure clean pause
    if (prevId && this.listeners.has(prevId)) {
      this.listeners.get(prevId)!(null, prevId);
    }

    // Notify new active player
    if (this.listeners.has(playerId)) {
      this.listeners.get(playerId)!(playerId, prevId);
    }

    // Notify others to ensure cleanup
    this.listeners.forEach((listener, id) => {
      if (id !== playerId && id !== prevId) {
        listener(playerId, prevId);
      }
    });
  }

  deactivate(playerId: string) {
    if (this.currentActiveId === playerId) {
      this.currentActiveId = null;
      this.listeners.forEach(listener => listener(null, playerId));
    }
  }

  markUserInteraction() {
    this.hasUserInteracted = true;
  }

  canUnmute(): boolean {
    return this.hasUserInteracted;
  }

  getActiveId(): string | null {
    return this.currentActiveId;
  }
}

export const playbackBus = new PlaybackBus();