// Utility: Try to unmute after play (homepage requirement)
export async function tryUnmute(video: HTMLVideoElement) {
  try {
    await video.play();
    video.muted = false;
  } catch {
    // Autoplay block, keep muted
  }
}
