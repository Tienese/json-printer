import { useState, useRef } from 'react';
import { ROUTES } from '../navigation/routes';
import { Navbar } from '../components/Navbar';
import { Spinner } from '../components/ui';
import { triggerBrowserPrint } from '../utils/print';
import { calculateDiscriminationIndex, getDifficultyLabel, getDiscriminationLabel } from '../utils/analyticsUtils';
import type { QuizStatistics, SubmissionStatistics, QuestionStatistics } from '../types/analysis';


interface AnalyticsPageProps {
    onNavigate: (route: string) => void;
}

type AnalyticsMode = 'online' | 'offline';

export function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
    const [statistics, setStatistics] = useState<QuizStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Configuration state
    const [mode, setMode] = useState<AnalyticsMode>('offline');
    const [courseId, setCourseId] = useState('');
    const [quizId, setQuizId] = useState('');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [quizFile, setQuizFile] = useState<File | null>(null);

    const csvInputRef = useRef<HTMLInputElement>(null);
    const jsonInputRef = useRef<HTMLInputElement>(null);

    const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setCsvFile(file);
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setQuizFile(file);
    };

    const canCompute = () => {
        if (!csvFile) return false;
        if (mode === 'online') return courseId.trim() !== '' && quizId.trim() !== '';
        if (mode === 'offline') return quizFile !== null;
        return false;
    };

    const handleCompute = async () => {
        if (!csvFile) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', csvFile);

        if (mode === 'offline' && quizFile) {
            formData.append('quizFile', quizFile);
        } else if (mode === 'online') {
            formData.append('courseId', courseId);
            formData.append('quizId', quizId);
        }

        try {
            const response = await fetch('/api/analytics/statistics', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Failed to compute statistics');
            }

            const data = await response.json();
            setStatistics(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        triggerBrowserPrint();
    };


    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Navbar
                onBack={() => onNavigate(ROUTES.HOME)}
                actions={
                    statistics && (
                        <button onClick={handlePrint} className="px-4 py-2 bg-black text-white border-2 border-black font-bold">
                            🖨️ Print
                        </button>
                    )
                }
            />

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto">

                {/* Content */}
                <div className="max-w-[21cm] mx-auto my-8 p-8 bg-white shadow-lg print:shadow-none print:m-0 print:max-w-none">
                    {loading && (
                        <Spinner text="Computing Statistics..." />
                    )}

                    {error && (
                        <div className="bg-red-50 border-2 border-red-500 p-4 mb-4">
                            <p className="text-red-700 font-bold">Error: {error}</p>
                        </div>
                    )}

                    {!statistics && !loading && !error && (
                        <div className="text-center py-20">
                            <h1 className="text-3xl font-black mb-4">Quiz Analytics Dashboard</h1>
                            <p className="text-gray-600 mb-4">Configure your data sources in the sidebar →</p>
                            <div className="text-sm text-gray-500">
                                <p className="mb-2"><strong>Offline Mode:</strong> Upload CSV + Quiz JSON</p>
                                <p><strong>Online Mode:</strong> Upload CSV + Enter Canvas IDs</p>
                            </div>
                        </div>
                    )}

                    {statistics && (
                        <>
                            {/* Header */}
                            <div className="border-b-2 border-black mb-6 pb-4">
                                <h1 className="text-2xl font-black uppercase tracking-tight mb-1">
                                    {statistics.quizTitle}
                                </h1>
                                <div className="text-[8px] font-bold text-gray-400 tracking-[0.2em]">
                                    QUIZ STATISTICS REPORT
                                </div>
                            </div>

                            {/* Submission Statistics */}
                            <div className="mb-8">
                                <h2 className="text-lg font-black uppercase mb-4 border-b border-gray-300 pb-2">
                                    📊 Submission Statistics
                                </h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 border-l-4 border-black">
                                        <div className="text-[8pt] text-gray-500 uppercase">Students</div>
                                        <div className="text-3xl font-black">{statistics.submissionStatistics.uniqueCount}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 border-l-4 border-blue-500">
                                        <div className="text-[8pt] text-gray-500 uppercase">Average</div>
                                        <div className="text-3xl font-black">{statistics.submissionStatistics.scoreAverage.toFixed(1)}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 border-l-4 border-green-500">
                                        <div className="text-[8pt] text-gray-500 uppercase">High</div>
                                        <div className="text-3xl font-black">{statistics.submissionStatistics.scoreHigh.toFixed(1)}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 border-l-4 border-red-500">
                                        <div className="text-[8pt] text-gray-500 uppercase">Low</div>
                                        <div className="text-3xl font-black">{statistics.submissionStatistics.scoreLow.toFixed(1)}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 border-l-4 border-purple-500">
                                        <div className="text-[8pt] text-gray-500 uppercase">Std Dev</div>
                                        <div className="text-3xl font-black">{statistics.submissionStatistics.scoreStdev.toFixed(2)}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 border-l-4 border-yellow-500">
                                        <div className="text-[8pt] text-gray-500 uppercase">Avg Correct</div>
                                        <div className="text-3xl font-black">{statistics.submissionStatistics.correctCountAverage.toFixed(1)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Item Analysis */}
                            <div className="mb-8">
                                <h2 className="text-lg font-black uppercase mb-4 border-b border-gray-300 pb-2">
                                    📈 Item Analysis
                                </h2>
                                <table className="w-full text-[9pt] border-collapse">
                                    <thead>
                                        <tr className="bg-black text-white">
                                            <th className="p-2 text-left">Q#</th>
                                            <th className="p-2 text-left">Type</th>
                                            <th className="p-2 text-right">Responses</th>
                                            <th className="p-2 text-right">Correct</th>
                                            <th className="p-2 text-right">Difficulty</th>
                                            <th className="p-2 text-right">Discrimination</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.values(statistics.questionStatistics)
                                            .sort((a, b) => a.questionNumber - b.questionNumber)
                                            .map((q) => {
                                                const disc = calculateDiscriminationIndex(q);
                                                return (
                                                    <tr key={q.questionNumber} className="border-b border-gray-200 hover:bg-gray-50">
                                                        <td className="p-2 font-bold">{q.questionNumber}</td>
                                                        <td className="p-2 text-[8pt] text-gray-600">{q.questionType.replace('_', ' ')}</td>
                                                        <td className="p-2 text-right">{q.responses}</td>
                                                        <td className="p-2 text-right">{q.correctStudentCount}</td>
                                                        <td className="p-2 text-right">
                                                            <span className={`px-2 py-1 rounded text-[8pt] font-bold ${q.difficultyIndex < 0.3 ? 'bg-red-100 text-red-700' :
                                                                q.difficultyIndex < 0.7 ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                {(q.difficultyIndex * 100).toFixed(0)}% ({getDifficultyLabel(q.difficultyIndex)})
                                                            </span>
                                                        </td>
                                                        <td className="p-2 text-right">
                                                            <span className={`px-2 py-1 rounded text-[8pt] font-bold ${disc < 0 ? 'bg-red-100 text-red-700' :
                                                                disc < 0.2 ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                {disc.toFixed(2)} ({getDiscriminationLabel(disc)})
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Configuration */}
            <div className="w-80 bg-white border-l-2 border-black flex flex-col print:hidden">
                {/* Header */}
                <div className="p-4 border-b-2 border-black">
                    <h2 className="font-black uppercase tracking-tight">Configuration</h2>
                    <p className="text-[8px] text-gray-400 font-bold tracking-widest mt-1">DATA SOURCES</p>
                </div>

                {/* Mode Toggle */}
                <div className="p-4 border-b border-gray-200">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                        Mode
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('offline')}
                            className={`flex-1 py-2 px-3 text-sm font-bold rounded border-2 transition-all ${mode === 'offline'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                                }`}
                        >
                            🔒 Offline
                        </button>
                        <button
                            onClick={() => setMode('online')}
                            className={`flex-1 py-2 px-3 text-sm font-bold rounded border-2 transition-all ${mode === 'online'
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                                }`}
                        >
                            🌐 Online
                        </button>
                    </div>
                </div>

                {/* CSV File Upload */}
                <div className="p-4 border-b border-gray-200">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                        Student Submissions (CSV) *
                    </label>
                    <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCsvChange}
                        className="hidden"
                    />
                    <button
                        onClick={() => csvInputRef.current?.click()}
                        className={`w-full py-3 px-4 rounded border-2 border-dashed font-bold text-sm transition-all ${csvFile
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-black'
                            }`}
                    >
                        {csvFile ? `✅ ${csvFile.name}` : '📁 Select CSV File'}
                    </button>
                </div>

                {/* Mode-specific inputs */}
                {mode === 'offline' ? (
                    <div className="p-4 border-b border-gray-200">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                            Quiz Metadata (JSON) *
                        </label>
                        <input
                            ref={jsonInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleJsonChange}
                            className="hidden"
                        />
                        <button
                            onClick={() => jsonInputRef.current?.click()}
                            className={`w-full py-3 px-4 rounded border-2 border-dashed font-bold text-sm transition-all ${quizFile
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-black'
                                }`}
                        >
                            {quizFile ? `✅ ${quizFile.name}` : '📁 Select JSON File'}
                        </button>
                        <p className="text-[8px] text-gray-400 mt-2">
                            Export from Canvas when online, use here when offline
                        </p>
                    </div>
                ) : (
                    <div className="p-4 border-b border-gray-200 space-y-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">
                                Course ID *
                            </label>
                            <input
                                type="text"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                placeholder="e.g., 12345"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded font-mono focus:border-black focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">
                                Quiz ID *
                            </label>
                            <input
                                type="text"
                                value={quizId}
                                onChange={(e) => setQuizId(e.target.value)}
                                placeholder="e.g., 67890"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded font-mono focus:border-black focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Compute Button */}
                <div className="p-4 border-t-2 border-black">
                    <button
                        onClick={handleCompute}
                        disabled={!canCompute() || loading}
                        className={`w-full py-4 font-black uppercase tracking-widest rounded transition-all ${canCompute() && !loading
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Computing...' : '📊 Compute Statistics'}
                    </button>
                </div>
            </div>
        </div>
    );
}
