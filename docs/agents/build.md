# Build Mode 🔨

This context file provides guidance for coding agents when building components, generating code, or implementing features in the Pokecomparator project.

## When to Use This Context

Load this context when:
- Generating new components, services, or modules
- Building features or implementing user stories
- Creating or modifying UI components
- Implementing domain logic or adapters
- Scaffolding new microfrontends or libraries

## Project Architecture Quick Reference

### Hexagonal Architecture Layers

```
┌─────────────────────────────────────────────────┐
│           UI Layer (Microfrontends)             │
│  host, remote-catalog, remote-detail,           │
│  remote-compare, ui library                     │
└──────────────────┬──────────────────────────────┘
                   │ depends on
                   ▼
┌─────────────────────────────────────────────────┐
│            Domain Layer (Core)                  │
│  - Services (business logic)                    │
│  - Models (domain entities)                     │
│  - Ports (interfaces/contracts)                 │
└──────────────────┬──────────────────────────────┘
                   │ implemented by
                   ▼
┌─────────────────────────────────────────────────┐
│         Infrastructure Layer (Adapters)         │
│  - PokeAPI adapters                             │
│  - External service implementations             │
└─────────────────────────────────────────────────┘
```

**Key Rule**: Dependencies flow inward. Domain NEVER imports from Infra or UI.

## Component Generation Guidelines

### Using Angular CLI

**Always use Angular CLI** to generate components, services, and modules:

```bash
# Generate component in a project
ng generate component <path> --project=<project-name>

# Generate service
ng generate service <path> --project=<project-name>

# Generate module
ng generate module <path> --project=<project-name>

# Examples
ng generate component catalog/components/pokemon-card --project=remote-catalog
ng generate service domain/services/pokemon-stats --project=domain
```

### Component Structure Standards

#### UI Library Components (atoms/molecules)

Location: `projects/ui/src/lib/atoms/` or `projects/ui/src/lib/molecule/`

```typescript
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

/**
 * Button component for user interactions.
 *
 * @description
 * A reusable button component that supports multiple variants, sizes,
 * and states. Follows accessibility best practices.
 *
 * @example
 * Basic usage:
 * ```html
 * <pc-button variant="primary" (clicked)="handleClick()">
 *   Click me
 * </pc-button>
 * ```
 *
 * @usageNotes
 * - Use 'primary' variant for main call-to-action buttons
 * - Always provide aria-label when button content is not descriptive
 *
 * @publicApi
 */
@Component({
  selector: 'pc-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  /** Button text or content */
  variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  
  /** Whether the button is disabled */
  disabled = input<boolean>(false);
  
  /** Click event emitter */
  clicked = output<void>();
  
  handleClick(): void {
    this.clicked.emit();
  }
}
```

**Template Pattern:**
```html
<button
  [attr.data-variant]="variant()"
  [disabled]="disabled()"
  (click)="handleClick()"
  class="pc-button">
  <ng-content></ng-content>
</button>
```

**Styling Pattern:**
```css
:host {
  display: inline-block;
}

.pc-button {
  /* Base styles */
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-family);
  transition: all 0.2s ease;
}

.pc-button[data-variant="primary"] {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.pc-button[data-variant="secondary"] {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
}

.pc-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Feature Components (in microfrontends)

Location: `projects/remote-*/src/app/*/components/`

```typescript
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { PokemonCatalogService } from '@domain/services';
import { PokemonSummary } from '@domain/models';

/**
 * Pokemon catalog display component.
 *
 * @description
 * Displays a paginated list of Pokemon with search functionality.
 * Integrates with the domain service for data fetching.
 */
