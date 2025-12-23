// Route constants for hash-based navigation
// Usage: window.location.hash = '#' + ROUTES.DASHBOARD

export const ROUTES = {
  HOME: '',
  CANVAS_COURSES: 'canvas-courses',
  PRINT_REPORT_VIEW: 'print-report/view',
  PRINT_REPORT_SLIP: 'print-report/slip',
  PRINT_REPORT_BLANK: 'print-report/blank',
  QUIZ_IMPORT: 'quiz-import',
  QUIZ_EDITOR: 'quiz/editor',
  QUIZ_SUCCESS: 'quiz/success',
  WORKSHEET_DASHBOARD: 'worksheet',
  WORKSHEET_EDIT: 'worksheet/edit',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
