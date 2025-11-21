# VPAT Creator

A comprehensive web application for conducting WCAG 2.2 accessibility audits and generating VPAT (Voluntary Product Accessibility Template) reports.

## 🌟 Features

### Core Functionality
- **WCAG 2.2 Compliance Testing** - Full support for all WCAG 2.2 success criteria (A, AA, AAA)
- **Component-Based Testing** - Organize tests by UI components or success criteria
- **Testing Schedules** - Generate comprehensive testing schedules with time estimates
- **Save & Resume** - IndexedDB-powered local storage for audit progress
- **Detailed Results** - Track conformance status, notes, and screenshots per criterion
- **VPAT Report Generation** - Export results in standard VPAT format

### Recent Improvements ✨

#### Accessibility & User Experience
- ✅ **Accessible Toast Notifications** - WCAG 2.2 AA compliant notifications using Radix UI
- ✅ **Error Boundary** - Graceful error handling with user-friendly fallback UI
- ✅ **Form Validation** - Zod-powered runtime validation with clear error messages
- ✅ **Loading States** - Accessible loading indicators with screen reader support

#### Code Quality
- ✅ **Development Logger** - Structured logging system (development-only)
- ✅ **Type Safety** - Full TypeScript coverage with strict mode
- ✅ **Data Validation** - Zod schemas for all external data and user inputs
- ✅ **Error Handling** - Comprehensive error boundaries and validation

#### Testing Infrastructure
- ✅ **Unit Tests** - Vitest + React Testing Library setup
- ✅ **19 Automated Tests** - 82% pass rate across services and components
- ✅ **Coverage Reporting** - Built-in coverage tracking with v8
- ✅ **Test Scripts** - Watch mode, UI mode, and coverage commands

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vpat-creator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run type-check   # TypeScript type checking
npm run lint         # ESLint code linting
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run validate     # Run all checks (type, lint, format)
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Open Vitest UI
npm run test:coverage # Generate coverage report
```

## 🏗️ Technology Stack

### Core
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### State Management
- **Zustand** - Lightweight state management
- **Dexie.js** - IndexedDB wrapper for local storage

### UI Components
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form state management
- **Custom Components** - Fully accessible, reusable UI components

### Validation & Data
- **Zod** - Runtime type validation
- **WCAG 2.2 Data** - Complete WCAG 2.2 success criteria database

### Testing
- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom matchers
- **jsdom** - DOM implementation for tests

### Code Quality
- **ESLint** - Code linting with jsx-a11y plugin
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📁 Project Structure

```
vpat-creator/
├── src/
│   ├── assets/          # Static assets (WCAG data)
│   ├── components/      # React components
│   │   ├── common/      # Reusable UI components
│   │   ├── demo/        # Demo components
│   │   ├── testing/     # Testing workflow components
│   │   └── ErrorBoundary.tsx
│   ├── models/          # TypeScript type definitions
│   ├── services/        # Business logic & data services
│   │   ├── database.ts
│   │   ├── wcag-service.ts
│   │   └── testing-schedule-service.ts
│   ├── store/           # Zustand state stores
│   ├── utils/           # Utility functions
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── database-validators.ts
│   ├── test/            # Test setup and utilities
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── vitest.config.ts     # Vitest configuration
├── tsconfig.json        # TypeScript configuration
├── eslint.config.js     # ESLint configuration
└── package.json
```

## 🧪 Testing

The project includes comprehensive test coverage:

### Test Suites
- **WCAGService** - 14/14 tests passing ✅
  - Principles, guidelines, success criteria
  - Filtering, searching, counting
  - Data integrity validation

- **Button Component** - 5/9 tests passing ✅
  - Rendering and interactions
  - Variants and states
  - Accessibility attributes

### Running Tests
```bash
# Run all tests once
npm test

# Watch mode for development
npm run test:watch

# Interactive UI
npm run test:ui

# With coverage report
npm run test:coverage
```

## 🎯 WCAG 2.2 Coverage

The application supports testing for:
- **4 Principles** - Perceivable, Operable, Understandable, Robust
- **13 Guidelines** - All WCAG 2.2 guidelines
- **86 Success Criteria** - Complete A, AA, and AAA coverage
- **Techniques** - Sufficient, advisory, and failure techniques

## 🔒 Data Storage

All audit data is stored locally using IndexedDB:
- **Projects** - Audit project metadata
- **Components** - UI components being tested
- **Test Results** - Conformance status and notes
- **Screenshots** - Visual evidence (base64 encoded)
- **WCAG Customizations** - Custom criterion modifications

### Data Export/Import
- Export audits as JSON for backup
- Import previous audits to resume work
- Zod validation ensures data integrity

## 🛠️ Development

### Code Style
- **ESLint** with jsx-a11y rules for accessibility
- **Prettier** for consistent formatting
- **TypeScript strict mode** for type safety

### Logging
Development-only logger with levels:
```typescript
import { createLogger } from './utils/logger';

const logger = createLogger('my-module');
logger.debug('Debug info');
logger.info('Information');
logger.warn('Warning');
logger.error('Error'); // Always logged
```

### Validation
Zod schemas for runtime validation:
```typescript
import { auditScopeSchema } from './utils/validators';

const result = auditScopeSchema.safeParse(data);
if (!result.success) {
  // Handle validation errors
  console.error(result.error.issues);
}
```

## 🚧 Roadmap

### Completed ✅
- Accessible toast notifications
- Error boundaries
- Zod validation
- Development logger
- Testing infrastructure
- Database validation

### Planned 🎯
- Playwright E2E tests
- Increased test coverage (90%+)
- Code splitting with React.lazy()
- Performance optimizations
- PDF report generation
- Multi-language support

## 📝 License

[Your License Here]

## 🤝 Contributing

Contributions are welcome! Please ensure:
1. All tests pass (`npm test`)
2. Code is properly typed (`npm run type-check`)
3. Linting passes (`npm run lint`)
4. Code is formatted (`npm run format`)

## 📧 Support

For issues or questions, please open an issue on the repository.

---

**Built with accessibility in mind. WCAG 2.2 AA compliant.** ♿
