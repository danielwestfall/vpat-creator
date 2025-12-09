import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Project,
  Component,
  TestResult,
  TestingProgress,
  NavigationState,
} from '../models/types';

// ============================================================================
// STORE INTERFACES
// ============================================================================

interface AppState {
  // Current project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // Current component being tested
  currentComponent: Component | null;
  setCurrentComponent: (component: Component | null) => void;

  // Current test result being edited
  currentTestResult: TestResult | null;
  setCurrentTestResult: (result: TestResult | null) => void;

  // Testing progress
  testingProgress: TestingProgress;
  updateTestingProgress: (progress: Partial<TestingProgress>) => void;

  // Navigation state
  navigation: NavigationState;
  setNavigation: (nav: Partial<NavigationState>) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  // UI state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Reset store
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  currentProject: null,
  currentComponent: null,
  currentTestResult: null,
  testingProgress: {
    totalCriteria: 0,
    testedCriteria: 0,
    totalComponents: 0,
    completedComponents: 0,
    currentStep: 0,
    percentComplete: 0,
  },
  navigation: {
    currentPage: 'dashboard',
    previousPage: undefined,
    hasUnsavedChanges: false,
  },
  isSidebarOpen: true,
  isLoading: false,
  error: null,
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Project actions
        setCurrentProject: (project) =>
          set({ currentProject: project }, false, 'setCurrentProject'),

        // Component actions
        setCurrentComponent: (component) =>
          set({ currentComponent: component }, false, 'setCurrentComponent'),

        // Test result actions
        setCurrentTestResult: (result) =>
          set({ currentTestResult: result }, false, 'setCurrentTestResult'),

        // Testing progress actions
        updateTestingProgress: (progress) =>
          set(
            (state) => ({
              testingProgress: { ...state.testingProgress, ...progress },
            }),
            false,
            'updateTestingProgress'
          ),

        // Navigation actions
        setNavigation: (nav) =>
          set(
            (state) => ({
              navigation: { ...state.navigation, ...nav },
            }),
            false,
            'setNavigation'
          ),

        setHasUnsavedChanges: (hasChanges) =>
          set(
            (state) => ({
              navigation: { ...state.navigation, hasUnsavedChanges: hasChanges },
            }),
            false,
            'setHasUnsavedChanges'
          ),

        // UI actions
        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'toggleSidebar'),

        // Loading actions
        setIsLoading: (loading) => set({ isLoading: loading }, false, 'setIsLoading'),

        // Error actions
        setError: (error) => set({ error }, false, 'setError'),

        clearError: () => set({ error: null }, false, 'clearError'),

        // Reset
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'vpat-creator-storage',
        partialize: (state) => ({
          // Only persist certain parts of state
          currentProject: state.currentProject,
          navigation: {
            currentPage: state.navigation.currentPage,
            hasUnsavedChanges: false, // Don't persist unsaved changes
          },
          isSidebarOpen: state.isSidebarOpen,
        }),
      }
    )
  )
);

// ============================================================================
// SELECTOR HOOKS (for optimized re-renders)
// ============================================================================

export const useCurrentProject = () => useAppStore((state) => state.currentProject);

export const useCurrentComponent = () => useAppStore((state) => state.currentComponent);

export const useTestingProgress = () => useAppStore((state) => state.testingProgress);

export const useNavigation = () => useAppStore((state) => state.navigation);

export const useHasUnsavedChanges = () =>
  useAppStore((state) => state.navigation.hasUnsavedChanges);

export const useIsLoading = () => useAppStore((state) => state.isLoading);

export const useError = () => useAppStore((state) => state.error);
