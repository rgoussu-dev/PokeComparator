# UI Library

The **UI** library is a shared component library serving as the design system foundation for Pokecomparator. It provides reusable, accessible, and themeable components following atomic design principles.

## Purpose

This library contains all shared UI components used across the microfrontend applications. It ensures:
- **Consistency** - Unified look and feel across all features
- **Reusability** - Components are built once, used everywhere
- **Maintainability** - Single source of truth for UI patterns
- **Accessibility** - ARIA compliance and keyboard navigation
- **Theming** - Light/dark mode support

## Architecture

### Atomic Design Pattern

The UI library follows the **Atomic Design** methodology:

- **Atoms** - Basic building blocks (buttons, inputs, icons)
- **Molecules** - Simple combinations of atoms (searchbar, header)

```
atoms (primitives) → molecules (compositions) → organisms (features)
```

> **Note:** Organisms are implemented in feature modules (remote-catalog, remote-detail, etc.), not in this shared library.

## Directory Structure

```
projects/ui/src/lib/
├── atoms/              # Atomic components
│   ├── button/
│   ├── input/
│   ├── label/
│   ├── icon/
│   ├── box/           # Layout primitives
│   ├── stack/
│   ├── cluster/
│   ├── grid/
│   ├── container/
│   ├── center/
│   ├── cover/
│   ├── frame/
│   ├── imposter/
│   ├── reel/
│   ├── sidebar/
│   └── switcher/
├── molecule/           # Molecular components
│   ├── header/
│   ├── searchbar/
│   ├── paginated-list/
│   └── theme-toggle/
├── services/          # UI-related services
├── types/             # TypeScript types
├── utils/             # Utility functions
└── global-styles.css  # Global theme variables
```

## Atoms

Atoms are the fundamental building blocks of the UI.

### Interactive Atoms

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **button** | Call-to-action elements | Variants (primary, secondary, ghost), sizes, disabled state |
| **input** | Text input fields | Types (text, number, email), validation states, labels |
| **label** | Form labels | Semantic HTML, accessibility |
| **icon** | SVG icons | Sprite-based system, consistent sizing |

### Layout Atoms

