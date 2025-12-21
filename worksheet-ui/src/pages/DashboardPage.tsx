import { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { getCourses, getQuizzes } from '../api/courses';
import type { Course, Quiz } from '../types/course';
import { ROUTES } from '../navigation/routes';
import { generateReport } from '../api/printReport';
import { Navbar } from '../components/Navbar';

interface DashboardPageProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

// State management with useReducer
interface State {
  courses: Course[];
  selectedCourse: Course | null;
  quizzes: Quiz[];
  loading: boolean;
  quizzesLoading: boolean;
  error: string | null;
  modalOpen: boolean;
}

type Action =
  | { type: 'LOADING' }
  | { type: 'LOADED'; courses: Course[] }
  | { type: 'ERROR'; error: string }
  | { type: 'SELECT_COURSE'; course: Course }
  | { type: 'QUIZZES_LOADING' }
  | { type: 'QUIZZES_LOADED'; quizzes: Quiz[] }
  | { type: 'QUIZZES_ERROR'; error: string }
  | { type: 'CLOSE_MODAL' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOADED':
      return { ...state, loading: false, courses: action.courses };
    case 'ERROR':
      return { ...state, loading: false, error: action.error };
    case 'SELECT_COURSE':
      return { ...state, selectedCourse: action.course, modalOpen: true, quizzes: [], quizzesLoading: true };
    case 'QUIZZES_LOADING':
      return { ...state, quizzesLoading: true };
    case 'QUIZZES_LOADED':
      return { ...state, quizzesLoading: false, quizzes: action.quizzes };
    case 'QUIZZES_ERROR':
      return { ...state, quizzesLoading: false, error: action.error };
    case 'CLOSE_MODAL':
      return { ...state, modalOpen: false, selectedCourse: null, quizzes: [] };
    default:
      return state;
  }
}

const initialState: State = {
  courses: [],
  selectedCourse: null,
  quizzes: [],
  loading: true,
  quizzesLoading: false,
  error: null,
  modalOpen: false,
};

