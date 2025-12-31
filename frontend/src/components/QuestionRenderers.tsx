import type { Question } from '../types/printReport';

interface QuestionRendererProps {
    readonly question: Question;
    readonly editMode?: boolean;
    readonly editFieldClass?: string;
}

/**
 * Renders matching question as two-column table
 */
export function MatchingQuestionRenderer({ question, editFieldClass }: QuestionRendererProps) {
    // For matching questions, options are pairs
    // Even indices are left column, odd indices are right column (shuffled in blank view)
    const leftOptions = question.options.filter((_, i) => i % 2 === 0);
    const rightOptions = question.options.filter((_, i) => i % 2 !== 0);

    return (
        <div className="grid grid-cols-2 gap-4 mb-2">
            {/* Left column */}
            <div className="space-y-2">
                {leftOptions.map((option, index) => (
                    <div key={`left-${index}`} className="flex items-start gap-2 text-[9pt]">
                        <span className="font-black w-4">{option.optionLetter}.</span>
                        <span className={`flex-1 ${editFieldClass}`}>{option.optionText}</span>
                    </div>
                ))}
            </div>

            {/* Right column */}
            <div className="space-y-2">
                {rightOptions.map((option, index) => (
                    <div key={`right-${index}`} className="flex items-start gap-2 text-[9pt]">
                        <div className={`w-3 h-3 border border-black shrink-0 translate-y-0.5 ${option.isStudentAnswer ? 'bg-black' : 'bg-white'}`}></div>
                        <span className={`flex-1 ${editFieldClass}`}>{option.optionText}</span>
                        {option.isCorrect && <span className="ml-1">✓</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Renders fill-in-the-blank with underlines
 */
export function FillInBlankRenderer({ question, editFieldClass }: QuestionRendererProps) {
    // For FIMB, the questionText should contain [[BLANK]] markers
    // or we render blanks from the student answer
    const parts = question.questionText.split(/(\[\[BLANK\]\])/gi);

    return (
        <div className={`text-[10pt] leading-relaxed mb-2 ${editFieldClass}`}>
            {parts.map((part, i) => {
                if (part.toUpperCase() === '[[BLANK]]') {
                    return (
                        <span
                            key={i}
                            className="inline-block border-b-2 border-black mx-1 min-w-[80px] text-center"
                            style={{ minWidth: '4cm' }}
                        >
                            {question.studentAnswerText || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </div>
    );
}

/**
 * Renders essay question as empty grid boxes
 */
export function EssayQuestionRenderer({ question }: QuestionRendererProps) {
    // Render writing grid (similar to GridItem pattern)
    // Use pointsPossible to determine number of rows (1 point = 1 row, min 5)
    const rows = Math.max(5, Math.ceil(question.pointsPossible || 5));
    const boxSize = 10; // mm

    return (
        <div className="mb-2">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex">
                    {Array.from({ length: 20 }).map((_, colIndex) => (
                        <div
                            key={`col-${colIndex}`}
                            className="box-border border border-gray-300 bg-white flex items-center justify-center -mr-px -mb-px"
                            style={{ width: `${boxSize}mm`, height: `${boxSize}mm` }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Renders True/False with circles and reasoning line
 */
export function TrueFalseRenderer({ question, editFieldClass }: QuestionRendererProps) {
    const studentAnswerLower = question.studentAnswerText.toLowerCase();
    const selectedTrue = studentAnswerLower.includes('true') || studentAnswerLower.includes('t');
    const selectedFalse = studentAnswerLower.includes('false') || studentAnswerLower.includes('f');

    return (
        <div className="space-y-2">
            <div className="flex gap-6 text-[10pt]">
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 border-black ${selectedTrue ? 'bg-black' : 'bg-white'}`} />
                    <span className="font-bold">True</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 border-black ${selectedFalse ? 'bg-black' : 'bg-white'}`} />
                    <span className="font-bold">False</span>
                </div>
            </div>

            {/* Reasoning line */}
            <div className="mt-2">
                <span className="text-[8pt] text-gray-500 uppercase tracking-wider">Reasoning:</span>
                <div className={`border-b border-dashed border-black pt-1 ${editFieldClass}`}>
                    &nbsp;
                </div>
                <div className={`border-b border-dashed border-black pt-3 ${editFieldClass}`}>
                    &nbsp;
                </div>
            </div>
        </div>
    );
}

/**
 * Renders short answer with writing lines
 */
export function ShortAnswerRenderer({ question, editFieldClass }: QuestionRendererProps) {
    const lines = 3; // Default lines for short answer

    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div key={`line-${i}`} className={`border-b border-black pt-2 ${editFieldClass}`}>
                    {i === 0 && question.studentAnswerText ? question.studentAnswerText : '\u00A0'}
                </div>
            ))}
        </div>
    );
}
