/**
 * VocabTagEditor Component
 *
 * Add/remove tags from vocabulary.
 */

import { useState } from 'react';
import type { VocabTag } from '../../../hooks/useVocabManagement';

interface VocabTagEditorProps {
    readonly tags: VocabTag[];
    readonly onAddTag: (name: string) => void;
    readonly onRemoveTag: (tagId: number) => void;
}

export function VocabTagEditor({ tags, onAddTag, onRemoveTag }: VocabTagEditorProps) {
    const [newTag, setNewTag] = useState('');

    const handleAdd = () => {
        if (newTag.trim()) {
            onAddTag(newTag.trim());
            setNewTag('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</div>

            {/* Tag list */}
            <div className="flex flex-wrap gap-1.5">
                {tags.length === 0 ? (
                    <span className="text-sm text-gray-400 italic">No tags</span>
                ) : (
                    tags.map(tag => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded"
                        >
                            {tag.name}
                            <button
                                onClick={() => onRemoveTag(tag.id)}
                                className="ml-0.5 text-blue-600 dark:text-blue-300 hover:text-red-500 dark:hover:text-red-400 font-bold"
                                aria-label={`Remove ${tag.name} tag`}
                            >
                                ×
                            </button>
                        </span>
                    ))
                )}
            </div>

            {/* Add tag input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add tag..."
                    className="flex-1 px-2 py-1 text-sm border rounded theme-border theme-surface theme-text"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newTag.trim()}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add
                </button>
            </div>
        </div>
    );
}
