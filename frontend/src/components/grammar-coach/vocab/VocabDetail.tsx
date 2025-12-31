/**
 * VocabDetail Component
 *
 * Detail panel showing word info, tags, and linked sentences.
 */

import type { VocabWithTags } from '../../../hooks/useVocabManagement';
import type { Sentence } from '../../../hooks/useSentences';
import { VocabTagEditor } from './VocabTagEditor';
import { VocabSentenceList } from './VocabSentenceList';

interface VocabDetailProps {
    readonly vocab: VocabWithTags;
    readonly linkedSentences: Sentence[];
    readonly onAddTag: (name: string) => void;
    readonly onRemoveTag: (tagId: number) => void;
    readonly onNavigateToSentence?: (sentenceId: number) => void;
}

export function VocabDetail({
    vocab,
    linkedSentences,
    onAddTag,
    onRemoveTag,
    onNavigateToSentence,
}: VocabDetailProps) {
    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="border-b theme-border pb-3">
                <h2 className="text-xl font-bold theme-text">
                    {vocab.word}
                    <span className="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">
                        ({vocab.reading})
                    </span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{vocab.meaning}</p>
            </div>

            {/* Word Info */}
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Part of Speech:</span>
                    <span className="ml-2 theme-text">{vocab.partOfSpeech || '-'}</span>
                </div>
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Lesson:</span>
                    <span className="ml-2 theme-text">{vocab.lessonId}</span>
                </div>
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Base Form:</span>
                    <span className="ml-2 theme-text">{vocab.baseForm || vocab.word}</span>
                </div>
                <div>
                    <span className="text-gray-500 dark:text-gray-400">Category:</span>
                    <span className="ml-2 theme-text">{vocab.category || '-'}</span>
                </div>
            </div>

            {/* Tags */}
            <div className="border-t theme-border pt-3">
                <VocabTagEditor
                    tags={vocab.tags}
                    onAddTag={onAddTag}
                    onRemoveTag={onRemoveTag}
                />
            </div>

            {/* Linked Sentences */}
            <div className="border-t theme-border pt-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Linked Sentences ({linkedSentences.length})
                </div>
                <VocabSentenceList
                    sentences={linkedSentences}
                    onNavigateToSentence={onNavigateToSentence}
                />
            </div>
        </div>
    );
}