@Component({
  selector: 'poke-catalog',
  standalone: true,
  imports: [/* UI components */],
  templateUrl: './poke-catalog.component.html',
  styleUrl: './poke-catalog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokeCatalogComponent {
  private catalogService = inject(PokemonCatalogService);
  
  // State using signals
  pokemonList = signal<PokemonSummary[]>([]);
  isLoading = signal<boolean>(false);
  currentPage = signal<number>(1);
  
  ngOnInit(): void {
    this.loadPokemon();
  }
  
  loadPokemon(): void {
    this.isLoading.set(true);
    this.catalogService.getPokemonList(this.currentPage())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.pokemonList.set(page.results);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load Pokemon:', err);
          this.isLoading.set(false);
        }
      });
  }
}
```

### Service Generation Guidelines

#### Domain Services

Location: `projects/domain/src/lib/services/`

**Pattern:**
```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PokemonRepository } from '../ports/pokemon-repository';
import { PokemonSummary, PokemonPage } from '../models';

/**
 * Service for managing Pokemon catalog operations.
 *
 * @description
 * Provides business logic for retrieving and managing Pokemon listings.
 * Acts as a use case layer between UI and data repositories.
 *
 * @publicApi
 */
@Injectable({
  providedIn: 'root'
})
export class PokemonCatalogService {
  private repository = inject(PokemonRepository);
  
