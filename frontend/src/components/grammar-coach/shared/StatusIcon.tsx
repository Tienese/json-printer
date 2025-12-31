/**
 * Status Icon Component
 * 
 * Print-first: Uses icons + text labels, not color alone.
 * Accessible: Includes aria-labels for screen readers.
 */

type StatusType = 'VALID' | 'INVALID' | 'UNCHECKED' | 'DIRTY' | 'PASS' | 'FAIL' | 'MISMATCH';

interface StatusIconProps {
    readonly status: StatusType;
    readonly showLabel?: boolean;
    readonly size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<StatusType, { icon: string; label: string; colorClass: string }> = {
    VALID: { icon: '✓', label: 'Valid', colorClass: 'text-green-600 dark:text-green-400' },
    INVALID: { icon: '✗', label: 'Invalid', colorClass: 'text-red-600 dark:text-red-400' },
    UNCHECKED: { icon: '?', label: 'Unchecked', colorClass: 'text-gray-500 dark:text-gray-400' },
    DIRTY: { icon: '⚠', label: 'Needs Review', colorClass: 'text-amber-600 dark:text-amber-400' },
    PASS: { icon: '✓', label: 'Pass', colorClass: 'text-green-600 dark:text-green-400' },
    FAIL: { icon: '✗', label: 'Fail', colorClass: 'text-red-600 dark:text-red-400' },
    MISMATCH: { icon: '≠', label: 'Mismatch', colorClass: 'text-orange-600 dark:text-orange-400' },
};

const SIZE_CLASSES = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
};

export function StatusIcon({ status, showLabel = true, size = 'md' }: StatusIconProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNCHECKED;
    const sizeClass = SIZE_CLASSES[size];

    return (
        <span
            className={`inline-flex items-center gap-1 font-medium ${config.colorClass} ${sizeClass} print:text-black`}
            aria-label={config.label}
            role="status"
        >
            <span className="status-icon" aria-hidden="true">
                {config.icon}
            </span>
            {showLabel && (
                <span className="status-label">{config.label}</span>
            )}
        </span>
    );
}

/**
 * Maps validation status string to StatusType
 */
export function mapValidationStatus(status: string): StatusType {
    const upper = status?.toUpperCase() || 'UNCHECKED';
    if (upper in STATUS_CONFIG) {
        return upper as StatusType;
    }
    return 'UNCHECKED';
}
