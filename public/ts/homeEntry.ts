/**
 * Home Page Entry Point
 * Loads the modular home module
 */

import { initHome } from './home/main.js';

// Initialize home when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initHome());
} else {
  initHome();
}
