import { useState } from 'react';
import { VocabCoachPanel } from './VocabCoachPanel';

interface CoachSidebarProps {
    worksheetId: number | null;
    worksheetJson: string;
    isOpen: boolean;
    onToggle: () => void;
}

type CoachTab = 'vocab' | 'grammar' | 'style';

/**
 * Right sidebar for analysis and coaching features.
 * Separate from editing sidebar for better organization.
 */
export function CoachSidebar({
    worksheetId,
    worksheetJson,
    isOpen,
    onToggle,
}: CoachSidebarProps) {
    const [activeTab, setActiveTab] = useState<CoachTab>('vocab');

    const tabs = [
        { id: 'vocab' as CoachTab, label: 'Vocab', icon: '📊' },
        { id: 'grammar' as CoachTab, label: 'Grammar', icon: '📝' },
        { id: 'style' as CoachTab, label: 'Style', icon: '✨' },
    ];

    return (
        <div className={`shrink-0 theme-surface border-l theme-border flex flex-col h-full relative transition-all duration-300 print:hidden ${isOpen ? 'w-[300px]' : 'w-[40px] items-center'}`}>
            {/* Sidebar Title Bar / Collapse Toggle */}
            <div className="flex items-center justify-between p-3 border-b theme-border h-[45px] w-full">
                {isOpen && <h2 className="text-xs font-bold theme-text-muted uppercase tracking-wider">Coach</h2>}
                <button
                    onClick={onToggle}
                    className="p-1 hover:bg-[var(--color-elevated)] rounded theme-text-secondary"
                    title={isOpen ? "Collapse Coach" : "Expand Coach"}
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    )}
                </button>
            </div>

            {isOpen && (
                <>
                    {/* Tabs Navigation */}
                    <div className="flex border-b theme-border w-full">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === tab.id
                                    ? 'theme-accent border-b-2 border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                                    : 'theme-text-secondary hover:theme-text hover:bg-[var(--color-elevated)]'
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                                title={tab.label}
                            >
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.icon}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto w-full">
                        {activeTab === 'vocab' && (
                            <div className="animate-in fade-in">
                                <VocabCoachPanel worksheetId={worksheetId} worksheetJson={worksheetJson} />
                            </div>
                        )}

                        {activeTab === 'grammar' && (
                            <div className="p-4 text-center theme-text-muted">
                                <span className="text-3xl mb-2 block">📝</span>
                                <p className="text-sm font-medium">Grammar Analyzer</p>
                                <p className="text-xs mt-1">Coming soon</p>
                            </div>
                        )}

                        {activeTab === 'style' && (
                            <div className="p-4 text-center theme-text-muted">
                                <span className="text-3xl mb-2 block">✨</span>
                                <p className="text-sm font-medium">Style Checker</p>
                                <p className="text-xs mt-1">Coming soon</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {!isOpen && (
                <div className="flex flex-col items-center py-4 gap-4">
                    <span className="text-lg" title="Coach Panel">📊</span>
                </div>
            )}
        </div>
    );
}
