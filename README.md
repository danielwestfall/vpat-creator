# VPAT Creator# React + TypeScript + Vite



A comprehensive web application for conducting WCAG 2.2 accessibility audits and generating Voluntary Product Accessibility Template (VPAT) reports.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## FeaturesCurrently, two official plugins are available:



### 🎯 Complete Testing Workflow- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- **Success Criteria-Based Testing**: Step-by-step WCAG 2.2 audit workflow- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **Component Testing Guide**: Detailed guidance for 11 component types (Forms, Images, Navigation, Links, Buttons, Headings, Tables, Media, Color/Contrast, Keyboard, ARIA)

- **Progress Tracking**: Visual progress bar and sidebar checklist## React Compiler

- **Smart Navigation**: Jump between criteria, navigate to untested items

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### 📋 Comprehensive Audit Scope

- WCAG 2.1 and 2.2 support## Expanding the ESLint configuration

- Conformance level selection (A, AA, AAA)

- EN 301 549 mappingIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- Section 508 mapping

- Testing tools and evaluation methods documentation```js

export default defineConfig([

### 💾 Save & Resume  globalIgnores(['dist']),

- Export audit progress as JSON  {

- Resume incomplete audits    files: ['**/*.{ts,tsx}'],

- Update completed audits with new dates    extends: [

- Recheck workflow for systematic re-verification      // Other configs...



### 📊 Detailed Test Results      // Remove tseslint.configs.recommended and replace with this

- Conformance status tracking (Supports, Partially Supports, Does Not Support, Not Applicable)      tseslint.configs.recommendedTypeChecked,

- Technique selection (sufficient and advisory)      // Alternatively, use this for stricter rules

- Failure identification with checkboxes      tseslint.configs.strictTypeChecked,

- Custom technique documentation      // Optionally, add this for stylistic rules

- Tools used per criterion      tseslint.configs.stylisticTypeChecked,

- Notes and remarks

      // Other configs...

### 📄 Standards Compliance    ],

- Automatic EN 301 549 mapping from WCAG results    languageOptions: {

- Automatic Section 508 mapping from WCAG results      parserOptions: {

- Export results in structured JSON format        project: ['./tsconfig.node.json', './tsconfig.app.json'],

- Ready for VPAT report generation        tsconfigRootDir: import.meta.dirname,

      },

## Getting Started      // other options...

    },

### Prerequisites  },

- Node.js 18+ and npm])

- Modern web browser```



### InstallationYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:



```bash```js

# Install dependencies// eslint.config.js

npm installimport reactX from 'eslint-plugin-react-x'

import reactDom from 'eslint-plugin-react-dom'

# Start development server

