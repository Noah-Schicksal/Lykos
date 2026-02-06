/**
 * Centralized state management for course-detail page
 */

import { Course } from '../../modules/courses.js';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface ReviewMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    averageRating: number;
}

// Private state
let currentCourse: Course | null = null;
let currentCourseId: string | null = null;
let currentUser: User | null = null;
let selectedRating: number = 0;
let userHasReview: boolean = false;
let currentReviewsPage: number = 1;
let reviewsMeta: ReviewMeta | null = null;

// Getters
export function getCourse(): Course | null {
    return currentCourse;
}

export function getCourseId(): string | null {
    return currentCourseId;
}

export function getUser(): User | null {
    return currentUser;
}

export function getSelectedRating(): number {
    return selectedRating;
}

export function getUserHasReview(): boolean {
    return userHasReview;
}

export function getCurrentReviewsPage(): number {
    return currentReviewsPage;
}

export function getReviewsMeta(): ReviewMeta | null {
    return reviewsMeta;
}

// Setters
export function setCourse(course: Course | null): void {
    currentCourse = course;
}

export function setCourseId(id: string | null): void {
    currentCourseId = id;
}

export function setUser(user: User | null): void {
    currentUser = user;
}

export function setSelectedRating(rating: number): void {
    selectedRating = rating;
}

export function setUserHasReview(hasReview: boolean): void {
    userHasReview = hasReview;
}

export function setCurrentReviewsPage(page: number): void {
    currentReviewsPage = page;
}

export function setReviewsMeta(meta: ReviewMeta | null): void {
    reviewsMeta = meta;
}

// Utility functions
export function isUserLoggedIn(): boolean {
    return currentUser !== null || localStorage.getItem('auth_user') !== null;
}

export function isUserEnrolled(): boolean {
    return currentCourse?.isEnrolled ?? false;
}

export function isUserCourseCreator(): boolean {
    if (!currentCourse || !currentUser) return false;
    return currentCourse.instructor?.id === currentUser.id;
}

export function getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

export function resetReviewState(): void {
    selectedRating = 0;
    userHasReview = false;
    currentReviewsPage = 1;
    reviewsMeta = null;
}
