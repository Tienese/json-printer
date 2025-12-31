/**
 * VocabList Component
 *
 * Filterable vocabulary list with lesson dropdown and search.
 */

import { useEffect, useState } from 'react';
import type { VocabWithTags } from '../../../hooks/useVocabManagement';

interface VocabListProps {
    readonly vocabList: VocabWithTags[];
    readonly selectedVocab: VocabWithTags | null;
    readonly onSelect: (vocab: VocabWithTags) => void;
    readonly onFilterChange: (lessonId?: number, search?: string) => void;
    readonly loading: boolean;
}

export function VocabList({
    vocabList,
    selectedVocab,
    onSelect,
    onFilterChange,
    loading,
}: VocabListProps) {
    const [lessonFilter, setLessonFilter] = useState<number | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            onFilterChange(lessonFilter, searchQuery || undefined);
        }, 300);
        return () => clearTimeout(timeout);
    }, [lessonFilter, searchQuery, onFilterChange]);

    // Get unique lessons from vocab list
    const lessons = [...new Set(vocabList.map(v => v.lessonId))].sort((a, b) => a - b);

    return (
        <div className="flex flex-col h-full">
            {/* Filters */}
            <div className="p-3 border-b theme-border space-y-2">
                <div className="flex gap-2">
                    <select
                        value={lessonFilter || ''}
                        onChange={e => setLessonFilter(e.target.value ? Number(e.target.value) : undefined)}
                        className="flex-1 px-2 py-1.5 text-sm border rounded theme-border theme-surface theme-text"
                    >
                        <option value="">All Lessons</option>
                        {lessons.map(lesson => (
                            <option key={lesson} value={lesson}>
                                Lesson {lesson}
                            </option>
                        ))}
                    </select>
                </div>
                <input
                    type="text"
                    placeholder="Search vocabulary..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded theme-border theme-surface theme-text"
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : vocabList.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No vocabulary found</div>
                ) : (
                    <ul className="divide-y theme-divide">
                        {vocabList.map(vocab => (
                            <li
                                key={vocab.id}
                                onClick={() => onSelect(vocab)}
                                onKeyDown={e => e.key === 'Enter' && onSelect(vocab)}
                                tabIndex={0}
                                className={`
                                    p-3 cursor-pointer
                                    ${selectedVocab?.id === vocab.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-medium theme-text">{vocab.word}</span>
                                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                            {vocab.reading}
                                        </span>
                                    </div>
                                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                        L{vocab.lessonId}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {vocab.meaning}
                                </div>
                                {vocab.sentenceCount > 0 && (
                                    <div className="text-xs text-gray-400 mt-1">
                                        {vocab.sentenceCount} sentence{vocab.sentenceCount !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
