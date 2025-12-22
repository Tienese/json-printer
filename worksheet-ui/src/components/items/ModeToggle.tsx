import type { FC } from 'react';
import type { ViewMode } from '../../types/worksheet';

interface ModeToggleProps {
  mode: ViewMode;
  onToggle: () => void;
}

export const ModeToggle: FC<ModeToggleProps> = ({ mode, onToggle }) => {
  const getBtnClass = (btnMode: ViewMode) => {
    const isActive = mode === btnMode;
    return `flex items-center justify-center px-3 h-8 border border-gray-300 cursor-pointer text-xs font-semibold transition-all duration-200 ${
      isActive 
        ? 'bg-gray-800 text-white border-gray-800' 
        : 'bg-white text-gray-700 hover:bg-gray-50'
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
