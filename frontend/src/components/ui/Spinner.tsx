interface SpinnerProps {
    text?: string;
}

/**
 * Unified loading spinner component.
 * Always hidden in print output.
 */
export function Spinner({ text = 'Loading...' }: SpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center py-10 print:hidden">
            <div className="w-16 h-16 border-8 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
            <p className="font-black uppercase tracking-widest text-gray-500">{text}</p>
        </div>
    );
}
