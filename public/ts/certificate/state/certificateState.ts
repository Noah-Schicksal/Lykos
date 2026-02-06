/**
 * Certificate State - Centralized state management
 */

// State
let currentHash: string | null = null;
let isEmbedded = false;

// Getters
export function getCurrentHash(): string | null {
  return currentHash;
}

export function getIsEmbedded(): boolean {
  return isEmbedded;
}

// Setters
export function setCurrentHash(hash: string | null): void {
  currentHash = hash;
}

export function setIsEmbedded(embedded: boolean): void {
  isEmbedded = embedded;
}
