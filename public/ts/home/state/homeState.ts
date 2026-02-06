import { Course } from '../../modules/courses.js';

/**
 * Home State - Global state management for home page
 */

export interface CartItem {
  courseId: string;
}

interface HomeStateType {
  allCourses: Course[];
  filteredCourses: Course[];
  currentPage: number;
  itemsPerPage: number;
  cartItems: string[];
  selectedCategory: string;
}

const state: HomeStateType = {
  allCourses: [],
  filteredCourses: [],
  currentPage: 1,
  itemsPerPage: 12,
  cartItems: [],
  selectedCategory: '',
};

// Getters
export function getAllCourses(): Course[] {
  return state.allCourses;
}

export function getFilteredCourses(): Course[] {
  return state.filteredCourses;
}

export function getCurrentPage(): number {
  return state.currentPage;
}

export function getItemsPerPage(): number {
  return state.itemsPerPage;
}

export function getCartItems(): string[] {
  return state.cartItems;
}

export function getSelectedCategory(): string {
  return state.selectedCategory;
}

// Setters
export function setAllCourses(courses: Course[]): void {
  state.allCourses = courses;
  state.filteredCourses = courses;
}

export function setFilteredCourses(courses: Course[]): void {
  state.filteredCourses = courses;
}

export function setCurrentPage(page: number): void {
  state.currentPage = page;
}

export function setCartItems(items: string[]): void {
  state.cartItems = items;
}

export function addCartItem(courseId: string): void {
  if (!state.cartItems.includes(courseId)) {
    state.cartItems.push(courseId);
  }
}

export function removeCartItem(courseId: string): void {
  state.cartItems = state.cartItems.filter((id) => id !== courseId);
}

export function setSelectedCategory(categoryId: string): void {
  state.selectedCategory = categoryId;
}

export function resetState(): void {
  state.allCourses = [];
  state.filteredCourses = [];
  state.currentPage = 1;
  state.cartItems = [];
  state.selectedCategory = '';
}

export const HomeState = {
  get: () => ({ ...state }),
};