  /**
   * Retrieves a paginated list of Pokemon.
   *
   * @param page - The page number to retrieve (1-indexed)
   * @param limit - Number of items per page (default: 20)
   * @returns Observable of PokemonPage containing results
   *
   * @example
   * ```typescript
   * catalogService.getPokemonList(1, 20).subscribe(page => {
   *   console.log(page.results); // Array of PokemonSummary
   * });
   * ```
   */
  getPokemonList(page: number = 1, limit: number = 20): Observable<PokemonPage> {
    return this.repository.getPokemonList(page, limit);
  }
}
```

#### Infrastructure Adapters

Location: `projects/infra/src/lib/adapters/`

**Pattern:**
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PokemonRepository } from '@domain/ports';
import { PokemonPage, PokemonSummary } from '@domain/models';

/**
 * PokeAPI adapter implementing PokemonRepository port.
 *
 * @description
 * Adapter for fetching Pokemon data from the PokeAPI service.
 * Maps external API responses to internal domain models.
 */
@Injectable({
  providedIn: 'root'
})
export class PokeApiAdapter implements PokemonRepository {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  
  getPokemonList(page: number, limit: number): Observable<PokemonPage> {
    const offset = (page - 1) * limit;
    return this.http.get<PokeApiListResponse>(
      `${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`
    ).pipe(
      map(response => this.mapToPokeManPage(response))
    );
  }
  
  private mapToPokemonPage(response: PokeApiListResponse): PokemonPage {
    return {
      results: response.results.map(item => this.mapToPokemonSummary(item)),
      total: response.count,
      page: Math.floor(response.offset / response.limit) + 1
    };
  }
}
```

## Building New Features - Step by Step

### 1. Define Domain Model (if needed)

Location: `projects/domain/src/lib/models/`

```typescript
/**
 * Represents a Pokemon's statistical attributes.
 *
 * @publicApi
 */
export interface PokemonStats {
  /** Hit points - determines Pokemon's health */
  hp: number;
  
  /** Physical attack power */
  attack: number;
  
  /** Physical defense capability */
  defense: number;
  
  /** Special attack power */
  specialAttack: number;
  
  /** Special defense capability */
  specialDefense: number;
  
  /** Speed - determines turn order in battles */
  speed: number;
}
```

### 2. Define Port (if external data needed)

Location: `projects/domain/src/lib/ports/`

```typescript
import { Observable } from 'rxjs';
import { PokemonStats } from '../models';

/**
 * Port for accessing Pokemon statistics data.
 *
 * @description
 * Interface defining the contract for retrieving Pokemon stats.
 * Must be implemented by infrastructure adapters.
 *
 * @publicApi
 */
export abstract class PokemonStatsRepository {
  /**
   * Retrieves statistics for a specific Pokemon.
   *
   * @param pokemonId - The unique identifier of the Pokemon
   * @returns Observable of PokemonStats
   */
  abstract getStats(pokemonId: number): Observable<PokemonStats>;
}
```

### 3. Implement Adapter (if port defined)

Location: `projects/infra/src/lib/adapters/`

```typescript
@Injectable({
  providedIn: 'root'
})
export class PokeApiStatsAdapter implements PokemonStatsRepository {
  private http = inject(HttpClient);
  
  getStats(pokemonId: number): Observable<PokemonStats> {
    return this.http.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
      .pipe(
        map(response => this.mapToStats(response))
      );
  }
  
  private mapToStats(apiResponse: any): PokemonStats {
    // Mapping logic
  }
}
```

### 4. Provide Adapter in Application

Location: `projects/host/src/app/app.config.ts` or module providers

```typescript
import { ApplicationConfig } from '@angular/core';
import { PokemonStatsRepository } from '@domain/ports';
import { PokeApiStatsAdapter } from '@infra/adapters';

export const appConfig: ApplicationConfig = {
  providers: [
    // Other providers...
    { provide: PokemonStatsRepository, useClass: PokeApiStatsAdapter }
  ]
};
```

### 5. Create Domain Service

Location: `projects/domain/src/lib/services/`

```typescript
@Injectable({
  providedIn: 'root'
})
export class PokemonStatsService {
  private repository = inject(PokemonStatsRepository);
  
  getStats(pokemonId: number): Observable<PokemonStats> {
    return this.repository.getStats(pokemonId);
  }
  
  compareStats(pokemon1Id: number, pokemon2Id: number): Observable<StatsComparison> {
    // Business logic for comparison
  }
}
```

### 6. Build UI Component

Location: Appropriate microfrontend

```typescript
@Component({
  selector: 'poke-stats-display',
  standalone: true,
  imports: [/* UI library components */],
  templateUrl: './stats-display.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsDisplayComponent {
  private statsService = inject(PokemonStatsService);
  
  pokemonId = input.required<number>();
  stats = signal<PokemonStats | null>(null);
  
  ngOnInit(): void {
    this.loadStats();
  }
  
  private loadStats(): void {
    this.statsService.getStats(this.pokemonId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(stats => this.stats.set(stats));
  }
}
```

## Code Templates and Patterns

### Standalone Component Template

```typescript
import { Component, ChangeDetectionStrategy, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {
  // Inputs using signals
  data = input.required<DataType>();
  config = input<ConfigType>();
  
  // Outputs
  itemSelected = output<ItemType>();
  
  // Internal state
  selectedItem = signal<ItemType | null>(null);
  
  // Computed values
  filteredItems = computed(() => {
    // Computation based on signals
  });
  
  onItemClick(item: ItemType): void {
    this.selectedItem.set(item);
    this.itemSelected.emit(item);
  }
}
```

### Service with HTTP Template

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://api.example.com';
  
  getData(): Observable<DataType> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/data`).pipe(
      map(response => this.mapToDataType(response)),
      retry(2),
      catchError(this.handleError)
    );
  }
  
  private mapToDataType(response: ApiResponse): DataType {
    // Mapping logic
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error('Failed to fetch data'));
  }
}
```

### Form Component Template

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html'
})
export class FormComponent {
  private fb = inject(FormBuilder);
  
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    age: [null, [Validators.min(0), Validators.max(150)]]
  });
  
  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      // Process form
    }
  }
}
```

## UI Library Component Checklist

When building UI library components:

- [ ] Component is standalone
- [ ] Uses OnPush change detection
- [ ] Uses signal inputs/outputs
- [ ] Has comprehensive JSDoc documentation
- [ ] Includes usage examples in JSDoc
- [ ] Has proper accessibility attributes (ARIA labels, roles)
- [ ] Supports keyboard navigation where applicable
- [ ] Has associated Storybook story
- [ ] Follows naming convention (`pc-` prefix for selectors)
- [ ] Uses CSS custom properties for theming
- [ ] Handles edge cases (empty state, loading, errors)
- [ ] Is responsive and mobile-friendly

## Microfrontend Module Federation Setup

### Exposing a Module

In `projects/remote-*/webpack.config.js`:

```javascript
module.exports = withModuleFederationPlugin({
  name: 'remoteCatalog',
  exposes: {
    './Module': './projects/remote-catalog/src/app/catalog/catalog.module.ts',
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true },
    '@angular/router': { singleton: true, strictVersion: true },
    'rxjs': { singleton: true, strictVersion: true }
  }
});
```

### Loading a Remote in Host

In `projects/host/src/app/app.routes.ts`:

```typescript
import { loadRemoteModule } from '@angular-architects/module-federation';

