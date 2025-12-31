/**
 * VocabSentenceList Component
 *
 * Displays sentences linked to selected vocabulary with validation status.
 */

import type { Sentence } from '../../../hooks/useSentences';
import { StatusIcon, mapValidationStatus } from '../shared/StatusIcon';

interface VocabSentenceListProps {
    readonly sentences: Sentence[];
    readonly onNavigateToSentence?: (sentenceId: number) => void;
}

export function VocabSentenceList({ sentences, onNavigateToSentence }: VocabSentenceListProps) {
    if (sentences.length === 0) {
        return (
            <div className="text-sm text-gray-400 italic py-2">
                No linked sentences
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {sentences.map(sentence => (
                <div
                    key={sentence.id}
                    onClick={() => onNavigateToSentence?.(sentence.id)}
                    onKeyDown={e => e.key === 'Enter' && onNavigateToSentence?.(sentence.id)}
                    tabIndex={onNavigateToSentence ? 0 : -1}
                    className={`
                        flex items-start gap-2 p-2 rounded text-sm
                        ${onNavigateToSentence ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                    `}
                >
                    <StatusIcon
                        status={mapValidationStatus(sentence.validationStatus)}
                        showLabel={false}
                        size="sm"
                    />
                    <div className="flex-1">
                        <div className="theme-text">{sentence.text}</div>
                        {sentence.validationMessage && (
                            <div className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                                {sentence.validationMessage}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
