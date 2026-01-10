# Contributing to Phonon UI

Thank you for your interest in contributing to Phonon UI! This document provides guidelines for contributing.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/Alemusica/phonon-ui.git
cd phonon-ui

# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build the library
bun run build:lib
```

## Project Structure

```
phonon-ui/
├── src/
│   ├── core/           # Hooks and utilities
│   │   ├── streaming-parser.ts
│   │   ├── use-chat.ts
│   │   ├── use-webllm.ts
│   │   ├── use-typewriter.ts
│   │   └── utils.ts
│   ├── components/     # React components
│   │   ├── Typography.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   ├── Typewriter.tsx
│   │   └── ChatWidget.tsx
│   ├── themes/         # Theme definitions
│   └── styles/         # CSS/Tailwind styles
├── stories/            # Storybook stories
└── examples/           # Example apps
```

## Code Style

- Use TypeScript strict mode
- Follow React hooks best practices
- Use Tailwind CSS for styling
- Write JSDoc comments for public APIs

## Commit Convention

We use conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
