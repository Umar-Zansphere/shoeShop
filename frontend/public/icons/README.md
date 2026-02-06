# PWA Icons

This directory should contain the following icon files for PWA support:

## Required Icons

1. **icon-192x192.png** (192x192 pixels)
   - Standard Android icon
   - Used for home screen and app drawer

2. **icon-512x512.png** (512x512 pixels)
   - High-resolution Android icon
   - Used for splash screens and larger displays

3. **apple-touch-icon.png** (180x180 pixels)
   - iOS home screen icon
   - Place in the root `/public` directory

4. **favicon.ico**
   - Browser favicon
   - Place in the root `/public` directory

## Design Guidelines

- **Background**: Use the brand color #FF6B6B (coral-red) with a gradient to #FF8585
- **Icon**: Feature a stylized shoe silhouette or footprint in white/cream
- **Style**: Modern, flat design with subtle shadows
- **Format**: PNG with transparency for app icons, ICO for favicon
- **Safe area**: Keep important elements within 80% of the icon area (avoid edges)

## Tools for Icon Generation

You can use these tools to generate icons:
- [Favicon.io](https://favicon.io/) - Generate favicons from text, image, or emoji
- [PWA Asset Generator](https://www.npmjs.com/package/pwa-asset-generator) - CLI tool to generate all PWA assets
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Comprehensive favicon generator

## Quick Generation with CLI

```bash
# Install pwa-asset-generator globally
npm install -g pwa-asset-generator

# Generate all icons from a source image (1024x1024 recommended)
pwa-asset-generator source-logo.png ./public/icons --icon-only --background "#FF6B6B"
```

## Temporary Placeholder

For now, you can use a simple colored square as a placeholder until you have proper branding assets.
