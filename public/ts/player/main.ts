/**
 * Player Module - Main Entry Point
 */

import { AppUI } from '../utils/ui.js';
import { Auth } from '../modules/auth.js';
import { Cart } from '../modules/cart.js';
import { initThemeToggle } from '../theme-toggle.js';

// State
import { setCourseId } from './state/playerState.js';

// Handlers
import {
  setupVideoHandlers,
  setOnVideoEndedCallback,
} from './handlers/videoHandlers.js';
import { setupSidebarHandlers, setupTabs } from './handlers/sidebarHandlers.js';
import { setupAuthHandlers } from './handlers/authHandlers.js';
import {
  loadCourseData,
  setupNextLessonHandler,
  toggleCompletion,
} from './handlers/progressHandlers.js';

/**
 * Initialize the player module
 */
async function initPlayer(): Promise<void> {
  console.log('[Player] Initializing...');

  // Get courseId from URL
  let id = new URLSearchParams(window.location.search).get('courseId');

  if (!id) {
    // Try extracting from path /aula/:id
    const match = window.location.pathname.match(/\/aula\/([^\/]+)/);
    if (match && match[1]) {
      id = match[1];
    }
  }

  if (!id) {
    AppUI.showMessage('Curso não especificado.', 'error');
    setTimeout(() => (window.location.href = '/inicio'), 2000);
    return;
  }

  setCourseId(id);

  // Initialize Core
  initThemeToggle();
  await Auth.init();
  Cart.updateBadge();

  // Auth Check
  const user = localStorage.getItem('auth_user');
  if (!user) {
    window.location.href = '/inicio';
    return;
  }

  // Setup Handlers
  setupAuthHandlers();
  setupSidebarHandlers();
  setupTabs();
  setupNextLessonHandler();

  // Inject callback para evitar dependência circular
  setOnVideoEndedCallback(toggleCompletion);
  setupVideoHandlers();

  // Load Course Data
  await loadCourseData();

  console.log('[Player] Initialization complete');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initPlayer);
