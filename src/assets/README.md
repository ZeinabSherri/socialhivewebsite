# Assets Directory

This directory contains all the static assets used throughout the application.

## Directory Structure

```
src/assets/
├── images/          # Image files (png, jpg, svg, etc.)
├── videos/          # Video files (mp4, webm, etc.)
├── icons/           # Icon files (svg, png, etc.)
├── fonts/           # Font files (woff, woff2, ttf, etc.)
├── styles/          # CSS/SCSS style files
├── index.ts         # Main export file for organized imports
└── assets.d.ts      # TypeScript declarations for asset imports
```

## Usage

### Importing Assets

You can import assets in two ways:

1. **Direct import**:
```typescript
import logo from './assets/images/logo.png';
```

2. **Using the organized exports**:
```typescript
import { Images } from './assets';

// Use Images.logo in your component
```

### Adding New Assets

1. Place the asset in the appropriate subdirectory
2. Update the corresponding export object in `index.ts`
3. Use the asset in your components

### Supported File Types

- **Images**: .png, .jpg, .jpeg, .gif, .svg, .webp
- **Videos**: .mp4, .webm
- **Audio**: .mp3, .wav, .ogg
- **Fonts**: .woff, .woff2, .ttf, .otf
- **Styles**: .css, .scss, .sass

## Best Practices

- Use descriptive filenames
- Optimize images before adding them
- Use SVG for icons when possible
- Keep file sizes reasonable
- Organize assets by feature or component when appropriate
