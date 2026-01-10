# Coding Style Guide - Phonon UI

## TypeScript

### Naming Conventions
- Components: `PascalCase` (e.g., `ChatWidget`, `MarkdownRenderer`)
- Hooks: `camelCase` with `use` prefix (e.g., `useChat`, `useWebLLM`)
- Utils: `camelCase` (e.g., `parseCommand`, `formatMessage`)
- Types: `PascalCase` (e.g., `Message`, `ThemeConfig`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `PHI_RATIO`, `DEFAULT_THEME`)

### File Structure
```typescript
// 1. Imports (external first, then internal)
import { useState } from 'react';
import { cn } from '../utils';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Constants
const PHI = 1.618;

// 4. Component/Hook
export function Component({ prop }: Props) {
  // ...
}

// 5. Helper functions (if not exported)
function helper() {
  // ...
}
```

### Exports
- Named exports for everything
- Re-export from index.ts for public API
- No default exports

## React Patterns

### Hooks
- Extract complex logic into custom hooks
- Keep hooks focused on single responsibility
- Return object with named properties (not array)

```typescript
// Good
const { messages, sendMessage, isLoading } = useChat();

// Avoid
const [messages, sendMessage, isLoading] = useChat();
```

### Components
- Functional components only
- Props interface defined above component
- Use `cn()` for conditional classes

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children }: ButtonProps) {
  return (
    <button className={cn(
      'phonon-btn',
      variant === 'primary' && 'phonon-btn-primary'
    )}>
      {children}
    </button>
  );
}
```

## CSS/Tailwind

### Class Naming
- Prefix custom classes with `phonon-`
- Use CSS variables for theming
- PHI-based spacing: `space-phi-{xs|sm|md|lg|xl}`

### Variables
```css
--phonon-{property}-{variant}

/* Examples */
--phonon-bg-primary
--phonon-text-muted
--phonon-space-lg
```

## Testing
- Test files next to source: `Component.test.tsx`
- Use React Testing Library
- Test behavior, not implementation
