/**
 * Admin Module - Main Entry Point
 */

import { Auth } from '../modules/auth.js';
import { initThemeToggle } from '../theme-toggle.js';

// Handlers
import {
  setupSidebarHandlers,
  loadSidebarCourses,
} from './handlers/sidebarHandlers.js';
import { setupDangerZoneHandlers } from './handlers/dangerZoneHandlers.js';
import {
  setupAuthHandlers,
  checkAdminAccess,
  renderUserProfile,
} from './handlers/authHandlers.js';

/**
 * Initialize the admin module
 */
async function initAdmin(): Promise<void> {
  console.log('[Admin] Initializing...');

  // Initialize Core
  Auth.init();
  initThemeToggle();

  // Check Access
  checkAdminAccess();

  // Setup Handlers
  setupAuthHandlers();
  setupSidebarHandlers();
  setupDangerZoneHandlers();

  // Render user profile
  renderUserProfile();

  // Load initial data
  await loadSidebarCourses(true);

  console.log('[Admin] Initialization complete');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAdmin);
