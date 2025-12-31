/**
 * Vocabulary Management Page
 *
 * Lists vocabulary with search/filter, detail panel with tags and linked sentences.
 * Includes V5 skeleton for future drag-and-drop functionality.
 */

import { useEffect, useCallback } from 'react';
import { useVocabManagement } from '../hooks/useVocabManagement';
import { VocabList } from '../components/grammar-coach/vocab/VocabList';
import { VocabDetail } from '../components/grammar-coach/vocab/VocabDetail';
import { V5Skeleton } from '../components/grammar-coach/shared/V5Skeleton';
import { Navbar } from '../components/Navbar';
import { ROUTES } from '../navigation/routes';
import '../components/grammar-coach/shared/PrintStyles.css';

interface VocabManagementPageProps {
    readonly onNavigate: (route: string) => void;
}

export function VocabManagementPage({ onNavigate }: VocabManagementPageProps) {
    const {
        vocabList,
        selectedVocab,
        linkedSentences,
        loading,
        error,
        fetchVocabList,
        selectVocab,
        addTag,
        removeTag,
    } = useVocabManagement();

    // Initial fetch
    useEffect(() => {
        fetchVocabList();
    }, [fetchVocabList]);

    // Handle filter changes
    const handleFilterChange = useCallback((lessonId?: number, search?: string) => {
        fetchVocabList({ lessonId, search });
    }, [fetchVocabList]);

    // Navigate to sentence bank with filter
    const handleNavigateToSentence = useCallback((sentenceId: number) => {
        onNavigate(`${ROUTES.SENTENCE_BANK}?id=${sentenceId}`);
    }, [onNavigate]);

    return (
        <div className="min-h-screen flex flex-col theme-surface">
            <Navbar
                onBack={() => onNavigate(ROUTES.HOME)}
                actions={
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        📚 Vocabulary Management
                    </div>
                }
            />

            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Vocab List */}
                <div className="w-1/3 border-r theme-border overflow-hidden flex flex-col">
                    <VocabList
                        vocabList={vocabList}
                        selectedVocab={selectedVocab}
                        onSelect={selectVocab}
                        onFilterChange={handleFilterChange}
                        loading={loading}
                    />

                    {/* V5 Skeleton: Drag-and-drop */}
                    <div className="p-3 border-t theme-border">
                        <V5Skeleton
                            title="Drag-and-Drop Tags"
                            description="Drag tags to vocabulary items for quick assignment"
                            height="80px"
                        />
                    </div>
                </div>

                {/* Right Panel: Vocab Detail */}
                <div className="flex-1 overflow-auto">
                    {selectedVocab ? (
                        <VocabDetail
                            vocab={selectedVocab}
                            linkedSentences={linkedSentences}
                            onAddTag={addTag}
                            onRemoveTag={removeTag}
                            onNavigateToSentence={handleNavigateToSentence}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="text-4xl mb-2">📚</div>
                                <div>Select a vocabulary item to view details</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
