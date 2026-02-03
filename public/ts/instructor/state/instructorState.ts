export interface User {
  id: string;
  name: string;
  email: string;
  role: 'INSTRUCTOR' | 'STUDENT' | 'ADMIN';
  profilePicture?: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  coverImage?: string;
  maxStudents?: number;
  instructorId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Class {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  materialUrl?: string;
  orderIndex: number;
  moduleId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  id: string;
  title: string;
  orderIndex: number;
  courseId: string;
  classes?: Class[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoadingState {
  [key: string]: boolean;
}

interface InstructorStateType {
  currentCourseId: string | null;
  currentUser: User | null;
  allCategories: Category[];
  isContentExpanded: boolean;
  loadingState: LoadingState;
  pendingCategoryId: string | null;
}

const state: InstructorStateType = {
  currentCourseId: null,
  currentUser: null,
  allCategories: [],
  isContentExpanded: false,
  loadingState: {},
  pendingCategoryId: null,
};

export function getCurrentCourseId(): string | null {
  return state.currentCourseId;
}

export function getCurrentUser(): User | null {
  return state.currentUser;
}

export function getAllCategories(): Category[] {
  return state.allCategories;
}

export function isContentExpanded(): boolean {
  return state.isContentExpanded;
}

export function getLoadingState(): LoadingState {
  return state.loadingState;
}

export function getPendingCategoryId(): string | null {
  return state.pendingCategoryId;
}

export function setCurrentCourseId(courseId: string | null): void {
  state.currentCourseId = courseId;
}

export function setCurrentUser(user: User | null): void {
  state.currentUser = user;
}

export function setAllCategories(categories: Category[]): void {
  state.allCategories = categories;
}

export function setContentExpanded(expanded: boolean): void {
  state.isContentExpanded = expanded;
}

export function setLoading(key: string, isLoading: boolean): void {
  state.loadingState[key] = isLoading;
}

export function setPendingCategoryId(categoryId: string | null): void {
  state.pendingCategoryId = categoryId;
}

export function resetState(): void {
  state.currentCourseId = null;
  state.currentUser = null;
  state.allCategories = [];
  state.isContentExpanded = false;
  state.loadingState = {};
  state.pendingCategoryId = null;
}

export const InstructorState = {
  get: () => ({ ...state }),
};
