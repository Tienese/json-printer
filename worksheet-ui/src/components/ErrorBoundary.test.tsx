import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Normal rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders multiple children without error', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('catches and displays error when child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/The application encountered an unexpected error/)).toBeInTheDocument();
    });

    it('displays error message in error display', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
    });

    it('logs error to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('shows reload button when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /Reload Application/i });
      expect(reloadButton).toBeInTheDocument();
    });

    it('has correct styling on reload button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /Reload Application/i });
      expect(reloadButton).toHaveClass('bg-primary-blue');
      expect(reloadButton).toHaveClass('text-white');
      expect(reloadButton).not.toHaveClass('hover:bg-blue-700'); // Removed in the change
    });
  });

  describe('Custom fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('uses default fallback when custom fallback not provided', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error UI elements', () => {
    it('displays error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const icon = screen.getByRole('button').parentElement?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders with correct theme classes', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const container = screen.getByText('Something went wrong').closest('div');
      expect(container).toHaveClass('theme-surface');
    });

    it('displays error in scrollable container', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorDisplay = screen.getByText(/Error: Test error/).parentElement;
      expect(errorDisplay).toHaveClass('overflow-auto');
      expect(errorDisplay).toHaveClass('max-h-32');
    });
  });

  describe('Reload functionality', () => {
    it('reload button triggers page reload', () => {
      const reloadSpy = vi.fn();
      Object.defineProperty(globalThis, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /Reload Application/i });
      reloadButton.click();

      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  describe('State management', () => {
    it('maintains error state after catching error', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Rerender with no error - should still show error state
      rerender(
        <ErrorBoundary>
          <div>New content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('New content')).not.toBeInTheDocument();
    });

    it('stores error object in state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
    });
  });

  describe('getDerivedStateFromError', () => {
    it('correctly updates state when error is thrown', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify error state is reflected in UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles error with no message', () => {
      const ThrowEmptyError = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowEmptyError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles nested error boundaries', () => {
      render(
        <ErrorBoundary>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders null children without error', () => {
      render(
        <ErrorBoundary>
          {null}
        </ErrorBoundary>
      );

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('reload button is focusable', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /Reload Application/i });
      expect(reloadButton).toHaveAttribute('class');
      expect(reloadButton.className).toContain('focus:outline-none');
      expect(reloadButton.className).toContain('focus:ring-2');
    });

    it('error message is readable', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const heading = screen.getByText('Something went wrong');
      expect(heading.tagName).toBe('H2');
    });
  });
});