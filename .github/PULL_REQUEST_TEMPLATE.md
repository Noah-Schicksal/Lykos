# Pull Request Template for Unit Tests

> **Instructions**: Copy this template and fill in the relevant sections. Remove sections that don't apply to your PR.

---

## 📋 PR Summary

**One-line summary of what this PR does**

**Status**: [ ] Draft / [ ] Ready for Review / [ ] Ready for Merge  
**Test Coverage**: X% (Y/Z tests passing)  
**Breaking Changes**: [ ] None / [ ] Yes (describe below)

---

## 🎯 Description

### What was done

Clear, concise description of the changes made.

### Why

Explain the motivation and context for these changes:
- Why is this needed?
- What problem does it solve?
- What benefits does it bring?

### Types of Changes

Mark what type of changes this PR contains:

- [ ] New Feature
- [ ] Bug Fix
- [ ] Documentation
- [ ] Infrastructure/Configuration
- [ ] Refactor
- [ ] Performance Improvement

---

## 📁 Files Changed

### New Files

**`path/to/file.ts`** (X lines)
- Brief description
- Key implementation details

### Modified Files

**`path/to/existing/file.ts`**
- What changed
- Why it was necessary

---

## 🧪 Testing & Validation

### Test Coverage

| Component | Tests | Coverage | Status |
|-----------|-------|----------|--------|
| Feature A | Y | X% | ✅/❌ |
| Feature B | Z | X% | ✅/❌ |

### Test Execution

```bash
# Command to run tests
npm test -- path/to/tests

# Expected output
✓ Test Suites: X passed, X total
✓ Tests: Y passed, Y total
```

### Manual Testing (if applicable)

- [ ] Feature tested locally
- [ ] Edge cases verified
- [ ] Error handling validated
- [ ] No regressions observed

---

## ✅ Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] New tests added/updated
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] No breaking changes
- [ ] Git history is clean

---

## 📚 Documentation

### Files Updated

- [ ] README.md
- [ ] TESTES_UNITARIOS.md (or relevant docs)
- [ ] Code comments added
- [ ] Examples provided

### Links

- [Testing Guide](./TESTES_UNITARIOS.md)
- [Contributing Guide](./CONTRIBUTING.md)

---

## 🔍 Review Notes

### For Reviewers

Key areas to focus on:
- Specific lines or sections that might need attention
- Design decisions that might be questioned
- Areas where feedback is especially welcome

### Questions for Reviewers

- Any concerns about the implementation approach?
- Should we consider X in the future?
- Suggestions for improvement?

---

## 📊 Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Test Coverage | X% | 100% |
| Performance | X ms | < Y ms |
| Lines Added | X | - |
| Files Changed | Y | - |

---

## 🔄 Related Issues

Closes: #ISSUE_NUMBER  
Related to: #ISSUE_NUMBER

---

## 📝 Additional Context

Any other information that might be helpful for reviewers:
- Links to discussions
- References to design documents
- Screenshots or examples
- Known limitations

---

## ✨ Highlights

What's particularly good about this implementation:
- Clean architecture
- Comprehensive testing
- Good documentation
- Performance optimized

---

**Author**: @username  
**Date**: YYYY-MM-DD  
**Branch**: feature/branch-name  
**Target**: main/develop  

