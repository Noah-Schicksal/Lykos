import { Courses } from '../../modules/courses.js';
import { Categories } from '../../modules/categories.js';
import {
  setAllCourses,
  setFilteredCourses,
  setCurrentPage,
  getFilteredCourses,
  getAllCourses,
  getCurrentPage,
  getItemsPerPage,
} from '../state/homeState.js';
import {
  updateCoursesGrid,
  showGridLoading,
  showGridError,
} from '../components/coursesGrid.js';
import { updateCategoryFilter } from '../components/filters.js';
import {
  updatePagination,
  setupPaginationHandlers,
} from '../components/pagination.js';
import { addToCart } from './cartHandlers.js';

/**
 * Sets up all course-related handlers
 */
export function setupCourseHandlers(): void {
  setupFilterHandlers();
  setupPaginationHandlers(handlePageChange);
}

function setupFilterHandlers(): void {
  const searchInput = document.getElementById('main-search-input');
  const categorySelect = document.getElementById('category-filter');

  searchInput?.addEventListener('input', applyFilters);
  categorySelect?.addEventListener('change', applyFilters);
}

/**
 * Loads all courses from the API
 */
export async function loadCourses(): Promise<void> {
  try {
    showGridLoading();

    const response = await Courses.getAll(1, 1000);
    const courses = response.data || [];

    setAllCourses(courses);
    setCurrentPage(1);

    console.log(`[Home] Loaded ${courses.length} courses`);
    renderPage(1, false);
  } catch (error) {
    console.error('[Home] Error loading courses:', error);
    showGridError();
  }
}

/**
 * Loads all categories from the API
 */
export async function loadCategories(): Promise<void> {
  try {
    const categories = await Categories.getAll();
    updateCategoryFilter(categories);
  } catch (error) {
    console.error('[Home] Error loading categories:', error);
  }
}

/**
 * Applies search and category filters
 */
export function applyFilters(): void {
  const searchInput = document.getElementById(
    'main-search-input',
  ) as HTMLInputElement;
  const categorySelect = document.getElementById(
    'category-filter',
  ) as HTMLSelectElement;

  const term = searchInput?.value.toLowerCase().trim() || '';
  const categoryId = categorySelect?.value || '';

  const allCourses = getAllCourses();

  const filtered = allCourses.filter((course) => {
    const matchesTerm =
      !term ||
      course.title.toLowerCase().includes(term) ||
      (course.category?.name &&
        course.category.name.toLowerCase().includes(term));

    const matchesCategory =
      !categoryId || (course.category && course.category.id === categoryId);

    return matchesTerm && matchesCategory;
  });

  setFilteredCourses(filtered);
  console.log(
    `[Home] Filter: term="${term}", cat="${categoryId}" found ${filtered.length}`,
  );

  renderPage(1, false);
}

/**
 * Renders a specific page of courses
 */
export function renderPage(page: number, shouldScroll: boolean = true): void {
  console.log(`[Home] Rendering page ${page}`);
  setCurrentPage(page);

  const filteredCourses = getFilteredCourses();
  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedCourses = filteredCourses.slice(start, end);

  updateCoursesGrid(paginatedCourses, handleAddToCart);
  updatePagination(page, totalPages);

  if (shouldScroll) {
    const section = document.getElementById('courses-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

function handlePageChange(page: number): void {
  console.log(`[Home] Pagination click: going to page ${page}`);
  renderPage(page, true);
}

function handleAddToCart(courseId: string): void {
  addToCart(courseId);
}