npm run devexport default defineConfig([

  globalIgnores(['dist']),

# Build for production  {

npm run build    files: ['**/*.{ts,tsx}'],

    extends: [

# Run linter      // Other configs...

npm run lint      // Enable lint rules for React

      reactX.configs['recommended-typescript'],

# Preview production build      // Enable lint rules for React DOM

npm run preview      reactDom.configs.recommended,

```    ],

    languageOptions: {

### Quick Start      parserOptions: {

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

1. **Start Development Server**        tsconfigRootDir: import.meta.dirname,

   ```bash      },

   npm run dev      // other options...

   ```    },

   Open http://localhost:5174/  },

])

2. **Configure Audit Scope**```

   - Enter page/component name
   - Select WCAG version (2.1 or 2.2)
   - Choose conformance levels (A, AA, AAA)
   - Add testing tools and evaluation methods
   - Optionally enable EN 301 549 and Section 508 mapping

3. **Conduct Testing**
   - Follow testing steps for each Success Criterion
   - Select techniques used
   - Mark failures found
   - Add notes and testing tools
   - Save results and continue

4. **Save Progress**
   - Click "💾 Save & Exit" to export progress as JSON
   - Click "📂 Resume Audit" to continue later

5. **Use Component Guide**
   - Click "📚 Component Guide" in sidebar
   - Select component type to view:
     - Relevant Success Criteria
     - Testing tips
     - Common issues to check

6. **Update Completed Audits**
   - Load a completed audit file
   - Update all dates at once OR
   - Systematically recheck individual items

## Technology Stack

- **React 19.1.1** - UI framework
- **TypeScript** - Type safety
- **Vite 7.1.7** - Build tool and dev server
- **Zustand 5.0.8** - State management
- **Dexie 4.2.1** - IndexedDB wrapper (planned)
- **Radix UI** - Accessible component primitives
- **React Hook Form + Zod** - Form validation

## Project Structure

```
vpat-creator/
├── src/
│   ├── assets/            # Static assets (wcag22.json)
│   ├── components/
│   │   ├── common/        # Reusable UI components
│   │   └── testing/       # Testing workflow components
│   ├── models/            # TypeScript type definitions
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global styles and CSS variables
│   └── main.tsx           # Application entry point
├── public/                # Public static files
└── package.json           # Dependencies and scripts
```

## Key Components

### Testing Workflow
- **AuditScopeConfig**: Pre-audit configuration screen
- **TestingWorkflow**: Main testing interface with SC-by-SC testing
- **ComponentInfo**: Component testing guidance library

### Services
- **testing-schedule-service**: Generates SC-based and component-based schedules
- **standards-mapping-service**: Maps WCAG results to EN 301 549 and Section 508

### Data Models
- **WCAG 2.2 JSON**: Complete WCAG 2.2 data with techniques and failures
- **TestResult**: Individual criterion test results
- **AuditScope**: Audit configuration and metadata

## Features in Detail

### Component Testing Guide
11 comprehensive guides covering:
- **Forms & Inputs**: 6 SC, labels, error identification, keyboard access
- **Images & Graphics**: Alt text, decorative images, contrast
- **Navigation & Menus**: Skip links, keyboard navigation, landmarks
- **Links & Hyperlinks**: Link purpose, color indicators
- **Buttons & Controls**: Keyboard activation, accessible names
- **Headings & Structure**: Hierarchy, document structure
- **Data Tables**: Headers, relationships, complex tables
- **Audio & Video**: Captions, transcripts, audio descriptions
- **Color & Contrast**: Contrast ratios, color usage
- **Keyboard Navigation**: Full keyboard access, focus visibility
- **ARIA & Custom Widgets**: Proper ARIA usage, state announcements

Each guide includes:
- Common Success Criteria with explanations
- 5 practical testing tips
- 5 common issues to watch for

### Completed Audit Updates
- Automatic detection of completed audits
- Date update banner for all criteria at once
- Individual recheck workflow with visual indicators
- "Mark as Rechecked" button per criterion

### Standards Mapping
- EN 301 549 (European accessibility standard)
- Section 508 (U.S. federal accessibility standard)
- Automatic mapping from WCAG test results
- Proper handling of multiple criteria to single requirement mappings

## Development

### Code Quality
- TypeScript strict mode enabled
- ESLint with jsx-a11y plugin for accessibility linting
- Prettier for code formatting
- No TypeScript compilation errors

### CSS Architecture
- CSS Variables for theming
- Dark mode support (planned)
- Responsive design
- Accessible focus indicators

## Roadmap

- [ ] React Router for multi-page navigation
- [ ] Dashboard with project management
- [ ] Multiple project support
- [ ] Screenshot upload functionality
- [ ] User profiles and team collaboration
- [ ] PDF/Word VPAT export
- [ ] Full component-based testing interface
- [ ] Automated accessibility scanning integration
- [ ] Historical audit comparison
- [ ] Custom report templates

## Contributing

This is an open-source project. Contributions are welcome!

## License

MIT License - See LICENSE file for details

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [VPAT Template](https://www.itic.org/policy/accessibility/vpat)
- [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf)
- [Section 508](https://www.section508.gov/)

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ for accessibility testing
