/**
 * Admin State - Centralized state management
 */

// Constants
export const LIMIT = 10;

// State
let currentCourseId: string | null = null;
let currentPage = 1;
let currentSearch = '';
let isLoading = false;

// Getters
export function getCurrentCourseId(): string | null {
  return currentCourseId;
}

export function getCurrentPage(): number {
  return currentPage;
}

export function getCurrentSearch(): string {
  return currentSearch;
}

export function getIsLoading(): boolean {
  return isLoading;
}

// Setters
export function setCurrentCourseId(id: string | null): void {
  currentCourseId = id;
}

export function setCurrentPage(page: number): void {
  currentPage = page;
}

export function incrementPage(): void {
  currentPage++;
}

export function setCurrentSearch(search: string): void {
  currentSearch = search;
}

export function setIsLoading(loading: boolean): void {
  isLoading = loading;
}

export function resetPagination(): void {
  currentPage = 1;
}
