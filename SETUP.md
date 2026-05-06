# ResumeRX - Installation & Setup Guide

## Prerequisites

Make sure you have **Node.js** installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

## Installation Steps

### 1. Install pnpm (if not already installed)

This project uses **pnpm** instead of npm. Install it globally:

```bash
npm install -g pnpm
```

Or if you use Homebrew (macOS):

```bash
brew install pnpm
```

### 2. Clone or Download the Project

If you have the project files, navigate to the project directory:

```bash
cd resumerx
```

### 3. Install Dependencies

Use pnpm to install all project dependencies:

```bash
pnpm install
```

This will read the `pnpm-lock.yaml` file and install exact versions of all packages.

### 4. Start the Development Server

Run the development server:

```bash
pnpm run dev
```

The application will start on `http://localhost:3000`

### 5. Build for Production

To create a production build:

```bash
pnpm run build
```

### 6. Preview Production Build

To preview the production build locally:

```bash
pnpm run preview
```

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server with hot reload |
| `pnpm run build` | Build for production |
| `pnpm run preview` | Preview production build locally |
| `pnpm run check` | Run TypeScript type checking |
| `pnpm run format` | Format code with Prettier |

## Troubleshooting

### Issue: "pnpm: command not found"

**Solution:** Make sure pnpm is installed globally:

```bash
npm install -g pnpm
```

### Issue: Port 3000 already in use

**Solution:** Kill the process using port 3000 or specify a different port:

```bash
pnpm run dev -- --port 3001
```

### Issue: Dependencies not installing

**Solution:** Clear pnpm cache and try again:

```bash
pnpm store prune
pnpm install
```

## Project Structure

```
resumerx/
├── client/
│   ├── public/          # Static files (favicon, robots.txt)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   ├── types/       # TypeScript type definitions
│   │   ├── App.tsx      # Main app component with routing
│   │   ├── main.tsx     # React entry point
│   │   └── index.css    # Global styles & design tokens
│   └── index.html       # HTML template
├── server/              # Backend placeholder (not used in static build)
├── package.json         # Project dependencies
├── pnpm-lock.yaml       # Locked dependency versions
└── tailwind.config.ts   # Tailwind CSS configuration
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Wouter** - Client-side routing
- **shadcn/ui** - Pre-built UI components
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## Browser Support

The application works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Next Steps

1. **Customize the design** - Edit `client/src/index.css` to change colors and typography
2. **Add features** - Create new pages in `client/src/pages/`
3. **Modify components** - Update existing components in `client/src/components/`
4. **Deploy** - Build and deploy to your preferred hosting platform

## Support

For issues or questions, refer to the documentation:
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Wouter Documentation](https://github.com/molefrog/wouter)
- [shadcn/ui Documentation](https://ui.shadcn.com)
