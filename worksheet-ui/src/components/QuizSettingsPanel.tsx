import { useState } from 'react';
import type { QuizSettings } from '../types/qti';

interface QuizSettingsPanelProps {
    settings: QuizSettings;
    onChange: (settings: QuizSettings) => void;
}

export function QuizSettingsPanel({ settings, onChange }: QuizSettingsPanelProps) {
    const [hasTimeLimit, setHasTimeLimit] = useState<boolean>(settings.timeLimit != null);
    const [hasUnlimitedAttempts, setHasUnlimitedAttempts] = useState<boolean>(
        settings.allowedAttempts === -1
    );

    const handleChange = (field: keyof QuizSettings, value: any) => {
        onChange({ ...settings, [field]: value });
    };

    const handleTimeLimitToggle = (enabled: boolean) => {
        setHasTimeLimit(enabled);
        if (!enabled) {
            handleChange('timeLimit', null);
        } else {
            handleChange('timeLimit', 60);
        }
    };

    const handleAttemptsToggle = (unlimited: boolean) => {
        setHasUnlimitedAttempts(unlimited);
        if (unlimited) {
            handleChange('allowedAttempts', -1);
        } else {
            handleChange('allowedAttempts', 1);
        }
    };

    return (
        <div className="space-y-4">
            {/* Quiz Type */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                <label htmlFor="quizType" className="font-semibold text-black">
                    Quiz Type:
                </label>
                <select
                    id="quizType"
                    className="p-2 border border-black text-base focus:outline-2 focus:outline-black"
                    value={settings.quizType || 'assignment'}
                    onChange={(e) => handleChange('quizType', e.target.value)}
                >
                    <option value="assignment">Assignment (Graded)</option>
                    <option value="practice_quiz">Practice Quiz (Ungraded)</option>
                    <option value="graded_survey">Graded Survey</option>
                    <option value="survey">Survey (Anonymous)</option>
                </select>
            </div>

            {/* Time Limit */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-start">
                <label className="font-semibold text-black pt-2">Time Limit:</label>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!hasTimeLimit}
                                onChange={(e) => handleTimeLimitToggle(!e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span>No time limit</span>
                        </label>
                    </div>
                    {hasTimeLimit && (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                className="p-2 border border-black text-base w-24 focus:outline-2 focus:outline-black"
                                value={settings.timeLimit || 60}
                                onChange={(e) => handleChange('timeLimit', parseInt(e.target.value) || 60)}
                            />
                            <span className="text-gray-700">minutes</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Allowed Attempts */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-start">
                <label className="font-semibold text-black pt-2">Allowed Attempts:</label>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hasUnlimitedAttempts}
                                onChange={(e) => handleAttemptsToggle(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span>Unlimited attempts</span>
                        </label>
                    </div>
                    {!hasUnlimitedAttempts && (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                className="p-2 border border-black text-base w-24 focus:outline-2 focus:outline-black"
                                value={settings.allowedAttempts || 1}
                                onChange={(e) => handleChange('allowedAttempts', parseInt(e.target.value) || 1)}
                            />
                            <span className="text-gray-700">attempt(s)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Scoring Policy */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                <label htmlFor="scoringPolicy" className="font-semibold text-black">
                    Scoring Policy:
                </label>
                <select
                    id="scoringPolicy"
                    className="p-2 border border-black text-base focus:outline-2 focus:outline-black"
                    value={settings.scoringPolicy || 'keep_highest'}
                    onChange={(e) => handleChange('scoringPolicy', e.target.value)}
                >
                    <option value="keep_highest">Keep Highest Score</option>
                    <option value="keep_latest">Keep Latest Score</option>
                    <option value="keep_average">Keep Average Score</option>
                </select>
            </div>

            {/* Display Options */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-start">
                <label className="font-semibold text-black pt-2">Display Options:</label>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.showCorrectAnswers !== false}
                            onChange={(e) => handleChange('showCorrectAnswers', e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span>Show correct answers after submission</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.shuffleAnswers === true}
                            onChange={(e) => handleChange('shuffleAnswers', e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span>Shuffle answer order for each student</span>
                    </label>
                </div>
            </div>

            {/* Navigation Options */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-start">
                <label className="font-semibold text-black pt-2">Navigation:</label>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.oneQuestionAtATime === true}
                            onChange={(e) => handleChange('oneQuestionAtATime', e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span>Show one question at a time</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.cantGoBack === true}
                            onChange={(e) => handleChange('cantGoBack', e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span>Students can't go back to previous questions</span>
                    </label>
                </div>
            </div>

            {/* Due Date (Optional) */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                <label htmlFor="dueAt" className="font-semibold text-black">
                    Due Date:
                </label>
                <input
                    id="dueAt"
                    type="datetime-local"
                    className="p-2 border border-black text-base focus:outline-2 focus:outline-black"
                    value={settings.dueAt || ''}
                    onChange={(e) => handleChange('dueAt', e.target.value || null)}
                />
            </div>

            {/* Help Text */}
            <div className="text-sm text-gray-600 bg-gray-50 p-3 border border-gray-300">
                <strong>Note:</strong> These settings will be included in the Canvas quiz configuration.
                Leave dates empty if not needed.
            </div>
        </div>
    );
}
