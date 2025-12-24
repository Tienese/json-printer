import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { focusGridBox, focusGridBoxFromEvent } from './gridFocus';

describe('gridFocus utility', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('focusGridBox', () => {
    it('focuses character input when target is char', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      
      const charWrapper = document.createElement('div');
      charWrapper.setAttribute('data-section', '0');
      charWrapper.setAttribute('data-box', '0');
      charWrapper.setAttribute('data-type', 'char');
      
      const input = document.createElement('input');
      input.className = 'char-input';
      input.focus = vi.fn();
      
      charWrapper.appendChild(input);
      container.appendChild(charWrapper);
      document.body.appendChild(container);

      focusGridBox(0, 0, 'char');
      vi.runAllTimers();

      expect(input.focus).toHaveBeenCalled();
    });

    it('focuses furigana input when target is furigana', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      
      const furiganaInput = document.createElement('input');
      furiganaInput.setAttribute('data-section', '1');
      furiganaInput.setAttribute('data-box', '2');
      furiganaInput.setAttribute('data-type', 'furigana');
      furiganaInput.focus = vi.fn();
      
      container.appendChild(furiganaInput);
      document.body.appendChild(container);

      focusGridBox(1, 2, 'furigana');
      vi.runAllTimers();

      expect(furiganaInput.focus).toHaveBeenCalled();
    });

    it('uses custom delay when provided', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      
      const input = document.createElement('input');
      input.className = 'char-input';
      input.focus = vi.fn();
      
      const charWrapper = document.createElement('div');
      charWrapper.setAttribute('data-section', '0');
      charWrapper.setAttribute('data-box', '0');
      charWrapper.setAttribute('data-type', 'char');
      charWrapper.appendChild(input);
      
      container.appendChild(charWrapper);
      document.body.appendChild(container);

      focusGridBox(0, 0, 'char', 100);
      
      // Should not focus yet
      expect(input.focus).not.toHaveBeenCalled();
      
      // Advance timers by 100ms
      vi.advanceTimersByTime(100);
      
      expect(input.focus).toHaveBeenCalled();
    });

    it('uses default delay of 50ms when not provided', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      
      const input = document.createElement('input');
      input.className = 'char-input';
      input.focus = vi.fn();
      
      const charWrapper = document.createElement('div');
      charWrapper.setAttribute('data-section', '0');
      charWrapper.setAttribute('data-box', '0');
      charWrapper.setAttribute('data-type', 'char');
      charWrapper.appendChild(input);
      
      container.appendChild(charWrapper);
      document.body.appendChild(container);

      focusGridBox(0, 0, 'char');
      
      vi.advanceTimersByTime(49);
      expect(input.focus).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(1);
      expect(input.focus).toHaveBeenCalled();
    });

    it('scopes focus to specific grid when itemId provided', () => {
      // Create two grids
      const grid1 = document.createElement('div');
      grid1.setAttribute('data-grid-id', 'grid-1');
      
      const grid2 = document.createElement('div');
      grid2.setAttribute('data-grid-id', 'grid-2');
      
      const input1 = document.createElement('input');
      input1.className = 'char-input';
      input1.focus = vi.fn();
      
      const input2 = document.createElement('input');
      input2.className = 'char-input';
      input2.focus = vi.fn();
      
      const wrapper1 = document.createElement('div');
      wrapper1.setAttribute('data-section', '0');
      wrapper1.setAttribute('data-box', '0');
      wrapper1.setAttribute('data-type', 'char');
      wrapper1.appendChild(input1);
      
      const wrapper2 = document.createElement('div');
      wrapper2.setAttribute('data-section', '0');
      wrapper2.setAttribute('data-box', '0');
      wrapper2.setAttribute('data-type', 'char');
      wrapper2.appendChild(input2);
      
      grid1.appendChild(wrapper1);
      grid2.appendChild(wrapper2);
      document.body.appendChild(grid1);
      document.body.appendChild(grid2);

      focusGridBox(0, 0, 'char', 50, 'grid-2');
      vi.runAllTimers();

      expect(input1.focus).not.toHaveBeenCalled();
      expect(input2.focus).toHaveBeenCalled();
    });

    it('falls back to first grid when no itemId provided', () => {
      const grid1 = document.createElement('div');
      grid1.setAttribute('data-grid-container', '');
      
      const grid2 = document.createElement('div');
      grid2.setAttribute('data-grid-container', '');
      
      const input1 = document.createElement('input');
      input1.className = 'char-input';
      input1.focus = vi.fn();
      
      const wrapper1 = document.createElement('div');
      wrapper1.setAttribute('data-section', '0');
      wrapper1.setAttribute('data-box', '0');
      wrapper1.setAttribute('data-type', 'char');
      wrapper1.appendChild(input1);
      
      grid1.appendChild(wrapper1);
      document.body.appendChild(grid1);
      document.body.appendChild(grid2);

      focusGridBox(0, 0, 'char');
      vi.runAllTimers();

      expect(input1.focus).toHaveBeenCalled();
    });

    it('does nothing when container not found', () => {
      focusGridBox(0, 0, 'char');
      vi.runAllTimers();
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('does nothing when input not found', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      document.body.appendChild(container);

      focusGridBox(0, 0, 'char');
      vi.runAllTimers();
      
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('focusGridBoxFromEvent', () => {
    it('focuses character input using event container', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      
      const charWrapper = document.createElement('div');
      charWrapper.setAttribute('data-section', '0');
      charWrapper.setAttribute('data-box', '1');
      charWrapper.setAttribute('data-type', 'char');
      
      const input = document.createElement('input');
      input.className = 'char-input';
      input.focus = vi.fn();
      
      charWrapper.appendChild(input);
      container.appendChild(charWrapper);
      document.body.appendChild(container);

      const mockEvent = {
        target: charWrapper,
      } as unknown as KeyboardEvent;

      focusGridBoxFromEvent(mockEvent, 0, 1, 'char');
      vi.runAllTimers();

      expect(input.focus).toHaveBeenCalled();
    });

    it('focuses furigana input using event container', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      
      const someElement = document.createElement('div');
      
      const furiganaInput = document.createElement('input');
      furiganaInput.setAttribute('data-section', '2');
      furiganaInput.setAttribute('data-box', '3');
      furiganaInput.setAttribute('data-type', 'furigana');
      furiganaInput.focus = vi.fn();
      
      container.appendChild(someElement);
      container.appendChild(furiganaInput);
      document.body.appendChild(container);

      const mockEvent = {
        target: someElement,
      } as unknown as KeyboardEvent;

      focusGridBoxFromEvent(mockEvent, 2, 3, 'furigana');
      vi.runAllTimers();

      expect(furiganaInput.focus).toHaveBeenCalled();
    });

    it('uses 0 delay for keyboard navigation', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      
      const input = document.createElement('input');
      input.className = 'char-input';
      input.focus = vi.fn();
      
      const charWrapper = document.createElement('div');
      charWrapper.setAttribute('data-section', '0');
      charWrapper.setAttribute('data-box', '0');
      charWrapper.setAttribute('data-type', 'char');
      charWrapper.appendChild(input);
      
      container.appendChild(charWrapper);
      document.body.appendChild(container);

      const mockEvent = {
        target: charWrapper,
      } as unknown as KeyboardEvent;

      focusGridBoxFromEvent(mockEvent, 0, 0, 'char');
      
      // Should focus immediately (0 delay)
      vi.advanceTimersByTime(0);
      
      expect(input.focus).toHaveBeenCalled();
    });

    it('finds container from nested event target', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      
      const nestedDiv = document.createElement('div');
      const deepNestedSpan = document.createElement('span');
      
      const charWrapper = document.createElement('div');
      charWrapper.setAttribute('data-section', '0');
      charWrapper.setAttribute('data-box', '0');
      charWrapper.setAttribute('data-type', 'char');
      
      const input = document.createElement('input');
      input.className = 'char-input';
      input.focus = vi.fn();
      
      charWrapper.appendChild(input);
      nestedDiv.appendChild(deepNestedSpan);
      container.appendChild(nestedDiv);
      container.appendChild(charWrapper);
      document.body.appendChild(container);

      const mockEvent = {
        target: deepNestedSpan,
      } as unknown as KeyboardEvent;

      focusGridBoxFromEvent(mockEvent, 0, 0, 'char');
      vi.runAllTimers();

      expect(input.focus).toHaveBeenCalled();
    });

    it('does nothing when container not found from event', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const mockEvent = {
        target: element,
      } as unknown as KeyboardEvent;

      focusGridBoxFromEvent(mockEvent, 0, 0, 'char');
      vi.runAllTimers();
      
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles missing data attributes gracefully', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      
      const input = document.createElement('input');
      input.className = 'char-input';
      input.focus = vi.fn();
      
      container.appendChild(input);
      document.body.appendChild(container);

      focusGridBox(0, 0, 'char');
      vi.runAllTimers();

      expect(input.focus).not.toHaveBeenCalled();
    });

    it('handles null input element gracefully', () => {
      const container = document.createElement('div');
      container.setAttribute('data-grid-container', '');
      
      const charWrapper = document.createElement('div');
      charWrapper.setAttribute('data-section', '0');
      charWrapper.setAttribute('data-box', '0');
      charWrapper.setAttribute('data-type', 'char');
      
      container.appendChild(charWrapper);
      document.body.appendChild(container);

      focusGridBox(0, 0, 'char');
      vi.runAllTimers();
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('handles multiple grids with same coordinates', () => {
      const grid1 = document.createElement('div');
      grid1.setAttribute('data-grid-id', 'unique-1');
      
      const grid2 = document.createElement('div');
      grid2.setAttribute('data-grid-id', 'unique-2');
      
      const input1 = document.createElement('input');
      input1.className = 'char-input';
      input1.focus = vi.fn();
      
      const input2 = document.createElement('input');
      input2.className = 'char-input';
      input2.focus = vi.fn();
      
      const wrapper1 = document.createElement('div');
      wrapper1.setAttribute('data-section', '5');
      wrapper1.setAttribute('data-box', '5');
      wrapper1.setAttribute('data-type', 'char');
      wrapper1.appendChild(input1);
      
      const wrapper2 = document.createElement('div');
      wrapper2.setAttribute('data-section', '5');
      wrapper2.setAttribute('data-box', '5');
      wrapper2.setAttribute('data-type', 'char');
      wrapper2.appendChild(input2);
      
      grid1.appendChild(wrapper1);
      grid2.appendChild(wrapper2);
      document.body.appendChild(grid1);
      document.body.appendChild(grid2);

      focusGridBox(5, 5, 'char', 50, 'unique-1');
      vi.runAllTimers();

      expect(input1.focus).toHaveBeenCalled();
      expect(input2.focus).not.toHaveBeenCalled();
    });
  });
});