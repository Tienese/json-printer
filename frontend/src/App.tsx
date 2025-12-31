import './styles/tailwind.css';
import { useNavigation } from './navigation/useNavigation';
import { ROUTES } from './navigation/routes';
import { WorksheetPage } from './pages/WorksheetPage';
import { WorksheetDashboardPage } from './pages/WorksheetDashboardPage';
import { DashboardPage } from './pages/DashboardPage';
import { PrintReportViewPage } from './pages/PrintReportViewPage';
import { PrintReportSlipPage } from './pages/PrintReportSlipPage';
import { PrintReportBlankPage } from './pages/PrintReportBlankPage';
import { QtiImportPage } from './pages/QtiImportPage';
import { QtiEditorPage } from './pages/QtiEditorPage';
import { QtiSuccessPage } from './pages/QtiSuccessPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LandingPage } from './pages/LandingPage';
import { SettingsPage } from './pages/SettingsPage';
import { TagManagementPage } from './pages/TagManagementPage';
// Grammar Coach V4.0
import { VocabManagementPage } from './pages/VocabManagementPage';
import { SentenceBankPage } from './pages/SentenceBankPage';
import { GrammarRulesPage } from './pages/GrammarRulesPage';

import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Main App component - Hash-based router
 * Routes are defined in navigation/routes.ts
 * Navigation state managed by useNavigation hook
 */
function App() {
  const { route, params, navigate } = useNavigation();

  const renderPage = () => {
    switch (route) {
      // Landing page with sidebar
      case ROUTES.HOME:
        return <LandingPage onNavigate={navigate} />;

      // Worksheet routes
      case ROUTES.WORKSHEET_DASHBOARD:
        return <WorksheetDashboardPage onNavigate={navigate} />;

      case ROUTES.WORKSHEET_EDIT:
        return <WorksheetPage worksheetId={params.id} onNavigate={navigate} />;

      case ROUTES.PRINT_REPORT_VIEW:
        return <PrintReportViewPage onNavigate={navigate} />;

      case ROUTES.PRINT_REPORT_SLIP:
        return <PrintReportSlipPage onNavigate={navigate} />;

      case ROUTES.PRINT_REPORT_BLANK:
        return <PrintReportBlankPage onNavigate={navigate} />;

      case ROUTES.QUIZ_IMPORT:
        return <QtiImportPage onNavigate={navigate} />;

      case ROUTES.QUIZ_EDITOR:
        return <QtiEditorPage onNavigate={navigate} />;

      case ROUTES.QUIZ_SUCCESS:
        return <QtiSuccessPage onNavigate={navigate} />;

      case ROUTES.ANALYTICS:
        return <AnalyticsPage onNavigate={navigate} />;

      case ROUTES.CANVAS_COURSES:
        return <DashboardPage onNavigate={navigate} />;

      case ROUTES.SETTINGS:
        return <SettingsPage onNavigate={navigate} />;

      case ROUTES.TAG_MANAGEMENT:
        return <TagManagementPage onNavigate={navigate} />;

      // Grammar Coach V4.0
      case ROUTES.VOCAB:
        return <VocabManagementPage onNavigate={navigate} />;

      case ROUTES.SENTENCE_BANK:
        return <SentenceBankPage onNavigate={navigate} />;

      case ROUTES.GRAMMAR_RULES:
        return <GrammarRulesPage onNavigate={navigate} />;

      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <ErrorBoundary>
      {renderPage()}
    </ErrorBoundary>
  );
}

export default App;

