import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MultipleChoiceItemComponent } from './MultipleChoiceItem';
import { createMultipleChoiceItem } from '../../utils/worksheetFactory';

describe('MultipleChoiceItemComponent', () => {
    const mockItem = {
        ...createMultipleChoiceItem(),
        prompt: 'What is 1+1?',
        options: ['1', '2', '3'],
        correctIndex: 1,
        promptNumber: 5,
        showPromptNumber: true
    };

    it('renders prompt and options', () => {
        render(
            <MultipleChoiceItemComponent
                item={mockItem}
                mode="teacher"
                onUpdate={vi.fn()}
            />
        );

        expect(screen.getByText('5.')).toBeInTheDocument();
        expect(screen.getByTestId('mc-prompt')).toHaveTextContent('What is 1+1?');
        expect(screen.getByText('A.')).toBeInTheDocument();
        expect(screen.getByText('B.')).toBeInTheDocument();
    });

    it('highlights correct answer in teacher mode', () => {
        render(
            <MultipleChoiceItemComponent
                item={mockItem}
                mode="teacher"
                onUpdate={vi.fn()}
            />
        );

        const optionB = screen.getByTestId('mc-option-1');
        expect(optionB).toHaveClass('underline');
        expect(optionB).toHaveClass('font-bold');
    });

    it('does not highlight answer in student mode', () => {
        render(
            <MultipleChoiceItemComponent
                item={mockItem}
                mode="student"
                onUpdate={vi.fn()}
            />
        );

        const optionB = screen.getByTestId('mc-option-1');
        expect(optionB).not.toHaveClass('underline');
    });
});
