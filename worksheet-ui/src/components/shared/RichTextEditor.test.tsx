import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RichTextEditor } from './RichTextEditor';

describe('RichTextEditor', () => {
    it('renders with placeholder when empty', () => {
        render(
            <RichTextEditor
                content=""
                onUpdate={() => { }}
                placeholder="Enter text..."
                testId="editor"
            />
        );

        const editor = screen.getByTestId('editor');
        expect(editor).toHaveAttribute('data-placeholder', 'Enter text...');
    });

    it('renders content from props', () => {
        render(
            <RichTextEditor
                content="<b>Hello</b> world"
                onUpdate={() => { }}
                testId="editor"
            />
        );

        const editor = screen.getByTestId('editor');
        expect(editor.innerHTML).toBe('<b>Hello</b> world');
    });

    it('calls onUpdate with sanitized content on blur', () => {
        const onUpdate = vi.fn();
        render(
            <RichTextEditor
                content=""
                onUpdate={onUpdate}
                testId="editor"
            />
        );

        const editor = screen.getByTestId('editor');

        // Focus the editor
        fireEvent.focus(editor);

        // Simulate typing (set innerHTML directly for test)
        editor.innerHTML = '<b>Test</b>';

        // Blur to trigger save
        fireEvent.blur(editor);

        expect(onUpdate).toHaveBeenCalledWith('<b>Test</b>');
    });

    it('does not call onUpdate if content unchanged', () => {
        const onUpdate = vi.fn();
        render(
            <RichTextEditor
                content="Hello"
                onUpdate={onUpdate}
                testId="editor"
            />
        );

        const editor = screen.getByTestId('editor');
        fireEvent.focus(editor);
        fireEvent.blur(editor);

        expect(onUpdate).not.toHaveBeenCalled();
    });

    it('is not editable when editable=false', () => {
        render(
            <RichTextEditor
                content="Read only"
                onUpdate={() => { }}
                editable={false}
                testId="editor"
            />
        );

        const editor = screen.getByTestId('editor');
        expect(editor).toHaveAttribute('contenteditable', 'false');
    });

    it('applies custom className', () => {
        render(
            <RichTextEditor
                content=""
                onUpdate={() => { }}
                className="custom-class"
                testId="editor"
            />
        );

        const editor = screen.getByTestId('editor');
        expect(editor).toHaveClass('custom-class');
    });
});
