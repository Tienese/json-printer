import { type FC } from 'react';
import type { TrueFalseItem } from '../../../types/worksheet';

interface Props {
  item: TrueFalseItem;
  onUpdate: (item: TrueFalseItem) => void;
  onAddQuestion: (itemId: string, question: any) => void;
}

export const TrueFalseEditor: FC<Props> = ({ item, onUpdate, onAddQuestion }) => {
  const handleAddQuestion = () => {
    onAddQuestion(item.id, { id: crypto.randomUUID(), text: 'New statement', correctAnswer: true, showReasoning: true });
  };

  const handleRemoveQuestion = (index: number) => {
    if (item.questions.length <= 1) return;
    const newQuestions = item.questions.filter((_, i) => i !== index);
    onUpdate({ ...item, questions: newQuestions });
  };

  const handleQuestionChange = (index: number, field: 'text' | 'correctAnswer' | 'showReasoning', value: any) => {
    const newQuestions = [...item.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onUpdate({ ...item, questions: newQuestions });
  };

  return (
    <div className="prop-group" data-testid="tf-editor">
      <h4>True/False Properties</h4>

      <label className="prop-label">Language</label>
      <select
        className="prop-input mb-3"
        value={item.language || 'EN'}
        onChange={(e) => onUpdate({ ...item, language: e.target.value as any })}
      >
        <option value="EN">English (True/False)</option>
        <option value="VN">Vietnamese (Đúng/Sai)</option>
        <option value="JP">Japanese (正/誤)</option>
      </select>

      <label className="prop-label">Layout Mode</label>
      <select
        className="prop-input mb-3"
        value={item.layout || 'single'}
        onChange={(e) => onUpdate({ ...item, layout: e.target.value as any })}
      >
        <option value="single">Single Prejudice</option>
        <option value="multiple">Multiple Prejudice</option>
      </select>

      <div className="flex items-center gap-2 mb-4">
        <label className="checkbox-label whitespace-nowrap">
          <input
            type="checkbox"
            checked={item.showDashedLines}
            onChange={(e) => onUpdate({ ...item, showDashedLines: e.target.checked })}
          />
          Show reasoning lines
        </label>
        {item.showDashedLines && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="10"
              className="prop-input w-12 py-1 px-1 h-7"
              value={item.reasoningLines || 2}
              onChange={(e) => onUpdate({ ...item, reasoningLines: parseInt(e.target.value, 10) || 1 })}
            />
            <span className="text-[10px] text-gray-500">lines</span>
          </div>
        )}
      </div>

      <label className="checkbox-label mb-4">
        <input
          type="checkbox"
          checked={item.showPromptNumber}
          onChange={(e) => onUpdate({ ...item, showPromptNumber: e.target.checked })}
          data-testid="tf-show-number-checkbox"
        />
        Show question number
      </label>

      {item.layout === 'multiple' && (
        <button className="btn-add mb-4" onClick={handleAddQuestion}>
          + Add Statement
        </button>
      )}

      <h5 className="text-[12px] font-semibold mt-4 mb-2">
        {item.layout === 'multiple' ? `Statements (${item.questions.length})` : 'Statement'}
      </h5>

      <div className="space-y-3">
        {item.questions.map((q, idx) => {
          // If single mode, only show the first one
          if (item.layout === 'single' && idx > 0) return null;

          return (
            <div key={q.id || idx} className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-500">
                  {item.layout === 'multiple' ? `Statement ${String.fromCharCode(65 + idx)}` : 'Main Statement'}
                </span>
                <div className="flex items-center gap-2">
                  {item.showDashedLines && (
                    <label className="flex items-center gap-0.5 cursor-pointer" title="Toggle reasoning for this statement">
                      <input
                        type="checkbox"
                        checked={q.showReasoning !== false}
                        onChange={(e) => handleQuestionChange(idx, 'showReasoning', e.target.checked)}
                        className="scale-75"
                      />
                      <span className="text-[9px] text-gray-500">Reason</span>
                    </label>
                  )}
                  {item.layout === 'multiple' && (
                    <button
                      className="p-1 text-red-600 hover:bg-red-50 rounded text-[10px]"
                      onClick={() => handleRemoveQuestion(idx)}
                      disabled={item.questions.length <= 1}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <input
                className="prop-input mb-2"
                value={q.text}
                onChange={(e) => handleQuestionChange(idx, 'text', e.target.value)}
                placeholder="Enter statement..."
              />

              <div className="flex gap-3 text-[11px]">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctAnswer === true}
                    onChange={() => handleQuestionChange(idx, 'correctAnswer', true)}
                    className="accent-blue-600"
                  />
                  True
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctAnswer === false}
                    onChange={() => handleQuestionChange(idx, 'correctAnswer', false)}
                    className="accent-blue-600"
                  />
                  False
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
