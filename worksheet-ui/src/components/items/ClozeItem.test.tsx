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

        // In teacher mode, the answer is shown in an editable span
        expect(screen.getByText('beautiful')).toBeInTheDocument();
        expect(screen.getByText(/Hello/)).toBeInTheDocument();
        expect(screen.getByText(/world!/)).toBeInTheDocument();
    });

    it('renders with blank underline in student mode', () => {
        render(
            <ClozeItemComponent
                item={mockItem}
                mode="student"
            />
        );

        // In student mode, the blank is an underline (no answer visible)
        const template = screen.getByTestId('cloze-template');
        expect(template).toBeInTheDocument();
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
});
