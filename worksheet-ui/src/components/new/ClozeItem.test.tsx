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

    it('renders with answer in teacher mode', () => {
        render(
            <ClozeItemComponent
                item={mockItem}
                mode="teacher"
            />
        );

        expect(screen.getByText('[beautiful]')).toBeInTheDocument();
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('world!')).toBeInTheDocument();
    });

    it('renders with blank in student mode', () => {
        render(
            <ClozeItemComponent
                item={mockItem}
                mode="student"
            />
        );

        const blank = screen.getByTestId('cloze-blank-0');
        expect(blank).toHaveClass('text-transparent');
        expect(screen.queryByText('[beautiful]')).not.toBeInTheDocument();
    });
});
