import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../src/app/components/ui/Button'; // Adjust import path as needed

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-black');
    expect(button).toHaveClass('text-white');
  });

  it('applies specific variant styles', () => {
    render(<Button variant="accent">Accent</Button>);
    const button = screen.getByRole('button');
    // Using a regex or partial match since tailwind classes can be long
    expect(button.className).toContain('bg-[var(--accent)]');
  });

  it('shows loading spinner and disables button when isLoading is true', () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    // Check if the spinner div exists (based on class in your component)
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(button).not.toHaveTextContent('Submit');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});