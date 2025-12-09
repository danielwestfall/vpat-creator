# Standards Mapping Documentation

## Overview

This document explains how WCAG test results are mapped to other accessibility standards supported by the VPAT Creator.

## Supported Standards

### WCAG 2.1 / 2.2 (Web Content Accessibility Guidelines)
- **Organization**: W3C (World Wide Web Consortium)
- **Current Versions**: 2.1 (June 2018), 2.2 (October 2023)
- **Levels**: A (minimum), AA (recommended), AAA (enhanced)
- **Status**: International standard, basis for most other accessibility requirements

### EN 301 549 (European Standard)
- **Full Title**: EN 301 549 - "Accessibility requirements for ICT products and services"
- **Organization**: ETSI (European Telecommunications Standards Institute)
- **Current Version**: V3.2.1 (2021-03)
- **Scope**: ICT products and services (web, mobile, software, hardware, documents)
- **WCAG Alignment**: Section 9 directly references WCAG 2.1 Level A & AA

### Section 508 (U.S. Federal Standard)
- **Full Title**: Section 508 of the Rehabilitation Act
- **Organization**: U.S. Access Board
- **Current Version**: Revised Standards (2017)
- **Scope**: Federal ICT procurement requirements
- **WCAG Alignment**: Incorporates WCAG 2.0 Level A & AA by reference

## Mapping Strategy

### 1. EN 301 549 Mapping

**Direct Mapping:**
EN 301 549 Section 9 (Web content) directly references WCAG 2.1 criteria with a 1:1 mapping structure:
- Section 9.{principle}.{guideline}.{criterion} maps to WCAG {principle}.{guideline}.{criterion}
- Example: EN 9.1.1.1 = WCAG 1.1.1 (Non-text Content)

**Implementation:**
- WCAG 2.1 results automatically satisfy corresponding EN 301 549 requirements
- WCAG 2.2 new criteria (2.4.11, 2.4.12, 2.4.13, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8, 3.3.9) require evaluation for future EN versions
- Additional EN sections (e.g., Section 10 for documents, Section 11 for software) require separate testing

**Status Mapping:**
```
WCAG Status → EN 301 549 Status
Supports → Supports
Partially Supports → Partially Supports
Does Not Support → Does Not Support
Not Tested → Not Tested
```

When multiple WCAG criteria map to one EN requirement, use the worst status.

### 2. Section 508 Mapping

**Direct Mapping:**
Section 501 states that compliance with WCAG 2.0 Level A and AA satisfies Section 502 and 503 web requirements.

**Additional Requirements:**
Some Section 508 requirements extend beyond WCAG:
- **502.3.1 (Object Information)**: Maps to WCAG 1.3.1 and 4.1.2 but requires platform-specific API testing
- **502.3.2 (Modification)**: Requires programmatic control verification
- **503.4 (User Controls)**: Requires presence of caption/audio description controls, not just content

**Implementation:**
- WCAG 2.0 Level A/AA results automatically satisfy most Section 508 web requirements
- Additional technical requirements (502.x) may need platform-specific testing
- Software (502) and hardware (503) sections require separate evaluation

**Status Mapping:**
```
WCAG Status → Section 508 Status
Supports (all relevant) → Supports
Any Partially Supports → Partially Supports
Any Does Not Support → Does Not Support
```

## WCAG 2.2 New Criteria

WCAG 2.2 adds 9 new success criteria:

| SC Number | Level | Title | EN 301 549 | Section 508 |
|-----------|-------|-------|------------|-------------|
| 2.4.11 | AA | Focus Not Obscured (Minimum) | TBD (V4.0) | Apply WCAG |
| 2.4.12 | AAA | Focus Not Obscured (Enhanced) | TBD | Apply WCAG |
| 2.4.13 | AAA | Focus Appearance | TBD | Apply WCAG |
| 2.5.7 | AA | Dragging Movements | TBD | Apply WCAG |
| 2.5.8 | AA | Target Size (Minimum) | TBD | Apply WCAG |
| 3.2.6 | A | Consistent Help | TBD | Apply WCAG |
| 3.3.7 | A | Redundant Entry | TBD | Apply WCAG |
| 3.3.8 | AA | Accessible Authentication (Minimum) | TBD | Apply WCAG |
| 3.3.9 | AAA | Accessible Authentication (Enhanced) | TBD | Apply WCAG |

**Note**: Since Section 508 (2017) references WCAG 2.0, and the Revised 508 Standards state that content conforming to a higher level satisfies lower levels, WCAG 2.2 results should be applicable. However, official guidance should be consulted.

## Using the Mapping in VPAT Creator

1. **Select Standards**: In the Audit Scope configuration, check which additional standards to include
2. **Test WCAG**: Complete WCAG testing workflow
3. **Automatic Mapping**: Results are automatically mapped to EN 301 549 and Section 508 where 1:1 correspondence exists
4. **Additional Testing**: For non-direct mappings, additional questions or tests may be presented
5. **Export**: The final VPAT includes all selected standards with mapped results

## References

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- EN 301 549 V3.2.1: https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf
- Section 508 (Revised): https://www.access-board.gov/ict/
- WCAG to EN 301 549 Mapping: Built into EN 301 549 Section 9
- WCAG to Section 508 Mapping: https://www.access-board.gov/ict/#wcag-conformance

## Future Enhancements

- Automatic detection of platform-specific requirements (e.g., desktop vs mobile)
- Additional questions for non-WCAG Section 508 requirements (hardware, software APIs)
- Support for EN 301 549 Section 10 (Documents) and Section 11 (Software)
- ARIA usage analysis for Section 508 502.3 requirements
- Keyboard trap detection for 508 502.3.3
