interface QuestionNumberProps {
    number: number;
    customLabel?: string;
    className?: string;
    show?: boolean;
}

/**
 * Shared component for rendering question numbers with consistent alignment.
 * Used across all question types: MC, T/F, Matching, Cloze, Grid, Vocab, Card.
 */
export function QuestionNumber({
    number,
    customLabel,
    className = '',
    show = true
}: QuestionNumberProps) {
    if (!show || number === undefined) return null;

    return (
        <span
            className={`font-bold mr-[3px] min-w-[1.5em] text-right inline-block text-[11pt] leading-[1.4] ${className}`}
            data-testid="question-number"
        >
            {customLabel || `${number}.`}
        </span>
    );
}
