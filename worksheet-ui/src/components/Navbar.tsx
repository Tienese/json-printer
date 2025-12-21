import type { ReactNode } from 'react';

interface NavbarProps {
    readonly onBack?: () => void;
    readonly actions?: ReactNode;
}

export function Navbar({ onBack, actions }: NavbarProps) {
    return (
        <div className="border-b border-gray-200 bg-white shadow-sm z-30 flex items-center justify-between px-4 py-2 print:hidden h-[60px]">
            <div className="flex items-center gap-6">
                {onBack && (
                    <button
                        className="flex items-center gap-2 cursor-pointer border-none bg-transparent p-0"
                        onClick={onBack}
                        aria-label="Go to Home"
                    >
                        <div className="bg-primary-blue p-1.5 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg text-gray-800 tracking-tight">JSON Printer</span>
                    </button>
                )}
                {!onBack && (
                    <span className="font-bold text-lg text-gray-800 tracking-tight">JSON Printer</span>
                )}
            </div>

            {actions && (
                <div className="flex gap-4 items-center">
                    {actions}
                </div>
            )}
        </div>
    );
}
