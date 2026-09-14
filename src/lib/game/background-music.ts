// ============================================================
// BACKGROUND MUSIC - Load custom audio files from public/music/
// ============================================================

let audioElement: HTMLAudioElement | null = null;
let isPlaying = false;
let currentVolume = 0.15;
let currentTrackIndex = 0;

// List musik yang tersedia di folder public/music/
const PLAYLIST: string[] = [
  '/music/bgm-lobby.mp3',
  '/music/bgm-game.mp3',
];

export const BackgroundMusic = {
  // Mulai play dari playlist
  start() {
    if (isPlaying) return;

    if (!audioElement) {
      audioElement = new Audio();
      audioElement.loop = true;
      audioElement.volume = currentVolume;
    }

    audioElement.src = PLAYLIST[currentTrackIndex] || PLAYLIST[0];
    audioElement.play().catch(() => {});
    isPlaying = true;
  },

  // Stop
  stop() {
    isPlaying = false;
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  },

  // Pause / Resume
  toggle() {
    if (isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  },

  // Next track
  nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    if (isPlaying && audioElement) {
      audioElement.src = PLAYLIST[currentTrackIndex];
      audioElement.play().catch(() => {});
    }
  },

  // Set track by index
  setTrack(index: number) {
    if (index >= 0 && index < PLAYLIST.length) {
      currentTrackIndex = index;
      if (isPlaying && audioElement) {
        audioElement.src = PLAYLIST[currentTrackIndex];
        audioElement.play().catch(() => {});
      }
    }
  },

  // Set volume (0-1)
  setVolume(vol: number) {
    currentVolume = Math.max(0, Math.min(1, vol));
    if (audioElement) {
      audioElement.volume = currentVolume;
    }
  },

  // Get current status
  isPlaying() {
    return isPlaying;
  },

  getVolume() {
    return currentVolume;
  },

  getCurrentTrack() {
    return PLAYLIST[currentTrackIndex] || '';
  },

  getPlaylist() {
    return [...PLAYLIST];
  },
};