type ReportType = 'full' | 'slip' | 'blank';

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<{ quiz: Quiz, type: ReportType } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load courses on mount
  useEffect(() => {
    loadCourses(false);
  }, []);

  const loadCourses = async (refresh: boolean) => {
    console.info(JSON.stringify({
      source: "AI_TRACE",
      action: refresh ? "REFRESH_COURSES" : "LOAD_COURSES",
      component: "DashboardPage",
      target: { testid: "refresh-btn", label: "Refresh", state: "loading" },
      payload: { refresh }
    }));
    dispatch({ type: 'LOADING' });
    try {
      const courses = await getCourses(refresh);
      dispatch({ type: 'LOADED', courses });
    } catch (err) {
      dispatch({ type: 'ERROR', error: err instanceof Error ? err.message : 'Failed to load courses' });
    }
  };

  const handleCourseClick = useCallback(async (course: Course) => {
    console.info(JSON.stringify({
      source: "AI_TRACE",
      action: "SELECT_COURSE",
      component: "DashboardPage",
      target: { testid: `course-${course.id}`, label: course.name, state: "enabled" },
      payload: { courseId: course.id }
    }));
    dispatch({ type: 'SELECT_COURSE', course });
    try {
      const quizzes = await getQuizzes(course.id);
      dispatch({ type: 'QUIZZES_LOADED', quizzes });
    } catch (err) {
      dispatch({ type: 'QUIZZES_ERROR', error: err instanceof Error ? err.message : 'Failed to load quizzes' });
    }
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const handleQuizAction = (quiz: Quiz, reportType: ReportType) => {
    if (!state.selectedCourse) return;

    if (reportType === 'blank') {
      onNavigate(ROUTES.PRINT_REPORT_BLANK, {
        courseId: String(state.selectedCourse.id),
        quizId: String(quiz.id),
      });
      return;
    }

    // For Full/Slip, we need a CSV. Open file selector.
    setActiveQuiz({ quiz, type: reportType });
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeQuiz || !state.selectedCourse) return;

    setUploadLoading(true);
    setUploadError(null);

    try {
      const reportData = await generateReport(
        String(state.selectedCourse.id),
        String(activeQuiz.quiz.id),
        file,
        activeQuiz.type as 'full' | 'slip'
      );

      sessionStorage.setItem('printReportData', JSON.stringify(reportData));

      if (activeQuiz.type === 'slip') {
        onNavigate(ROUTES.PRINT_REPORT_SLIP);
      } else {
        onNavigate(ROUTES.PRINT_REPORT_VIEW);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setUploadLoading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        onBack={() => onNavigate(ROUTES.HOME)}
        actions={
          <>
            <button
              className={`h-10 px-4 font-bold border-2 border-black ${state.loading ? 'opacity-50' : ''}`}
              onClick={() => loadCourses(true)}
              disabled={state.loading}
              data-testid="refresh-btn"
            >
              <span className="icon text-xl">↻</span> Refresh
            </button>
            <button className="h-10 px-4 font-bold border-2 border-black" onClick={() => onNavigate(ROUTES.QUIZ_IMPORT)}>
              QTI Converter
            </button>
            <button className="h-10 px-4 font-bold border-2 border-black" onClick={() => onNavigate(ROUTES.WORKSHEET)}>
              Worksheet
            </button>
          </>
        }
      />

      <div className="max-w-[1400px] mx-auto p-10 md:p-5">
        <div className="text-center mb-12 py-10 border-b-2 border-black">
          <h1 className="text-4xl font-bold text-black mb-4 md:text-3xl">Canvas Courses</h1>
          <p className="text-xl text-gray-800 italic">Browse and export quiz reports</p>
        </div>

        {state.error && (
          <div className="alert alert-error font-black uppercase text-red-600">
            <span className="text-3xl">⚠</span>
            <span>{state.error}</span>
          </div>
        )}

        {state.loading && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-8 mb-12 md:grid-cols-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border-2 border-gray-200 p-8 relative animate-pulse opacity-50">
                <div className="h-6 w-24 bg-gray-200 mb-6"></div>
                <div className="h-8 w-full bg-gray-200 mb-4"></div>
                <div className="h-4 w-1/2 bg-gray-200"></div>
              </div>
            ))}
          </div>
        )}

        {!state.loading && state.courses.length === 0 && !state.error && (
          <div className="text-center py-32 border-2 border-dashed border-gray-300">
            <span className="text-6xl block mb-6 text-gray-300">∅</span>
            <h3 className="text-2xl font-bold text-black mb-2">No courses found</h3>
            <p className="text-gray-600">Check your API token or refresh the list.</p>
          </div>
        )}

        {!state.loading && state.courses.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-8 mb-12 md:grid-cols-1">
            {state.courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border-2 border-black p-8 cursor-pointer relative group"
                onClick={() => handleCourseClick(course)}
                data-testid={`course-${course.id}`}
              >
                <span className={`absolute top-4 right-4 border border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter ${course.workflow_state !== 'available' ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-white text-black'}`}>
                  {course.workflow_state === 'available' ? 'Active' : 'Offline'}
                </span>
                <div className="mb-6 mt-4">
                  <h3 className="text-xl font-black text-black mb-1">{course.name}</h3>
                  <p className="text-sm text-gray-500">{course.course_code || 'UNTITLED'}</p>
                </div>
                <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                    <span>▸</span>
                    <span>View Quizzes</span>
                  </div>
                  <span className="text-2xl">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quiz Modal */}
        {state.modalOpen && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[2000] p-10 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className="bg-white border-4 border-black max-w-[1000px] w-full max-h-[85vh] overflow-hidden flex flex-col shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
              <div className="p-8 border-b-4 border-black flex justify-between items-center bg-gray-50">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1">SELECTED COURSE</span>
                  <h2 className="text-3xl font-black text-black m-0">{state.selectedCourse?.name}</h2>
                </div>
                <button className="bg-white border-2 border-black text-3xl font-black w-12 h-12 flex items-center justify-center" onClick={closeModal}>×</button>
              </div>

              {/* Hidden File Input for CSV Upload */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
              />

              <div className="p-8 overflow-y-auto flex-1 bg-white relative">
                {uploadLoading && (
                  <div className="absolute inset-0 bg-white/80 z-[2001] flex flex-col items-center justify-center backdrop-blur-[2px]">
                    <div className="w-16 h-16 border-8 border-gray-200 border-t-black rounded-full animate-spin mb-6"></div>
                    <p className="font-black uppercase tracking-[0.2em]">Synthesizing Data...</p>
                    <p className="text-xs text-gray-500 mt-2">Merging Canvas Quiz + Student CSV</p>
                  </div>
                )}

                {uploadError && (
                  <div className="mb-6 p-4 border-2 border-red-600 bg-red-50 text-red-600 flex items-center gap-3 font-bold">
                    <span className="text-2xl">⚠</span>
                    <span className="flex-1">{uploadError}</span>
                    <button className="text-sm underline" onClick={() => setUploadError(null)}>Dismiss</button>
                  </div>
                )}

                {state.quizzesLoading && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 border-8 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="font-black uppercase tracking-widest">Syncing Quizzes...</p>
                  </div>
                )}

                {!state.quizzesLoading && state.quizzes.length === 0 && (
                  <div className="text-center py-32 border-2 border-dashed border-gray-200">
                    <p className="text-xl font-bold text-gray-400">Empty Library</p>
                  </div>
                )}

                {!state.quizzesLoading && state.quizzes.length > 0 && (
                  <div className="grid gap-6">
                    {state.quizzes.map((quiz) => (
                      <div key={quiz.id} className="border-2 border-black p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-black text-black flex-1 m-0">{quiz.title}</h4>
                          <span className={`ml-4 px-2 py-0.5 text-[10px] font-black uppercase border-2 ${quiz.published ? 'bg-black text-white border-black' : 'text-gray-400 border-gray-300'}`}>
                            {quiz.published ? 'Live' : 'Draft'}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                          {quiz.description
                            ? stripHtml(quiz.description).substring(0, 150) + (quiz.description.length > 150 ? '...' : '')
                            : 'No documentation provided.'}
                        </p>

                        <div className="flex flex-wrap gap-x-8 gap-y-2 mb-6 text-sm font-bold text-gray-600">
                          <div className="flex items-center gap-2"><span className="text-black text-lg">▪</span> {quiz.question_count ?? 0} Questions</div>
                          <div className="flex items-center gap-2"><span className="text-black text-lg">◆</span> {quiz.points_possible ?? 0} Points</div>
                          <div className="flex items-center gap-2"><span className="text-black text-lg">○</span> {quiz.time_limit ? `${quiz.time_limit}m` : '∞'}</div>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-gray-100">
                          <button
                            className="btn btn-primary flex-1 justify-center py-2"
                            onClick={() => handleQuizAction(quiz, 'slip')}
                            data-testid={`quiz-${quiz.id}-slip`}
                          >
                            □ Retake Slip
                          </button>
                          <button
                            className="btn btn-secondary flex-1 justify-center py-2"
                            onClick={() => handleQuizAction(quiz, 'full')}
                            data-testid={`quiz-${quiz.id}-full`}
                          >
                            ▪ Full Report
                          </button>
                          <button
                            className="btn btn-secondary flex-1 justify-center py-2 text-[10px]"
                            onClick={() => handleQuizAction(quiz, 'blank')}
                            data-testid={`quiz-${quiz.id}-blank`}
                          >
                            • Blank Quiz
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}
