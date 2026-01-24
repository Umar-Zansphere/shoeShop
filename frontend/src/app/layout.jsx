import './globals.css';

export const metadata = {
  title: 'ShoeShop - Premium Footwear',
  description: 'Discover premium shoes with exclusive collections for men, women, and kids.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FAFAF8]">
        {children}
      </body>
    </html>
  );
}
