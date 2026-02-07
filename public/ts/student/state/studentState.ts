/**
 * Student Dashboard State Management
 */

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface Course {
    id: string;
    title: string;
    description?: string;
    instructorName?: string;
    category?: string;
    categoryId?: string;
    coverImageUrl?: string;
    progress: number;
    enrolledAt?: string;
    certificateHash?: string;
}

let currentUser: User | null = null;
let allCourses: Course[] = [];
let filteredCourses: Course[] = [];
let currentView: 'courses' | 'certificates' = 'courses';

export function setCurrentUser(user: User | null): void {
    currentUser = user;
}

export function getCurrentUser(): User | null {
    return currentUser;
}

export function setAllCourses(courses: Course[]): void {
    allCourses = courses;
    filteredCourses = courses;
}

export function getAllCourses(): Course[] {
    return allCourses;
}

export function setFilteredCourses(courses: Course[]): void {
    filteredCourses = courses;
}

export function getFilteredCourses(): Course[] {
    return filteredCourses;
}

export function setCurrentView(view: 'courses' | 'certificates'): void {
    currentView = view;
}

export function getCurrentView(): 'courses' | 'certificates' {
    return currentView;
}
