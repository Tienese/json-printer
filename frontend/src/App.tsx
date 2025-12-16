import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DashboardPage,
  QtiImportPage,
  QtiEditorPage,
  QtiSuccessPage,
  PrintReportPage,
  PrintReportViewPage,
  BlankQuizPage,
} from './pages';
import { WorksheetEditorPage } from './features/worksheet-editor/WorksheetEditorPage';
import './styles/theme/variables.css';
import './styles/theme/reset.css';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Print Report routes */}
          <Route path="/print-report" element={<PrintReportPage />} />
          <Route path="/print-report/view" element={<PrintReportViewPage />} />
          <Route path="/print-report/blank" element={<BlankQuizPage />} />

          {/* QTI Converter routes */}
          <Route path="/quiz/import" element={<QtiImportPage />} />
          <Route path="/quiz/editor" element={<QtiEditorPage />} />
          <Route path="/quiz/success" element={<QtiSuccessPage />} />

          {/* Worksheet Editor route */}
          <Route path="/worksheet" element={<WorksheetEditorPage />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
