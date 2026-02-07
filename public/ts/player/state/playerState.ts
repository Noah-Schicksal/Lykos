/**
 * Player State - Centralized state management
 */

export interface ClassItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  moduleId: string;
  isCompleted?: boolean;
  materialUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  classes: ClassItem[];
}

export interface CourseFull {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  progress: number;
  coverImageUrl?: string;
}

// State
let courseId = '';
let currentClassId = '';
let courseData: CourseFull | null = null;
const openModules = new Set<string>();

// Getters
export function getCourseId(): string {
  return courseId;
}

export function getCurrentClassId(): string {
  return currentClassId;
}

export function getCourseData(): CourseFull | null {
  return courseData;
}

export function getOpenModules(): Set<string> {
  return openModules;
}

// Setters
export function setCourseId(id: string): void {
  courseId = id;
}

export function setCurrentClassId(id: string): void {
  currentClassId = id;
}

export function setCourseData(data: CourseFull | null): void {
  courseData = data;
}

export function addOpenModule(moduleId: string): void {
  openModules.add(moduleId);
}

export function removeOpenModule(moduleId: string): void {
  openModules.delete(moduleId);
}

export function toggleOpenModule(moduleId: string): void {
  if (openModules.has(moduleId)) {
    openModules.delete(moduleId);
  } else {
    openModules.add(moduleId);
  }
}
