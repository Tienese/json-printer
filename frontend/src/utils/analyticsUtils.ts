import type { QuestionStatistics } from '../types/analysis';

/**
 * Calculate discrimination index for a question
 * Measures how well a question differentiates between high and low performers
 * @param q Question statistics
 * @returns Discrimination index (-1 to 1, higher is better)
 */
export function calculateDiscriminationIndex(q: QuestionStatistics): number {
    if (q.topStudentCount === 0 || q.bottomStudentCount === 0) return 0;
    const topRatio = q.correctTopStudentCount / q.topStudentCount;
    const bottomRatio = q.correctBottomStudentCount / q.bottomStudentCount;
    return topRatio - bottomRatio;
}

/**
 * Get difficulty label based on difficulty index
 * @param index Difficulty index (0 to 1)
 * @returns Human-readable difficulty label
 */
export function getDifficultyLabel(index: number): string {
    if (index < 0.3) return 'Hard';
    if (index < 0.7) return 'Medium';
    return 'Easy';
}

/**
 * Get discrimination quality label based on discrimination index
 * @param index Discrimination index (-1 to 1)
 * @returns Human-readable discrimination quality label
 */
export function getDiscriminationLabel(index: number): string {
    if (index < 0) return 'Poor';
    if (index < 0.2) return 'Weak';
    if (index < 0.4) return 'Good';
    return 'Excellent';
}
