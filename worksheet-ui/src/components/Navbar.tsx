import type { ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';

interface NavbarProps {
    readonly onBack?: () => void;
    readonly actions?: ReactNode;
}

export function Navbar({ onBack, actions }: NavbarProps) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="border-b theme-border theme-surface shadow-sm z-30 flex items-center justify-between px-4 py-2 print:hidden h-[60px]">
            <div className="flex items-center gap-6">
                {onBack && (
                    <button
                        className="flex items-center gap-2 cursor-pointer border-none bg-transparent p-0"
                        onClick={onBack}
                        aria-label="Go to Home"
                    >
                        <div className="bg-[var(--color-accent)] p-1.5 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg theme-text tracking-tight">JSON Printer</span>
                    </button>
                )}
                {!onBack && (
                    <span className="font-bold text-lg theme-text tracking-tight">JSON Printer</span>
                )}
            </div>

            <div className="flex gap-4 items-center">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg theme-elevated theme-text-secondary"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                    )}
                </button>

                {actions && actions}
            </div>
        </div>
    );
}


