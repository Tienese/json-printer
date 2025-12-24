import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CharacterInput } from './CharacterInput';

describe('CharacterInput', () => {
  const mockOnCommit = vi.fn();
  const mockOnMultiCommit = vi.fn();
  const mockOnAdvance = vi.fn();
  const mockOnRetreat = vi.fn();
  const mockOnSectionBreak = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering and props', () => {
    it('renders with initial value', () => {
      render(<CharacterInput value="A" onCommit={mockOnCommit} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('A');
    });

    it('renders empty input when value is empty string', () => {
      render(<CharacterInput value="" onCommit={mockOnCommit} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('updates internal value when prop value changes', () => {
      const { rerender } = render(<CharacterInput value="A" onCommit={mockOnCommit} />);
      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('A');

      rerender(<CharacterInput value="B" onCommit={mockOnCommit} />);
      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('B');
    });
  });

  describe('Change handling - replacement detection', () => {
    it('detects replacement when typing over filled box', () => {
      render(
        <CharacterInput
          value="A"
          onCommit={mockOnCommit}
          onAdvance={mockOnAdvance}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Simulate typing 'B' when 'A' is present (replacement)
      fireEvent.change(input, { target: { value: 'AB' } });

      expect(mockOnCommit).toHaveBeenCalledWith('B');
      expect(mockOnAdvance).toHaveBeenCalled();
    });

    it('extracts only the newly typed character on replacement', () => {
      render(
        <CharacterInput
          value="X"
          onCommit={mockOnCommit}
          onAdvance={mockOnAdvance}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;

      // User types 'Y' over 'X'
      fireEvent.change(input, { target: { value: 'XY' } });

      expect(mockOnCommit).toHaveBeenCalledWith('Y');
    });

    it('handles normal typing without replacement', () => {
      render(<CharacterInput value="" onCommit={mockOnCommit} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'A' } });

      // Should not commit on normal change, only on blur or special keys
      expect(mockOnCommit).not.toHaveBeenCalled();
    });
  });

  describe('IME composition handling', () => {
    it('accumulates value during composition', () => {
      render(<CharacterInput value="" onCommit={mockOnCommit} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: 'あ' } });

      // Should not commit during composition
      expect(mockOnCommit).not.toHaveBeenCalled();
      expect(input.value).toBe('あ');
    });

    it('commits single character on composition end', () => {
      render(
        <CharacterInput
          value=""
          onCommit={mockOnCommit}
          onAdvance={mockOnAdvance}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: 'あ' } });
      fireEvent.compositionEnd(input, { target: { value: 'あ' } });

      expect(mockOnCommit).toHaveBeenCalledWith('あ');
      expect(mockOnAdvance).toHaveBeenCalled();
    });

    it('calls multiCommit for multiple characters on composition end', () => {
      render(
        <CharacterInput
          value=""
          onCommit={mockOnCommit}
          onMultiCommit={mockOnMultiCommit}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: 'あいう' } });
      fireEvent.compositionEnd(input, { target: { value: 'あいう' } });

      expect(mockOnMultiCommit).toHaveBeenCalledWith(['あ', 'い', 'う']);
      expect(mockOnCommit).not.toHaveBeenCalled();
    });

    it('falls back to first char if no multiCommit handler', () => {
      render(
        <CharacterInput
          value=""
          onCommit={mockOnCommit}
          onAdvance={mockOnAdvance}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.compositionStart(input);
      fireEvent.compositionEnd(input, { target: { value: 'あいう' } });

      expect(mockOnCommit).toHaveBeenCalledWith('あ');
      expect(mockOnAdvance).toHaveBeenCalled();
    });

    it('restores original value on empty composition', () => {
      render(<CharacterInput value="A" onCommit={mockOnCommit} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.compositionEnd(input, { target: { value: '' } });

      expect(input.value).toBe('A');
      expect(mockOnCommit).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard navigation', () => {
    it('advances on spacebar press', () => {
      render(
        <CharacterInput
          value="A"
          onCommit={mockOnCommit}
          onAdvance={mockOnAdvance}
        />
      );
      const input = screen.getByRole('textbox');

      fireEvent.keyDown(input, { key: ' ' });

      expect(mockOnCommit).toHaveBeenCalledWith('A');
      expect(mockOnAdvance).toHaveBeenCalled();
    });

    it('advances on spacebar even with empty value', () => {
      render(
        <CharacterInput
          value=""
          onCommit={mockOnCommit}
          onAdvance={mockOnAdvance}
        />
      );
      const input = screen.getByRole('textbox');

      fireEvent.keyDown(input, { key: ' ' });

      expect(mockOnAdvance).toHaveBeenCalled();
      expect(mockOnCommit).not.toHaveBeenCalled();
    });

    it('triggers section break on plain Enter', () => {
      render(
        <CharacterInput
          value="A"
          onCommit={mockOnCommit}
          onSectionBreak={mockOnSectionBreak}
        />
      );
      const input = screen.getByRole('textbox');

      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnCommit).toHaveBeenCalledWith('A');
      expect(mockOnSectionBreak).toHaveBeenCalled();
    });

    it('does not trigger section break on Ctrl+Enter', () => {
      render(
        <CharacterInput
          value="A"
          onCommit={mockOnCommit}
          onSectionBreak={mockOnSectionBreak}
        />
      );
      const input = screen.getByRole('textbox');

      fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });

      expect(mockOnSectionBreak).not.toHaveBeenCalled();
    });

    it('retreats on backspace when empty', () => {
      render(
        <CharacterInput
          value=""
          onCommit={mockOnCommit}
          onRetreat={mockOnRetreat}
        />
      );
      const input = screen.getByRole('textbox');

      fireEvent.keyDown(input, { key: 'Backspace' });

      expect(mockOnRetreat).toHaveBeenCalled();
    });

    it('does not retreat on backspace when has content', () => {
      render(
        <CharacterInput
          value="A"
          onCommit={mockOnCommit}
          onRetreat={mockOnRetreat}
        />
      );
      const input = screen.getByRole('textbox');

      fireEvent.keyDown(input, { key: 'Backspace' });

      expect(mockOnRetreat).not.toHaveBeenCalled();
    });

    it('does not interfere with IME during composition', () => {
      render(
        <CharacterInput
          value=""
          onCommit={mockOnCommit}
          onAdvance={mockOnAdvance}
        />
      );
      const input = screen.getByRole('textbox');

      fireEvent.compositionStart(input);
      fireEvent.keyDown(input, { key: ' ' });

      expect(mockOnAdvance).not.toHaveBeenCalled();
    });
  });

  describe('Focus and blur behavior', () => {
    it('selects content on focus when selectOnFocus is true', () => {
      render(
        <CharacterInput
          value="A"
          onCommit={mockOnCommit}
          selectOnFocus={true}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      input.select = vi.fn();

      fireEvent.focus(input);

      expect(input.select).toHaveBeenCalled();
    });

    it('does not select on focus when selectOnFocus is false', () => {
      render(
        <CharacterInput
          value="A"
          onCommit={mockOnCommit}
          selectOnFocus={false}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      input.select = vi.fn();

      fireEvent.focus(input);

      expect(input.select).not.toHaveBeenCalled();
    });

    it('commits value on blur', () => {
      render(<CharacterInput value="" onCommit={mockOnCommit} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'X' } });
      fireEvent.blur(input);

      expect(mockOnCommit).toHaveBeenCalledWith('X');
    });

    it('does not commit on blur during composition', () => {
      render(<CharacterInput value="" onCommit={mockOnCommit} />);
      const input = screen.getByRole('textbox');

      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: 'あ' } });
      fireEvent.blur(input);

      expect(mockOnCommit).not.toHaveBeenCalled();
    });

    it('trims value to first character on blur', () => {
      render(<CharacterInput value="" onCommit={mockOnCommit} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'ABC' } });
      fireEvent.blur(input);

      expect(mockOnCommit).toHaveBeenCalledWith('A');
      expect(input.value).toBe('A');
    });
  });

  describe('Edge cases', () => {
    it('handles empty string value prop', () => {
      render(<CharacterInput value="" onCommit={mockOnCommit} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles rapid value changes', () => {
      const { rerender } = render(<CharacterInput value="A" onCommit={mockOnCommit} />);
      
      rerender(<CharacterInput value="B" onCommit={mockOnCommit} />);
      rerender(<CharacterInput value="C" onCommit={mockOnCommit} />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('C');
    });

    it('handles special characters', () => {
      render(
        <CharacterInput
          value=""
          onCommit={mockOnCommit}
          onAdvance={mockOnAdvance}
        />
      );
      const input = screen.getByRole('textbox');

      fireEvent.compositionStart(input);
      fireEvent.compositionEnd(input, { target: { value: '漢' } });

      expect(mockOnCommit).toHaveBeenCalledWith('漢');
    });

    it('handles emoji characters', () => {
      render(
        <CharacterInput
          value=""
          onCommit={mockOnCommit}
          onAdvance={mockOnAdvance}
        />
      );
      const input = screen.getByRole('textbox');

      fireEvent.compositionEnd(input, { target: { value: '😀' } });

      expect(mockOnCommit).toHaveBeenCalledWith('😀');
    });
  });

  describe('Integration scenarios', () => {
    it('completes full typing workflow', () => {
      render(
        <CharacterInput
          value=""
          onCommit={mockOnCommit}
          onAdvance={mockOnAdvance}
        />
      );
      const input = screen.getByRole('textbox');

      // Type a character
      fireEvent.change(input, { target: { value: 'A' } });
      // Press space to advance
      fireEvent.keyDown(input, { key: ' ' });

      expect(mockOnAdvance).toHaveBeenCalled();
    });

    it('completes IME input workflow', () => {
      render(
        <CharacterInput
          value=""
          onCommit={mockOnCommit}
          onMultiCommit={mockOnMultiCommit}
        />
      );
      const input = screen.getByRole('textbox');

      // Start IME
      fireEvent.compositionStart(input);
      // Type multiple characters
      fireEvent.change(input, { target: { value: 'こんにちは' } });
      // Confirm
      fireEvent.compositionEnd(input, { target: { value: 'こんにちは' } });

      expect(mockOnMultiCommit).toHaveBeenCalledWith(['こ', 'ん', 'に', 'ち', 'は']);
    });
  });
});