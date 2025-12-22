import type { ReactNode } from 'react';

type AlertType = 'error' | 'success' | 'info';

interface AlertProps {
    type: AlertType;
    children: ReactNode;
}

const typeClasses: Record<AlertType, string> = {
    error: 'border-black bg-gray-50 text-black',
    success: 'border-black bg-black text-white',
    info: 'border-gray-300 bg-gray-50 text-gray-800',
};

/**
 * Unified alert component.
 * Always hidden in print output.
 */
export function Alert({ type, children }: AlertProps) {
    return (
        <div className={`p-4 border-2 flex items-center gap-2 print:hidden ${typeClasses[type]}`}>
            {children}
        </div>
    );
}
