# VPAT Creator - TODO List

## High Priority Features

### 🤝 Collaboration & Assignment
- [x] **Multi-User Assignment System**
  - Enable assigning specific success criteria or components to different team members
  - Track who is responsible for testing each criterion
  - Show assignment status in the testing workflow sidebar
  - **Status**: Complete
  - **Priority**: High (user requested)

## Known Issues to Fix

### Bug Export Service
- [x] ✅ **FIXED**: Component ID field missing - made components optional with fallback name

### Code Quality
- [x] ✅ **FIXED**: Fix unused `setBugs` variable in `BugReportGenerator.tsx` (line 29)
- [x] ✅ **FIXED**: Fix unused `components` parameter in `pdf-export-service.ts` (line 20)
- [x] ✅ **FIXED**: Fix Button.test.tsx type errors (not critical for runtime)
- [x] ✅ **FIXED**: Add keyboard support for accessibility (TestingWorkflow.tsx, BugReportGenerator.tsx, etc.)
  - Added `onKeyDown` handlers
  - Added `role="button"` and `tabIndex={0}` attributes
  - Fixed `jsx-a11y` lint errors across the codebase

### Test Files
- [x] ✅ **FIXED**: Fix Button.test.tsx type errors (not critical for runtime)

## Feature Enhancements

### Phase 1: Keyboard Shortcuts
- [x] Add `Ctrl+S` to save current result
- [x] Add `Alt+→` (Next) and `Alt+←` (Previous) for navigation
- [x] Add `Alt+P` (Pass/Supports) and `Alt+F` (Fail/Does Not Support) shortcuts
- [x] Add `?` to show keyboard shortcuts help

### Phase 2: Quick Actions
- [x] "Mark all remaining as Not Applicable" bulk action
- [x] Enhanced "Jump to Next Untested" button (via Untested Only filter)
- [x] Bulk status update for multiple criteria
- [x] Quick filter for showing only untested items

### Phase 3: Enhanced Navigation
- [x] Search/filter in sidebar for finding specific criteria
- [x] Group criteria by compliance status (passing, failing, not tested)
- [x] Collapsible sections by WCAG level (A, AA, AAA)
- [x] Breadcrumb navigation

### Phase 4: Screenshot Integration
- [x] Show screenshot preview thumbnails in test result form
- [x] Quick screenshot capture button near notes field (Paste support added)
- [x] Screenshot carousel for viewing multiple screenshots
- [x] Drag & drop screenshot upload

### Phase 5: Reporting & Export
- [x] Custom report templates
- [x] Export to CSV/Excel format
- [x] Email report directly from app
- [x] Comparison reports (before/after audits)

### Phase 6: Data Management
- [x] Import from other VPAT tools (axe-core JSON support added)
- [x] Batch import from spreadsheet (CSV Import added)
- [x] Version history for audits
- [x] Duplicate audit for similar pages (via Snapshots)

## Future Considerations

### Team Collaboration Features
- [ ] Real-time collaboration (multiple users editing simultaneously)
- [ ] Comment threads on specific criteria
- [ ] Approval workflow (reviewer can approve/reject results)
- [ ] Activity log showing who changed what
- [ ] Role-based permissions (admin, tester, reviewer, viewer)

### Advanced Features
- [x] **Automated Testing Integration**: Integrate `axe-core` to auto-scan components and pre-fill pass/fail status for automated criteria.
- [x] **Issue Tracker Integration**: Connect to Jira/GitHub to automatically create tickets from failed test results.
  - [x] GitHub Integration
  - [x] Asana Integration
  - [x] Jira Integration
- [ ] **Browser Extension Companion**: Create a Chrome/Edge extension to test directly within the target website, capturing DOM elements and screenshots.
- [ ] **Real-Time Collaboration**: Implement backend sync (Supabase/Firebase) for simultaneous multi-user editing.
- [ ] AI-powered suggestions for common issues
- [ ] Template library for common components
- [ ] Integration with issue tracking systems (Jira, GitHub Issues)
- [ ] Mobile app for on-the-go testing

---

## Completed ✅

- [x] Accessibility Audit & Fixes (WCAG compliance for the tool itself)
- [x] Auto-save functionality (saves to IndexedDB automatically)
- [x] Resume audit from saved state on page load
- [x] Clear Audit button to start fresh
- [x] Bug export service compatibility fix
- [x] Screenshot management integration
- [x] PDF export functionality
- [x] Bug report generator
- [x] Component-based testing view
- [x] Custom column support in audits
- [x] Type system improvements (UITestResult vs DBTestResult)

---

**Last Updated**: 2025-11-23 09:12 CST
