/**
 * Video Handlers - Controls for HTML5 video player
 */

import { formatTime } from '../utils/dom.js';
import {
  getCurrentClassId,
  getCourseData,
  ClassItem,
} from '../state/playerState.js';

let videoElement: HTMLVideoElement | null = null;

// Callback para toggle completion (injetado pelo main.ts para evitar dependência circular)
let onVideoEndedCallback: ((cls: ClassItem) => Promise<void>) | null = null;

export function setOnVideoEndedCallback(
  callback: (cls: ClassItem) => Promise<void>,
): void {
  onVideoEndedCallback = callback;
}

/**
 * Setup custom video controls
 */
export function setupVideoHandlers(): void {
  const video = document.getElementById('html5-player') as HTMLVideoElement;
  const playBtn = document.getElementById('btn-play-pause');
  const seekSlider = document.getElementById(
    'video-seek-slider',
  ) as HTMLInputElement;
  const progressBarFill = document.getElementById(
    'video-progress-fill',
  ) as HTMLElement;
  const volumeBtn = document.getElementById('btn-volume');
  const volumeSlider = document.getElementById(
    'volume-slider',
  ) as HTMLInputElement;
  const fullScreenBtn = document.getElementById('btn-fullscreen');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const controlsContainer = document.getElementById('video-controls');

  if (
    !video ||
    !playBtn ||
    !seekSlider ||
    !progressBarFill ||
    !volumeBtn ||
    !volumeSlider ||
    !fullScreenBtn ||
    !currentTimeEl ||
    !durationEl ||
    !controlsContainer
  ) {
    return;
  }

  videoElement = video;

  // Play/Pause
  const togglePlay = () => {
    if (video.paused || video.ended) {
      video.play();
    } else {
      video.pause();
    }
  };

  playBtn.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);

  // Update Icon on State Change
  const updatePlayIcon = () => {
    const icon = playBtn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = video.paused ? 'play_arrow' : 'pause';
    if (video.paused) {
      controlsContainer.classList.add('visible');
    } else {
      controlsContainer.classList.remove('visible');
    }
  };

  video.addEventListener('play', updatePlayIcon);
  video.addEventListener('pause', updatePlayIcon);

  // Time Update & Progress
  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    progressBarFill.style.width = `${pct}%`;
    seekSlider.value = pct.toString();
    currentTimeEl.textContent = formatTime(video.currentTime);
    durationEl.textContent = formatTime(video.duration);
  });

  // Seek
  seekSlider.addEventListener('input', () => {
    if (!video.duration) return;
    const time = (parseFloat(seekSlider.value) / 100) * video.duration;
    video.currentTime = time;
    progressBarFill.style.width = `${seekSlider.value}%`;
  });

  // Volume
  const updateVolumeIcon = () => {
    const icon = volumeBtn.querySelector('.material-symbols-outlined');
    if (!icon) return;
    if (video.muted || video.volume === 0) {
      icon.textContent = 'volume_off';
    } else if (video.volume < 0.5) {
      icon.textContent = 'volume_down';
    } else {
      icon.textContent = 'volume_up';
    }
  };

  volumeSlider.addEventListener('input', () => {
    video.volume = parseFloat(volumeSlider.value);
    video.muted = false;
    updateVolumeIcon();
  });

  volumeBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    if (video.muted) {
      volumeSlider.value = '0';
    } else {
      volumeSlider.value = video.volume.toString();
    }
    updateVolumeIcon();
  });

  // Fullscreen
  fullScreenBtn.addEventListener('click', () => {
    const container = document.querySelector('.video-container-wrapper');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  });

  // Duration loaded
  video.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(video.duration);
  });

  // Video Ended (Mark Completed)
  video.addEventListener('ended', async () => {
    const courseData = getCourseData();
    const currentClassId = getCurrentClassId();

    if (!courseData || !currentClassId) return;

    for (const mod of courseData.modules) {
      const cls = mod.classes.find((c) => c.id === currentClassId);
      if (cls && !cls.isCompleted && onVideoEndedCallback) {
        await onVideoEndedCallback(cls);
        break;
      }
    }
  });
}

/**
 * Reset video controls to initial state
 */
export function resetControls(): void {
  const progressBarFill = document.getElementById(
    'video-progress-fill',
  ) as HTMLElement;
  const seekSlider = document.getElementById(
    'video-seek-slider',
  ) as HTMLInputElement;
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const playBtn = document.getElementById('btn-play-pause');

  if (progressBarFill) progressBarFill.style.width = '0%';
  if (seekSlider) seekSlider.value = '0';
  if (currentTimeEl) currentTimeEl.textContent = '0:00';
  if (durationEl) durationEl.textContent = '0:00';

  if (playBtn) {
    const icon = playBtn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = 'play_arrow';
  }
}

/**
 * Get the video element
 */
export function getVideoElement(): HTMLVideoElement | null {
  return videoElement;
}
