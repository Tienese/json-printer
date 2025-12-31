import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClozeItemComponent } from './ClozeItem';
import { createClozeItem } from '../../utils/worksheetFactory';

describe('ClozeItemComponent', () => {
    const mockItem = {
        ...createClozeItem(),
        template: 'Hello {{blank}} world!',
        answers: ['beautiful'],
        promptNumber: 1,
        showPromptNumber: true
    };

    it('renders with editable blank in teacher mode', () => {
        render(
            <ClozeItemComponent
                item={mockItem}
                mode="teacher"
            />
        );

        // In teacher mode, the blank is editable and shows the answer
        const blank = screen.getByTestId('cloze-blank-0');
        expect(blank).toBeInTheDocument();
        expect(blank).toHaveAttribute('contenteditable', 'true');
        expect(blank.textContent).toBe('beautiful');
    });

    it('renders with blank underline in student mode', () => {
        render(
            <ClozeItemComponent
                item={mockItem}
                mode="student"
            />
        );

        // In student mode, no editable blank - just underline
        expect(screen.queryByTestId('cloze-blank-0')).not.toBeInTheDocument();
        // Answer should not be visible
        expect(screen.queryByText('beautiful')).not.toBeInTheDocument();
    });

    it('shows question number when enabled', () => {
        render(
            <ClozeItemComponent
                item={mockItem}
                mode="student"
            />
        );

        expect(screen.getByTestId('question-number')).toHaveTextContent('1.');
    });

    it('renders multiple blanks correctly', () => {
        const multiBlankItem = {
            ...createClozeItem(),
            template: 'The {{blank}} is {{blank}}.',
            answers: ['sky', 'blue'],
            promptNumber: 1,
            showPromptNumber: true
        };

        render(
            <ClozeItemComponent
                item={multiBlankItem}
                mode="teacher"
            />
        );

        expect(screen.getByTestId('cloze-blank-0').textContent).toBe('sky');
        expect(screen.getByTestId('cloze-blank-1').textContent).toBe('blue');
    });
});
