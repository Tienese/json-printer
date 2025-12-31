import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
};

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-black text-white',
    outline: 'bg-white text-black',
    ghost: 'bg-transparent border-transparent',
};

/**
 * Unified button component.
 * Always hidden in print output.
 */
export function Button({
    variant = 'outline',
    size = 'md',
    className = '',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`font-bold border-2 border-black inline-flex items-center justify-center print:hidden ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
