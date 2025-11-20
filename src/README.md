# LetsRide Source Code Structure

This directory contains all the source code for the LetsRide mobile application.

## Directory Structure

```
/src
├── /components          # Reusable UI components
│   ├── /common         # Shared components (Button, Avatar, Card, etc.)
│   ├── /events         # Event-specific components
│   ├── /social         # Social/friend components
│   └── /messaging      # Chat components
├── /screens            # Screen components
│   ├── /auth           # Authentication screens
│   ├── /events         # Events tab screens
│   ├── /people         # People tab screens
│   ├── /chats          # Chats tab screens
│   └── /profile        # Profile/Me tab screens
├── /navigation         # Navigation configuration
├── /stores             # Zustand state stores
├── /services           # Business logic and API calls
│   ├── /firebase       # Firebase configuration and utilities
│   ├── /events         # Event-related services
│   ├── /messaging      # Messaging services
│   └── /social         # Social/friend services
├── /hooks              # Custom React hooks
├── /utils              # Helper functions and utilities
├── /types              # TypeScript type definitions
├── /constants          # App constants and configs
└── /theme              # Styling constants (colors, fonts, spacing)
```

## Import Aliases

Use the `@/` prefix to import from the `src` directory:

```typescript
// Instead of: import { colors } from '../../../theme/colors'
import { colors } from '@/theme';

// Instead of: import { User } from '../../types/models'
import { User } from '@/types';
```

## Key Concepts

### Components
- **Common**: Reusable UI building blocks used throughout the app
- **Feature-specific**: Components tied to specific features (events, messaging, etc.)

### Screens
- Each screen represents a full-page view in the app
- Screens use components and connect to stores

### Stores (Zustand)
- Global state management using Zustand
- Each store manages a specific domain (auth, events, chats, etc.)
- Use selectors to prevent unnecessary re-renders

### Services
- Business logic and API calls
- Firebase interactions
- Data transformation and validation

### Navigation
- React Navigation configuration
- Stack, Tab, and Modal navigators
- Type-safe navigation with TypeScript

### Theme
- Centralized styling constants
- Colors, typography, spacing, shadows
- Ensures consistent design across the app

## Development Guidelines

1. **Use TypeScript**: All files should be `.ts` or `.tsx`
2. **Path aliases**: Always use `@/` imports for cleaner code
3. **Component naming**: PascalCase for components (e.g., `UserProfile.tsx`)
4. **File naming**: camelCase for utilities (e.g., `formatDate.ts`)
5. **Exports**: Use barrel exports (`index.ts`) for cleaner imports
6. **Types**: Define types in `/types` and import where needed

## Getting Started

Follow the Implementation Plan in `/docs/Implementation Plan.md` for step-by-step development guidance.

