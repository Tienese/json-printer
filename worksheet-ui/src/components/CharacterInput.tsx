import { useState, useEffect, useRef, memo } from 'react';

interface CharacterInputProps {
  value: string;
  onCommit: (newValue: string) => void;
  onMultiCommit?: (chars: string[]) => void;
  onAdvance?: () => void;
  onRetreat?: () => void;
  onSectionBreak?: () => void;  // NEW: Break section at current position
  selectOnFocus?: boolean;
}

export const CharacterInput = memo(function CharacterInput({
  value,
  onCommit,
  onMultiCommit,
  onAdvance,
  onRetreat,
  onSectionBreak,
  selectOnFocus = false
}: CharacterInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  // Sync from props when not composing
  useEffect(() => {
    if (!isComposingRef.current) {
      setInternalValue(value);
    }
  }, [value]);

  // ONLY update display value, never commit or advance
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    const finalValue = (e.target as HTMLInputElement).value;

    if (finalValue.length === 0) {
      setInternalValue(value); // Restore original on cancel
      return;
    }

    if (finalValue.length === 1) {
      // Single character - commit and advance
      onCommit(finalValue);
      setInternalValue(finalValue);
      onAdvance?.();
    } else if (onMultiCommit) {
      // Multiple characters - split across boxes via insert-and-push
      const chars = finalValue.split('');
      onMultiCommit(chars);
      // Parent will update our value to first char
    } else {
      // Fallback: just take first char
      onCommit(finalValue.slice(0, 1));
      setInternalValue(finalValue.slice(0, 1));
      onAdvance?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Don't interfere with IME composition
    if (isComposingRef.current) return;

    switch (e.key) {
      case ' ':
        // Space = commit current value (if any) and advance
        e.preventDefault();
        if (internalValue) {
          onCommit(internalValue.slice(0, 1));
        }
        onAdvance?.();
        break;

      case 'Enter':
        // Plain Enter = section break (commit first, then break)
        // Ctrl+Enter handled by parent GridItem
        if (!e.ctrlKey) {
          e.preventDefault();
          if (internalValue) {
            onCommit(internalValue.slice(0, 1));
            setInternalValue(internalValue.slice(0, 1));
          }
          onSectionBreak?.();
        }
        break;

      case 'Backspace':
        // Backspace on empty = retreat to previous box
        if (internalValue === '') {
          e.preventDefault();
          onRetreat?.();
        }
        break;
    }
  };

  const handleFocus = () => {
    if (selectOnFocus && inputRef.current && internalValue) {
      inputRef.current.select();
    }
  };

  const handleBlur = () => {
    // Commit on blur (if not composing)
    if (!isComposingRef.current && internalValue) {
      onCommit(internalValue.slice(0, 1));
      setInternalValue(internalValue.slice(0, 1));
    }
  };

  return (
    <input
      ref={inputRef}
      className="char-input"
      value={internalValue}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    // NO maxLength - allow IME to work freely
    />
  );
});

