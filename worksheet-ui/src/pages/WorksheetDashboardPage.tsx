import { useState, useEffect } from 'react';
import { worksheetApi, type WorksheetSummary } from '../api/worksheets';
import { Navbar } from '../components/Navbar';
import { ROUTES } from '../navigation/routes';

interface WorksheetDashboardPageProps {
    onNavigate: (route: string, params?: Record<string, string>) => void;
}

export function WorksheetDashboardPage({ onNavigate }: WorksheetDashboardPageProps) {
    const [templates, setTemplates] = useState<WorksheetSummary[]>([]);
    const [worksheets, setWorksheets] = useState<WorksheetSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);

    const PAGE_SIZE = 12;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [templatesData, worksheetsData] = await Promise.all([
                worksheetApi.templates(),
                worksheetApi.list('SNAPSHOT'),
            ]);
            setTemplates(templatesData);
            setWorksheets(worksheetsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load worksheets');
        } finally {
            setLoading(false);
        }
    };

    const createBlankWorksheet = () => {
        // Navigate to editor without ID (new worksheet)
        onNavigate(ROUTES.WORKSHEET_EDIT);
    };

    const openWorksheet = (id: number) => {
        onNavigate(ROUTES.WORKSHEET_EDIT, { id: String(id) });
    };

    const parseMetadata = (metadataJson?: string) => {
        if (!metadataJson) return null;
        try {
            return JSON.parse(metadataJson);
        } catch {
            return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        }).format(date);
    };

    // Pagination logic
    const totalPages = Math.ceil(worksheets.length / PAGE_SIZE);
    const paginatedWorksheets = worksheets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const canGoPrev = page > 0;
    const canGoNext = page < totalPages - 1;

    return (
        <div className="min-h-screen theme-surface">
            <Navbar
                onBack={() => onNavigate(ROUTES.HOME)}
                actions={
                    <button
                        className="h-10 px-4 font-bold border-2 theme-border-strong theme-text"
                        onClick={loadData}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>
                }
            />

            <div className="max-w-[1400px] mx-auto p-10">
                {/* Header */}
                <div className="text-center mb-12 py-10 border-b-2 theme-border-strong">
                    <h1 className="text-4xl font-bold theme-text mb-4">My Worksheets</h1>
                    <p className="text-xl theme-text-secondary italic">Create, manage, and organize your worksheets</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 border-2 border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold">
                        <span className="text-2xl mr-3">⚠</span>
                        {error}
                    </div>
                )}

                {/* Quick Start Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-black theme-text mb-6 flex items-center gap-3">
                        <span>✦</span> Quick Start
                    </h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                        {/* Blank Worksheet */}
                        <button
                            onClick={createBlankWorksheet}
                            className="p-8 border-2 border-dashed theme-border-strong hover:border-[var(--color-accent)] hover:bg-[var(--color-elevated)] transition-colors text-left group"
                        >
                            <div className="text-6xl mb-4 theme-text-muted group-hover:theme-accent transition-colors">+</div>
                            <h3 className="text-xl font-bold theme-text mb-2">Blank Worksheet</h3>
                            <p className="text-sm theme-text-secondary">Start from scratch</p>
                        </button>

                        {/* Templates */}
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => openWorksheet(template.id)}
                                className="p-8 border-2 theme-border-strong theme-elevated hover:bg-[var(--color-border)] transition-colors text-left"
                            >
                                <div className="text-4xl mb-4">📄</div>
                                <h3 className="text-xl font-bold theme-text mb-2">{template.name}</h3>
                                <p className="text-sm theme-text-secondary">Template</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Recent Files */}
                <section>
                    <h2 className="text-2xl font-black theme-text mb-6 flex items-center gap-3">
                        <span>◆</span> Recent Files
                    </h2>

                    {loading && (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="border-2 theme-border p-6 animate-pulse">
                                    <div className="h-6 w-32 theme-elevated mb-4"></div>
                                    <div className="h-4 w-24 theme-elevated mb-2"></div>
                                    <div className="h-4 w-20 theme-elevated"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && worksheets.length === 0 && (
                        <div className="text-center py-32 border-2 border-dashed theme-border">
                            <span className="text-6xl block mb-6 theme-text-muted">∅</span>
                            <h3 className="text-2xl font-bold theme-text mb-2">No worksheets yet</h3>
                            <p className="theme-text-secondary">Create your first worksheet to get started</p>
                        </div>
                    )}

                    {!loading && worksheets.length > 0 && (
                        <>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                                {paginatedWorksheets.map((worksheet) => {
                                    const metadata = parseMetadata(worksheet.metadata);
                                    return (
                                        <button
                                            key={worksheet.id}
                                            onClick={() => openWorksheet(worksheet.id)}
                                            className="border-2 theme-border-strong p-6 hover:bg-[var(--color-elevated)] transition-colors text-left"
                                        >
                                            <h3 className="text-lg font-bold theme-text mb-3 line-clamp-2">
                                                {worksheet.name}
                                            </h3>

                                            {metadata && (
                                                <div className="mb-3 text-sm theme-text-secondary flex flex-wrap gap-x-4 gap-y-1">
                                                    {metadata.gridCount > 0 && <span>▪ {metadata.gridCount} Grid</span>}
                                                    {metadata.vocabCount > 0 && <span>▪ {metadata.vocabCount} Vocab</span>}
                                                    {metadata.textCount > 0 && <span>▪ {metadata.textCount} Text</span>}
                                                    {metadata.mcCount > 0 && <span>▪ {metadata.mcCount} MC</span>}
                                                    {metadata.tfCount > 0 && <span>▪ {metadata.tfCount} T/F</span>}
                                                    {metadata.matchingCount > 0 && <span>▪ {metadata.matchingCount} Match</span>}
                                                    {metadata.clozeCount > 0 && <span>▪ {metadata.clozeCount} Cloze</span>}
                                                </div>
                                            )}

                                            <div className="text-xs theme-text-muted font-bold uppercase tracking-wider">
                                                {formatDate(worksheet.updatedAt)}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={!canGoPrev}
                                        className="px-4 py-2 border-2 theme-border-strong font-bold disabled:opacity-30 disabled:cursor-not-allowed theme-text"
                                    >
                                        ‹ Prev
                                    </button>
                                    <span className="text-sm font-bold theme-text">
                                        Page {page + 1} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={!canGoNext}
                                        className="px-4 py-2 border-2 theme-border-strong font-bold disabled:opacity-30 disabled:cursor-not-allowed theme-text"
                                    >
                                        Next ›
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

