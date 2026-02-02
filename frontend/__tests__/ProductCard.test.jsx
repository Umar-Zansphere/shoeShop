import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../src/app/components/ProductCard';

// Mock Next.js router and navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockProduct = {
  id: 'prod_1',
  name: 'Air Max 90',
  brand: 'Nike',
  category: 'Sneakers',
  variants: [
    { 
      id: 'var_1', 
      price: 1500, 
      images: [{ url: 'http://example.com/shoe.jpg' }] 
    }
  ]
};

describe('ProductCard Component', () => {
  const mockAddToCart = jest.fn();
  const mockToggleLike = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Air Max 90')).toBeInTheDocument();
    expect(screen.getByText('Nike')).toBeInTheDocument();
    // Check price formatting (toFixed(2))
    expect(screen.getByText('₹1500.00')).toBeInTheDocument();
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'http://example.com/shoe.jpg');
    expect(img).toHaveAttribute('alt', 'Air Max 90');
  });

  it('renders correct link to product page', () => {
    render(<ProductCard product={mockProduct} />);
    // Next/Link renders an anchor tag
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/prod_1');
  });

  it('handles "Add to Cart" click', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart} 
      />
    );

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith({
      variantId: 'var_1',
      productId: 'prod_1',
      quantity: 1,
      price: 1500
    });
  });

  it('changes button state to "Added" after adding to cart', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart} 
      />
    );

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    expect(screen.getByText('Added')).toBeInTheDocument();
  });

  it('handles Wishlist toggle', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onToggleLike={mockToggleLike} 
        isLiked={false}
      />
    );

    // There are two buttons, one for cart, one for wishlist (icon)
    // We can find the wishlist button by finding the one containing the SVG or by class logic
    // Usually easier to add an aria-label in the component, but here we can select by valid DOM structure
    // The wishlist button is the second button in the structure provided
    const buttons = screen.getAllByRole('button');
    const wishlistButton = buttons[1];

    fireEvent.click(wishlistButton);

    expect(mockToggleLike).toHaveBeenCalledWith({
      productId: 'prod_1',
      variantId: 'var_1'
    });
  });

  it('renders liked state correctly', () => {
    const { container } = render(
      <ProductCard 
        product={mockProduct} 
        isLiked={true} 
      />
    );

    // Check if the heart icon has the fill color class
    // Note: This relies on implementation details (class names)
    const heartIcon = container.querySelector('.lucide-heart');
    expect(heartIcon).toHaveClass('fill-[#FF6B6B]');
  });
});