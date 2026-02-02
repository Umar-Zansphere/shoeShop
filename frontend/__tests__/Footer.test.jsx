import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from '../src/app/components/Footer';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Footer Component', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders footer sections', () => {
    render(<Footer activeTab="home" />);
    
    expect(screen.getByText('SoleMate')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('renders bottom tab bar items', () => {
    render(<Footer activeTab="home" />);
    
    // We can check if specific text labels for the tabs exist (hidden or visible)
    // Or we can rely on the fact that they render icons.
    // The component maps over a config, let's check basic interaction.
    
    // There are buttons in the fixed bottom bar
    // Since they don't have text visible always, we might need to rely on the icons.
    // However, the tab logic relies on the mapping. 
    // Let's assume we click the "Cart" tab (index 2 in the array in your code).
    const buttons = screen.getAllByRole('button');
    // Footer has many buttons (socials?), but the tabs are specifically in the bottom bar.
    // Based on your code, the tabs are the last 5 buttons usually if social links are anchors <a>.
    // Your social links are <a> tags, so the only <button> elements are the tabs in the Footer component provided.
    
    expect(buttons.length).toBe(5);
  });

  it('handles tab switching and navigation', () => {
    render(<Footer activeTab="home" onTabChange={mockOnTabChange} />);
    
    const buttons = screen.getAllByRole('button');
    // Let's click the "Cart" button (3rd button, index 2)
    const cartButton = buttons[2];
    
    fireEvent.click(cartButton);

    expect(mockOnTabChange).toHaveBeenCalledWith('cart');
    expect(mockPush).toHaveBeenCalledWith('/cart');
  });

  it('highlights the active tab', () => {
    render(<Footer activeTab="profile" />);
    
    const buttons = screen.getAllByRole('button');
    const profileButton = buttons[4]; // Last one
    
    // Check if the background div inside has the active class
    // This is checking implementation detail (Tailwind class), which is fragile but effective for UI
    expect(profileButton.innerHTML).toContain('bg-(--text-primary)');
  });
});