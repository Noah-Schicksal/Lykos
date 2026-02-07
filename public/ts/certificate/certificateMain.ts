/**
 * Certificate Module - Main Entry Point
 */

import {
  loadCertificate,
  setupCertificateHandlers,
} from './handlers/certificateHandlers.js';

/**
 * Initialize the certificate module
 */
async function initCertificate(): Promise<void> {
  console.log('[Certificate] Initializing...');

  setupCertificateHandlers();
  await loadCertificate();

  console.log('[Certificate] Initialization complete');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCertificate);