export const routes: Routes = [
  {
    path: 'catalog',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './Module'
      }).then(m => m.CatalogModule)
  }
];
```

## Styling Guidelines

### Using CSS Custom Properties

```css
/* Use existing design tokens */
.component {
  /* Colors */
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  
  /* Spacing */
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-2);
  
  /* Typography */
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  
  /* Border radius */
  border-radius: var(--radius-md);
  
  /* Shadows */
  box-shadow: var(--shadow-sm);
}
```

### Theme Support

Components should respond to theme changes automatically through CSS custom properties:

```css
/* No theme-specific overrides needed if using custom properties */
.button {
  background-color: var(--color-primary); /* Automatically switches with theme */
}
```

## Testing Your Components

### Unit Test Template

```typescript
import { TestBed } from '@angular/core/testing';
import { ExampleComponent } from './example.component';

describe('ExampleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleComponent]
    }).compileComponents();
  });
  
  it('should create', () => {
    const fixture = TestBed.createComponent(ExampleComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
  
  it('should emit event when item is clicked', () => {
    const fixture = TestBed.createComponent(ExampleComponent);
    const component = fixture.componentInstance;
    
    let emittedItem: any;
    component.itemSelected.subscribe((item: any) => emittedItem = item);
    
    const testItem = { id: 1, name: 'Test' };
    component.onItemClick(testItem);
    
    expect(emittedItem).toEqual(testItem);
  });
});
```

## Build Commands Reference

```bash
# Run all microfrontends in development
npm run run:all

# Build all projects
npm run build

# Build specific project
ng build <project-name>

# Serve specific project
ng serve <project-name>

# Run tests
npm test

# Run lint
npm run lint

# Run Storybook (UI library)
ng run ui:storybook
```

## Common Gotchas and Solutions

### Problem: Domain layer importing from Infra

❌ **Wrong:**
```typescript
// In domain service
import { PokeApiAdapter } from '@infra/adapters';
```

✅ **Correct:**
```typescript
// In domain service - use ports
import { PokemonRepository } from '../ports';

// In app config - provide implementation
{ provide: PokemonRepository, useClass: PokeApiAdapter }
```

### Problem: Circular dependencies

❌ **Wrong:**
```typescript
// service-a.ts
import { ServiceB } from './service-b';

// service-b.ts
import { ServiceA } from './service-a';
```

✅ **Solution:**
- Extract shared logic to a third service
- Use events/observables for communication
- Reconsider architecture - might indicate design issue

### Problem: Memory leaks from subscriptions

❌ **Wrong:**
```typescript
ngOnInit() {
  this.service.getData().subscribe(data => this.data = data);
}
```

✅ **Correct:**
```typescript
// Option 1: async pipe (preferred)
data$ = this.service.getData();

// Option 2: takeUntilDestroyed
private destroyRef = inject(DestroyRef);

ngOnInit() {
  this.service.getData()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(data => this.data = data);
}
```

## Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular CLI Documentation](https://angular.io/cli)
- [Module Federation](https://www.angulararchitects.io/en/blog/the-microfrontend-revolution-part-2-module-federation-with-angular/)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
