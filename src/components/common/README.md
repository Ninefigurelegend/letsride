# Common UI Components

A collection of reusable UI components for LetsRide that follow the established design system.

## Components

### Button

A versatile button component with multiple variants, sizes, and states.

**Props:**
- `title` (string, required): Button text
- `onPress` (function, required): Callback when pressed
- `variant` ('primary' | 'secondary' | 'outline' | 'ghost', default: 'primary'): Button style variant
- `size` ('sm' | 'md' | 'lg', default: 'md'): Button size
- `isLoading` (boolean, default: false): Show loading spinner
- `disabled` (boolean, default: false): Disable button
- `style` (ViewStyle): Custom container styles
- `textStyle` (TextStyle): Custom text styles

**Usage:**
```tsx
import { Button } from '@/components/common';

// Primary button (default)
<Button title="Sign In" onPress={handleSignIn} />

// Secondary button
<Button 
  title="Cancel" 
  onPress={handleCancel} 
  variant="secondary" 
/>

// Outline button with loading state
<Button 
  title="Save" 
  onPress={handleSave}
  variant="outline"
  isLoading={isSaving}
/>

// Large ghost button
<Button 
  title="Learn More" 
  onPress={handleLearnMore}
  variant="ghost"
  size="lg"
/>
```

---

### Avatar

A user avatar component that displays profile images or initials with optional online status.

**Props:**
- `name` (string, required): User's name (used for initials fallback)
- `uri` (string): Image URL
- `size` (number, default: 40): Avatar diameter in pixels
- `showOnlineStatus` (boolean, default: false): Show online/offline indicator
- `isOnline` (boolean, default: false): Online status
- `style` (ViewStyle): Custom container styles

**Usage:**
```tsx
import { Avatar } from '@/components/common';

// Avatar with image
<Avatar 
  name="John Doe" 
  uri="https://example.com/avatar.jpg"
  size={50}
/>

// Avatar with initials fallback
<Avatar 
  name="Jane Smith" 
  size={60}
/>

// Avatar with online status
<Avatar 
  name="Mike Johnson" 
  uri="https://example.com/avatar.jpg"
  showOnlineStatus
  isOnline={true}
  size={40}
/>

// Large avatar for profile screens
<Avatar 
  name="Sarah Williams" 
  uri={userProfile.avatarUrl}
  size={120}
/>
```

---

### Card

A container component with elevation and consistent styling.

**Props:**
- `children` (ReactNode, required): Card content
- `elevated` (boolean, default: true): Apply shadow elevation
- `padding` (keyof typeof spacing, default: 'md'): Padding size ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl')
- `style` (ViewStyle): Custom container styles

**Usage:**
```tsx
import { Card } from '@/components/common';

// Default card
<Card>
  <Text>Card content goes here</Text>
</Card>

// Card without elevation
<Card elevated={false}>
  <Text>Flat card</Text>
</Card>

// Card with custom padding
<Card padding="lg">
  <Text>Large padding</Text>
</Card>

// Card with custom styles
<Card style={{ marginBottom: 16 }}>
  <View>
    <Text style={styles.title}>Event Title</Text>
    <Text style={styles.description}>Event description</Text>
  </View>
</Card>

// Card with no padding (full control)
<Card padding="xs">
  <Image source={{ uri: eventImage }} style={styles.image} />
  <View style={{ padding: 16 }}>
    <Text>Content with custom padding</Text>
  </View>
</Card>
```

---

### Input

A text input component with label, error handling, and customizable left/right elements.

**Props:**
- `label` (string): Input label
- `error` (string): Error message
- `helperText` (string): Helper text below input
- `leftElement` (ReactNode): Element to display on the left (e.g., icons, @ symbol)
- `rightElement` (ReactNode): Element to display on the right (e.g., checkmarks, loading indicators)
- `containerStyle` (ViewStyle): Custom container styles
- Plus all standard TextInput props

**Usage:**
```tsx
import { Input } from '@/components/common';
import { Ionicons } from '@expo/vector-icons';

// Basic input
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
  keyboardType="email-address"
/>

// Input with error
<Input
  label="Password"
  value={password}
  onChangeText={setPassword}
  placeholder="Enter password"
  secureTextEntry
  error={passwordError}
/>

// Input with left element (@ symbol)
<Input
  label="Handle"
  value={handle}
  onChangeText={setHandle}
  placeholder="username"
  leftElement={<Text style={{ color: colors.primary }}>@</Text>}
  helperText="3-15 characters"
/>

// Input with right element (validation checkmark)
<Input
  label="Username"
  value={username}
  onChangeText={setUsername}
  rightElement={
    isValid && <Ionicons name="checkmark-circle" size={20} color={colors.success} />
  }
/>

// Input with loading indicator
<Input
  label="Search"
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search users..."
  leftElement={<Ionicons name="search" size={20} color={colors.gray400} />}
  rightElement={
    isSearching && <ActivityIndicator size="small" color={colors.primary} />
  }
/>
```

---

## Design System

All components use the centralized theme system from `/src/theme`:

- **Colors**: `colors.primary`, `colors.secondary`, `colors.textPrimary`, etc.
- **Typography**: `typography.fontSize`, `typography.fontWeight`, `typography.lineHeight`
- **Spacing**: `spacing.xs`, `spacing.sm`, `spacing.md`, etc.
- **Shadows**: `shadows.sm`, `shadows.md`, `shadows.lg`, `shadows.xl`
- **Border Radius**: Consistent 12px radius across components

## Best Practices

1. **Consistency**: Always use these common components instead of creating custom implementations
2. **Theme**: Use theme constants for colors, spacing, and typography
3. **TypeScript**: All props are strongly typed for safety
4. **Accessibility**: Add accessibility labels where appropriate
5. **Reusability**: Prefer composition over creating new components

## Adding New Common Components

When adding new common components:

1. Create component file in `/src/components/common/`
2. Follow naming convention: PascalCase (e.g., `MyComponent.tsx`)
3. Use TypeScript with proper prop types
4. Follow theme system for styling
5. Add component to `/src/components/common/index.ts`
6. Document usage in this README
7. Update Implementation Plan documentation

