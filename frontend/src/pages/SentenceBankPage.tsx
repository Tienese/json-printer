import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSentences, type CreateSentenceRequest } from '../hooks/useSentences';
import { useValidation } from '../hooks/useValidation';

interface SentenceBankPageProps {
    onNavigate: (route: string) => void;
}

/**
 * Sentence Bank Page - V4.0 minimal implementation
 * Lists sentences with validation status and allows CRUD operations.
 */
export function SentenceBankPage({ onNavigate }: SentenceBankPageProps) {
    const { sentences, loading, error, fetchAll, create, remove, validate, validateAll } = useSentences();
    const { validate: validateText, result: validationResult, clear: clearValidation } = useValidation();

    const [filterLesson, setFilterLesson] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [newText, setNewText] = useState('');
    const [newLesson, setNewLesson] = useState('');
    const [testText, setTestText] = useState('');
    const [highlightedId, setHighlightedId] = useState<number | null>(null);

    // Read URL query params for sentence highlighting
    const location = useLocation();

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Handle id query param for scroll-to-sentence
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const idParam = params.get('id');
        if (idParam) {
            const id = parseInt(idParam, 10);
            if (!isNaN(id)) {
                setHighlightedId(id);
                // Clear highlight after 3 seconds
                const timer = setTimeout(() => setHighlightedId(null), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [location.search]);

    // Scroll to highlighted sentence when loaded
    useEffect(() => {
        if (highlightedId && sentences.length > 0) {
            const element = document.querySelector(`[data-sentence-id="${highlightedId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [highlightedId, sentences]);

    const handleFilter = () => {
        fetchAll(
            filterLesson ? parseInt(filterLesson) : undefined,
            filterStatus || undefined
        );
    };

    const handleCreate = async () => {
        if (!newText.trim()) return;
        const request: CreateSentenceRequest = {
            text: newText.trim(),
            lessonId: newLesson ? parseInt(newLesson) : undefined,
            expectedValid: true,
        };
        const result = await create(request);
        if (result) {
            setNewText('');
            setNewLesson('');
            fetchAll();
        }
    };

    const handleValidate = async (id: number) => {
        await validate(id);
        fetchAll();
    };

    const handleValidateAll = async () => {
        await validateAll();
        fetchAll();
    };

    const handleTestValidation = async () => {
        if (!testText.trim()) return;
        await validateText(testText.trim());
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'VALID': return '✓';
            case 'INVALID': return '✗';
            case 'DIRTY': return '⟳';
            default: return '?';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VALID': return 'text-green-600';
            case 'INVALID': return 'text-red-600';
            case 'DIRTY': return 'text-yellow-600';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <button
                            onClick={() => onNavigate('')}
                            className="text-blue-600 hover:underline text-sm mb-2"
                        >
                            ← Back to Home
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Sentence Bank</h1>
                        <p className="text-gray-500">Grammar Coach V4.0</p>
                    </div>
                    <button
                        onClick={handleValidateAll}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Validate All
                    </button>
                </div>

                {/* Quick Validation Test */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <h2 className="font-semibold mb-2">Quick Validation Test</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={testText}
                            onChange={(e) => setTestText(e.target.value)}
                            placeholder="Enter text to validate..."
                            className="flex-1 px-3 py-2 border rounded"
                        />
                        <button
                            onClick={handleTestValidation}
                            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                        >
                            Test
                        </button>
                        <button
                            onClick={() => { setTestText(''); clearValidation(); }}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Clear
                        </button>
                    </div>
                    {validationResult && (
                        <div className={`mt-2 p-3 rounded ${validationResult.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                            <span className={validationResult.isValid ? 'text-green-700' : 'text-red-700'}>
                                {validationResult.isValid ? '✓ Valid' : '✗ Invalid'}
                            </span>
                            {validationResult.violations.length > 0 && (
                                <ul className="mt-2 text-sm text-red-600">
                                    {validationResult.violations.map((v, i) => (
                                        <li key={i}>• {v.word}: {v.message}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Sentence */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <h2 className="font-semibold mb-2">Add Sentence</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder="Sentence text..."
                            className="flex-1 px-3 py-2 border rounded"
                        />
                        <input
                            type="number"
                            value={newLesson}
                            onChange={(e) => setNewLesson(e.target.value)}
                            placeholder="Lesson"
                            className="w-24 px-3 py-2 border rounded"
                        />
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex gap-4 items-end">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Lesson</label>
                            <input
                                type="number"
                                value={filterLesson}
                                onChange={(e) => setFilterLesson(e.target.value)}
                                className="px-3 py-2 border rounded w-24"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border rounded"
                            >
                                <option value="">All</option>
                                <option value="VALID">Valid</option>
                                <option value="INVALID">Invalid</option>
                                <option value="UNCHECKED">Unchecked</option>
                                <option value="DIRTY">Dirty</option>
                            </select>
                        </div>
                        <button
                            onClick={handleFilter}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Filter
                        </button>
                        <button
                            onClick={() => { setFilterLesson(''); setFilterStatus(''); fetchAll(); }}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Error/Loading */}
                {error && <div className="text-red-600 mb-4">{error}</div>}
                {loading && <div className="text-gray-500 mb-4">Loading...</div>}

                {/* Sentence List */}
                <div className="bg-white rounded-lg shadow">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Text</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Lesson</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sentences.map((sentence) => (
                                <tr 
                                    key={sentence.id} 
                                    data-sentence-id={sentence.id}
                                    className={`hover:bg-gray-50 transition-colors duration-300 ${highlightedId === sentence.id ? 'bg-yellow-100' : ''}`}
                                >
                                    <td className={`px-4 py-3 text-xl ${getStatusColor(sentence.validationStatus)}`}>
                                        {getStatusIcon(sentence.validationStatus)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{sentence.text}</div>
                                        {sentence.validationMessage && (
                                            <div className="text-sm text-red-500">{sentence.validationMessage}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{sentence.lessonId || '-'}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleValidate(sentence.id)}
                                            className="text-blue-600 hover:underline mr-3"
                                        >
                                            Validate
                                        </button>
                                        <button
                                            onClick={() => { remove(sentence.id); fetchAll(); }}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sentences.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                        No sentences found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
