# Pull Request Guidelines & Best Practices

This document provides comprehensive guidelines for creating high-quality pull requests for this project.

---

## 📋 Table of Contents

1. [General Guidelines](#general-guidelines)
2. [PR Types & Requirements](#pr-types--requirements)
3. [Testing Requirements](#testing-requirements)
4. [Documentation Requirements](#documentation-requirements)
5. [Code Style](#code-style)
6. [Git Workflow](#git-workflow)
7. [Review Process](#review-process)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## General Guidelines

### Before Creating a PR

- [ ] Sync with main/develop branch
- [ ] Check if a similar PR already exists
- [ ] Ensure your changes are focused and atomic
- [ ] Write clear commit messages
- [ ] Keep PR size manageable (< 400 lines of code changes)

### PR Title Format

Use one of these formats:

```
feat: add CourseService unit tests
fix: correct validation in UserService
docs: update testing documentation
refactor: simplify error handling logic
test: add missing test cases
perf: optimize database queries
chore: update dependencies
```

### PR Description

Every PR must include:

1. **Clear Description**: What was changed and why
2. **Motivation**: Why is this change needed
3. **Testing**: How was this tested
4. **Screenshots/Examples**: If applicable
5. **Breaking Changes**: If any

---

## PR Types & Requirements

### 1. Feature PRs

**Purpose**: New functionality

**Requirements**:
- [ ] Implement complete feature
- [ ] Add comprehensive tests (aim for 100% coverage)
- [ ] Update documentation
- [ ] No breaking changes (unless discussed)
- [ ] Add examples if applicable

**Template**:
```markdown
## What was implemented
- Feature X with functionality Y
- Method A that does B
- Class C that handles D

## Testing
- [x] Unit tests written (X test cases)
- [x] Integration tested locally
- [x] Edge cases covered

## Documentation
- [x] README updated
- [x] Code comments added
- [x] Examples provided
```

### 2. Bug Fix PRs

**Purpose**: Fix existing issues

**Requirements**:
- [ ] Identify root cause
- [ ] Fix the bug
- [ ] Add regression test
- [ ] Update documentation if needed
- [ ] Verify fix works

**Template**:
```markdown
## Bug Description
What was the problem?

## Root Cause
Why was it happening?

## Fix Applied
What was changed?

## Testing
- [x] Fix verified
- [x] Regression test added
- [x] No new issues introduced
```

### 3. Documentation PRs

**Purpose**: Improve documentation

**Requirements**:
- [ ] Clear and concise writing
- [ ] Accurate technical content
- [ ] Proper formatting
- [ ] Examples where applicable
- [ ] Links to related resources

**Template**:
```markdown
## Documentation Changed
- File A: Updated section X
- File B: Added section Y

## Reason for Changes
Why was this documentation needed/improved?

## Preview
[Include relevant excerpts]
```

### 4. Refactor PRs

**Purpose**: Improve code quality without changing behavior

**Requirements**:
- [ ] No functionality changes
- [ ] All tests still pass
- [ ] Improved readability/performance
- [ ] Updated documentation if needed
- [ ] Clear commit history

**Template**:
```markdown
## What was refactored
- Component/Service/File that was refactored
- Why it was refactored
- How it was improved

## Impact
- Performance impact: X%
- Code complexity: Reduced Y%
- Maintainability: Improved Z%

## Testing
- [x] All tests passing
- [x] No regressions
- [x] Performance verified
```

### 5. Testing PRs

**Purpose**: Add or improve test coverage

**Requirements**:
- [ ] Comprehensive test cases
- [ ] Proper mock setup
- [ ] 100% method coverage target
- [ ] Clear test descriptions
- [ ] Test documentation

**Template**:
```markdown
## Tests Added
- Service/Feature tested: X
- Total test cases: Y
- Coverage: Z%

## Test Coverage
| Component | Tests | Coverage |
|-----------|-------|----------|
| Method A  | X     | Y%       |
| Method B  | Z     | W%       |

## Test Patterns Used
- AAA (Arrange-Act-Assert)
- Mock factories
- Error scenario testing
- Permission validation

## How to Run
npm test -- path/to/test
```

---

## Testing Requirements

### Unit Tests

**Must Include**:
- [x] Happy path tests
- [x] Error/edge case tests
- [x] Validation tests
- [x] Permission/authorization tests (if applicable)

**Guidelines**:
- Test one thing per test
- Use descriptive test names
- Follow AAA pattern (Arrange-Act-Assert)
- Mock external dependencies
- Aim for 100% coverage

**Example**:
```typescript
describe('CourseService', () => {
  describe('create', () => {
    it('should create a new course when data is valid', async () => {
      // Arrange
      const courseData = { title: 'Test', categoryId };
      mockCategoryRepository.findById.mockReturnValue(category);

      // Act
      const result = await courseService.create(courseData, instructorId);

      // Assert
      expect(result.id).toBeDefined();
      expect(mockCourseRepository.save).toHaveBeenCalled();
    });

    it('should throw error when category does not exist', async () => {
      // Arrange
      mockCategoryRepository.findById.mockReturnValue(null);

      // Act & Assert
      await expect(courseService.create(data, instructorId))
        .rejects.toThrow(ApplicationError);
    });
  });
});
```

### Test Coverage Targets

| PR Type | Coverage Target | Comment |
|---------|-----------------|---------|
| New Service | 100% | Comprehensive coverage expected |
| New Feature | >80% | Cover main paths and errors |
| Bug Fix | 100% | Add regression test |
| Refactor | 100% | Maintain existing coverage |

### Running Tests

```bash
# Run specific test file
npm test -- tests/unit/services/serviceService.test.ts --runInBand

# Run all unit tests
npm test -- tests/unit/

# Run with coverage
npm test -- --coverage

# Watch mode (development)
npm test -- --watch
```

---

## Documentation Requirements

### Code Documentation

**Every public method/service should have**:
- JSDoc comments explaining purpose
- Parameter descriptions
- Return type documentation
- Error handling notes

**Example**:
```typescript
/**
 * Creates a new course with validation
 * @param data - Course data (title, description, categoryId, price)
 * @param instructorId - ID of the course instructor
 * @returns Created course object with generated ID
 * @throws ApplicationError if category doesn't exist or required fields missing
 */
async create(data: CreateCourseDTO, instructorId: string): Promise<Course> {
  // Implementation
}
```

### README Updates

If your PR adds new features, update relevant sections:
- Installation/Setup
- Usage examples
- API documentation
- Configuration options

### Testing Documentation

Update `TESTES_UNITARIOS.md` with:
- Service overview
- Test cases and scenarios
- Coverage metrics
- How to run tests

---

## Code Style

### TypeScript Standards

- ✅ Use strict mode (`strict: true`)
- ✅ Proper type annotations
- ✅ No `any` without justification
- ✅ Interface over type (where applicable)
- ✅ Consistent naming conventions

### Naming Conventions

```typescript
// Services: PascalCase
class CourseService { }

// Methods: camelCase
async createCourse() { }

// Constants: UPPER_SNAKE_CASE
const MAX_STUDENTS = 30;

// Interfaces: IPascalCase or PascalCase
interface ICreateCourseDTO { }
interface CourseDTO { }

// Mocks: mockXxx
const mockCourseRepository = { };
```

### Code Organization

```
src/
├── services/
│   └── courseService.ts           // Business logic
├── repositories/
│   └── courseRepository.ts         // Data access
├── entities/
│   └── Course.ts                   // Data models
├── dtos/
│   └── courseDTOs.ts               // Data transfer objects
└── middlewares/
    └── errorHandler.ts             // Middleware
```

### Error Handling

```typescript
// ✅ Good: Specific error handling
try {
  const category = await this.categoryRepository.findById(categoryId);
  if (!category) {
    throw new ApplicationError('Category not found');
  }
} catch (error) {
  if (error instanceof ApplicationError) {
    // Handle application error
  } else {
    // Handle unexpected error
  }
}

// ❌ Avoid: Generic error handling
try {
  // ...
} catch (error) {
  console.log('Error');
}
```

---

## Git Workflow

### Branch Naming

```
feature/short-description
fix/short-description
docs/short-description
refactor/short-description
test/short-description
```

### Commit Message Format

```
type(scope): subject

body

footer
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/dependency changes

**Examples**:
```
feat(courseService): add CourseService unit tests

Added comprehensive unit tests for CourseService covering all 8 methods
with permission validation and error scenarios.

- 22 test cases covering create, list, update, delete, getStudents
- Permission checks for protected operations
- Mock factories for CourseRepository and CategoryRepository

Closes #123
```

### Before Pushing

```bash
# Update with main branch
git pull --rebase origin main

# Verify tests pass
npm test

# Check for TypeScript errors
npm run build

# Ensure clean history
git log --oneline -5  # Should see 3-5 focused commits
```

---

## Review Process

### What Reviewers Look For

1. **Correctness**: Does the code work as intended?
2. **Design**: Is the architecture clean and maintainable?
3. **Testing**: Are there adequate tests with good coverage?
4. **Documentation**: Is it well documented?
5. **Performance**: Any performance concerns?
6. **Security**: Any security issues?
7. **Style**: Does it follow project standards?

### Addressing Feedback

- ✅ Respond to all comments
- ✅ Ask questions if unclear
- ✅ Make requested changes in separate commits
- ✅ Mark conversations as resolved
- ✅ Re-request review after changes

### Timeline

- Expect review within 24-48 hours
- Simple PRs: 1 approval required
- Major changes: 2 approvals required
- Merge after approved and tests passing

---

## Common Mistakes to Avoid

### ❌ Large PRs

**Problem**: Difficult to review, easy to miss issues

**Solution**: Keep PRs < 400 lines of code changes

### ❌ Poor Test Coverage

**Problem**: Regressions slip through, maintenance harder

**Solution**: Aim for 100% method coverage, include error scenarios

### ❌ Missing Documentation

**Problem**: Others can't understand or use the code

**Solution**: Add JSDoc, update README, add examples

### ❌ Unclear Commit Messages

**Problem**: Git history becomes useless

**Solution**: Use meaningful commit messages with context

### ❌ Not Syncing with Main

**Problem**: Merge conflicts, outdated code

**Solution**: Rebase frequently, sync before PR

### ❌ Changing Unrelated Code

**Problem**: Harder to review, unclear scope

**Solution**: Keep each PR focused on one change

### ❌ Not Running Tests Locally

**Problem**: CI/CD failures, wasted time

**Solution**: Run `npm test` before pushing

### ❌ Breaking Changes Without Discussion

**Problem**: Breaks other code, requires coordination

**Solution**: Discuss breaking changes beforehand

### ❌ Hardcoded Values

**Problem**: Not reusable, hard to maintain

**Solution**: Use constants, configuration, environment variables

### ❌ Ignoring TypeScript Errors

**Problem**: Runtime errors in production

**Solution**: Use strict mode, fix all errors, no `any` unless justified

---

## Example: Perfect PR Checklist

- [x] Branch created from latest main
- [x] Feature/fix implemented completely
- [x] 100% test coverage with multiple scenarios
- [x] All tests passing locally (`npm test`)
- [x] No TypeScript errors (`npm run build`)
- [x] Code follows style guidelines
- [x] JSDoc comments added
- [x] Documentation updated
- [x] Commit history is clean (3-5 focused commits)
- [x] Commit messages are descriptive
- [x] PR title follows format
- [x] PR description is complete
- [x] Related issues linked
- [x] No breaking changes (or discussed)
- [x] Ready for review!

---

## Resources

- [Jest Testing Guide](https://jestjs.io/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

---

**Last Updated**: January 27, 2026  
**Maintained By**: Development Team

