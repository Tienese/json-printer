import type { FC } from 'react';
import type { ViewMode } from '../../types/worksheet';

interface ModeToggleProps {
  mode: ViewMode;
  onToggle: () => void;
}

export const ModeToggle: FC<ModeToggleProps> = ({ mode, onToggle }) => {
  const getBtnClass = (btnMode: ViewMode) => {
    const isActive = mode === btnMode;
    return `flex items-center justify-center px-3 h-8 border theme-border cursor-pointer text-xs font-semibold transition-all duration-200 ${isActive
        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
        : 'theme-surface theme-text'
      }`;
  };

  return (
    <div className="flex rounded overflow-hidden shadow-sm" data-testid="mode-toggle">
      <button
        className={`${getBtnClass('teacher')} rounded-l border-r-0`}
        onClick={() => mode !== 'teacher' && onToggle()}
        data-testid="mode-btn-teacher"
      >
        Teacher
      </button>
      <button
        className={`${getBtnClass('student')} rounded-r`}
        onClick={() => mode !== 'student' && onToggle()}
        data-testid="mode-btn-student"
      >
        Student
      </button>
    </div>
  );
};
