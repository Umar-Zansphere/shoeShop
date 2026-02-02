import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../src/app/components/ui/Input'; // Adjust import path
import { Mail } from 'lucide-react';

describe('Input Component', () => {
  it('renders with label correctly', () => {
    render(<Input label="Email Address" placeholder="Enter email" />);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('renders with an icon', () => {
    // We can check if the SVG is rendered within the container
    const { container } = render(<Input icon={Mail} />);
    // lucide-react renders SVGs, so we check for an svg element
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(<Input error="Invalid email format" />);
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toHaveClass('text-(--accent)');
  });

  it('toggles password visibility', () => {
    render(<Input type="password" placeholder="Password" />);
    
    const input = screen.getByPlaceholderText('Password');
    const toggleButton = screen.getByRole('button');

    // Initially type should be password
    expect(input).toHaveAttribute('type', 'password');

    // Click toggle (Show)
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');

    // Click toggle again (Hide)
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('handles user input', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(input.value).toBe('Hello');
  });
});