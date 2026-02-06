/**
 * Certificate Validator Module - Main Entry Point
 */

import { setupValidatorHandlers } from './handlers/validatorHandlers.js';

/**
 * Initialize the certificate validator module
 */
function initValidator(): void {
  console.log('[Validator] Initializing...');

  setupValidatorHandlers();

  console.log('[Validator] Initialization complete');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initValidator);
