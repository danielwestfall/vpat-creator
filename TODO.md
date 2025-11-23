# VPAT Creator - TODO List

## High Priority Features

### 🤝 Collaboration & Assignment
- [ ] **Multi-User Assignment System**
  - Enable assigning specific success criteria or components to different team members
  - Track who is responsible for testing each criterion
  - Show assignment status in the testing workflow sidebar
  - Possible approaches:
    - Add "Assigned To" field in test result form
    - Allow filtering/viewing only assigned items
    - Email notifications when assigned
    - Shared workspace/database for team collaboration
  - **Status**: Not started
  - **Priority**: High (user requested)

## Known Issues to Fix

### Bug Export Service
- [x] ✅ **FIXED**: Component ID field missing - made components optional with fallback name

### Code Quality
- [ ] Fix unused `setBugs` variable in `BugReportGenerator.tsx` (line 29)
- [ ] Fix unused `components` parameter in `pdf-export-service.ts` (line 20)
- [ ] Add keyboard support for accessibility (TestingWorkflow.tsx line 790, BugReportGenerator.tsx line 79)
  - Add `onKeyDown` handlers
  - Add `role="button"` and `tabIndex={0}` attributes

### Test Files
- [ ] Fix Button.test.tsx type errors (not critical for runtime)

## Feature Enhancements

### Phase 1: Keyboard Shortcuts
- [ ] Add `Ctrl+Enter` or `Ctrl+S` to save current result
- [ ] Add `Ctrl+→` and `Ctrl+←` for navigation between criteria
- [ ] Add `Escape` to cancel current edit
- [ ] Add `?` to show keyboard shortcuts help

### Phase 2: Quick Actions
- [ ] "Mark all remaining as Not Applicable" bulk action
- [ ] Enhanced "Jump to Next Untested" button
- [ ] Bulk status update for multiple criteria
- [ ] Quick filter for showing only untested items

### Phase 3: Enhanced Navigation
- [ ] Search/filter in sidebar for finding specific criteria
- [ ] Group criteria by compliance status (passing, failing, not tested)
- [ ] Collapsible sections by WCAG level (A, AA, AAA)
- [ ] Breadcrumb navigation

### Phase 4: Screenshot Integration
- [ ] Show screenshot preview thumbnails in test result form
- [ ] Quick screenshot capture button near notes field
- [ ] Screenshot carousel for viewing multiple screenshots
- [ ] Drag & drop screenshot upload

### Phase 5: Reporting & Export
- [ ] Custom report templates
- [ ] Export to CSV/Excel format
- [ ] Email report directly from app
- [ ] Comparison reports (before/after audits)

### Phase 6: Data Management
- [ ] Import from other VPAT tools
- [ ] Batch import from spreadsheet
- [ ] Version history for audits
- [ ] Duplicate audit for similar pages

## Future Considerations

### Team Collaboration Features
- [ ] Real-time collaboration (multiple users editing simultaneously)
- [ ] Comment threads on specific criteria
- [ ] Approval workflow (reviewer can approve/reject results)
- [ ] Activity log showing who changed what
- [ ] Role-based permissions (admin, tester, reviewer, viewer)

### Advanced Features
- [ ] Automated testing integration (connect to axe, WAVE, etc.)
- [ ] AI-powered suggestions for common issues
- [ ] Template library for common components
- [ ] Integration with issue tracking systems (Jira, GitHub Issues)
- [ ] Mobile app for on-the-go testing

---

## Completed ✅

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

**Last Updated**: 2025-11-20 23:31 CST