Layout atoms provide flexible, composable layout primitives inspired by [Every Layout](https://every-layout.dev/):

| Component | Purpose | CSS Technique |
|-----------|---------|---------------|
| **box** | Generic container with spacing | Padding/margin control |
| **stack** | Vertical layout with consistent spacing | Flexbox gap |
| **cluster** | Horizontal wrapping layout | Flexbox wrap |
| **grid** | CSS Grid layout | Auto-fit columns |
| **container** | Content width container | Max-width, centered |
| **center** | Center content horizontally | Flexbox/Grid centering |
| **cover** | Vertically fill space | Flexbox with `flex: 1` |
| **frame** | Aspect ratio container | Padding-bottom hack |
| **imposter** | Absolute positioning | Position: absolute |
| **reel** | Horizontal scrolling | Overflow-x: auto |
| **sidebar** | Sidebar layout | Flexbox or Grid |
| **switcher** | Responsive layout switch | Flexbox with wrapping |

### Usage Example - Button

```html
<pc-button variant="primary" size="md" (click)="handleClick()">
  Click me
</pc-button>
```

### Usage Example - Stack Layout

```html
<pc-stack spacing="md">
  <h1>Title</h1>
  <p>Some content</p>
  <pc-button>Action</pc-button>
</pc-stack>
```

## Molecules

Molecules are combinations of atoms forming functional UI patterns.

### Available Molecules

| Component | Purpose | Composition |
|-----------|---------|-------------|
| **header** | Application navigation bar | Container + Logo + Nav items |
| **searchbar** | Search input with icon | Input + Icon + Label |
| **paginated-list** | List with pagination controls | Container + Buttons + List |
| **theme-toggle** | Light/dark mode switcher | Button + Icon |

### Usage Example - Header

```typescript
import { HeaderComponent } from '@ui/molecule/header';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent],
  template: `
    <pc-header [title]="'Pokecomparator'">
      <nav>
        <a routerLink="/catalog">Catalog</a>
        <a routerLink="/compare">Compare</a>
      </nav>
    </pc-header>
  `
})
export class AppComponent {}
```

### Usage Example - Searchbar

```typescript
import { SearchbarComponent } from '@ui/molecule/searchbar';

@Component({
  selector: 'app-search',
  imports: [SearchbarComponent],
  template: `
    <pc-searchbar
      placeholder="Search Pokemon..."
      (searchChange)="onSearch($event)"
    />
  `
})
export class SearchComponent {
  onSearch(query: string) {
    console.log('Search:', query);
  }
}
```

## Theming

The UI library supports **light** and **dark** themes using CSS custom properties.

### Theme Variables

Defined in `global-styles.css`:

```css
:root {
  --color-primary: #3b82f6;
  --color-background: #ffffff;
  --color-text: #1f2937;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}

[data-theme="dark"] {
  --color-background: #1f2937;
  --color-text: #f9fafb;
}
```

### Using Theme Variables

```css
.my-component {
  background-color: var(--color-background);
  color: var(--color-text);
  padding: var(--spacing-md);
}
```

### Switching Themes

Use the `theme-toggle` molecule:

```html
<pc-theme-toggle />
```

Or programmatically:

```typescript
document.documentElement.setAttribute('data-theme', 'dark');
```

## Storybook

The UI library uses **Storybook** for component development and documentation.

### Running Storybook

```bash
ng run ui:storybook
```

This will start Storybook at `http://localhost:6006`.

### Building Storybook

```bash
ng run ui:build-storybook
```

### Writing Stories

Each component should have a corresponding `.stories.ts` file:

```typescript
// button.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button';

const meta: Meta<ButtonComponent> = {
  title: 'Atoms/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me'
  }
};
```

## Usage in Applications

### Importing Components

```typescript
import { ButtonComponent } from '@ui/atoms/button';
import { HeaderComponent } from '@ui/molecule/header';

@Component({
  selector: 'app-my-feature',
  imports: [ButtonComponent, HeaderComponent],
  template: `...`
})
export class MyFeatureComponent {}
```

### Path Alias

Components can be imported using the `@ui` path alias (configured in `tsconfig.json`):

```typescript
import { ButtonComponent } from '@ui/atoms/button/button';
import { StackComponent } from '@ui/atoms/stack/stack';
```

## Adding New Components

### Creating an Atom

```bash
ng generate component atoms/my-atom --project=ui --export
```

### Creating a Molecule

```bash
ng generate component molecule/my-molecule --project=ui --export
```

### Component Conventions

1. **File naming**: `component-name.ts`, `component-name.css`, `component-name.spec.ts`
2. **Selector prefix**: `pc-` (e.g., `pc-button`, `pc-header`)
3. **Standalone**: All components should be standalone
4. **Accessibility**: Include ARIA attributes where needed
5. **Documentation**: Add JSDoc comments
6. **Storybook**: Create a `.stories.ts` file
7. **Tests**: Write unit tests for component logic

### Example Component Structure

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * A reusable button component
 * 
 * @example
 * <pc-button variant="primary" (click)="handleClick()">
 *   Click me
 * </pc-button>
 */
@Component({
  selector: 'pc-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrls: ['./button.css']
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  
  @Output() clicked = new EventEmitter<void>();
  
  onClick() {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
```

## Building

To build the library:

```bash
ng build ui
```

Build artifacts will be placed in `dist/ui/`.

## Testing

Run unit tests:

```bash
ng test ui
```

**Testing Guidelines:**
- Test component inputs and outputs
- Test conditional rendering
- Test accessibility (ARIA attributes)
- Use Testing Library patterns when possible

## Design Tokens

Future enhancement: Extract CSS variables into a design tokens system (Style Dictionary or similar).

## Related Documentation

- [Storybook](https://storybook.js.org/) - Component documentation
- [Every Layout](https://every-layout.dev/) - Layout primitives inspiration
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) - Methodology
- [Angular Component Guide](https://angular.dev/guide/components)
