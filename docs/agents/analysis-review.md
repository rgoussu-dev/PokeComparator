# Analysis and Code Review Mode 🔎

This context file provides guidance for coding agents when performing analysis and code review tasks on the Pokecomparator project.

## When to Use This Context

Load this context when:
- Analyzing the codebase for patterns, issues, or improvements
- Performing code reviews on pull requests
- Evaluating alternatives for implementation approaches
- Assessing technical debt or architectural decisions
- Reviewing code quality, maintainability, and adherence to standards

## Project Architecture Principles

### Hexagonal Architecture (Ports & Adapters)

The project follows hexagonal architecture with clear separation of concerns:

1. **Domain Layer** (`projects/domain/`)
   - Contains business logic, models, and ports (interfaces)
   - **Must NOT** depend on infrastructure or UI layers
   - All external dependencies must be defined as ports (interfaces)
   - Services contain use cases and business rules

2. **Infrastructure Layer** (`projects/infra/`)
   - Implements domain ports with concrete adapters
   - Currently contains PokeAPI adapters
   - Can be swapped without affecting domain logic

3. **UI Layer** (Microfrontends + UI Library)
   - Consumes domain services through dependency injection
   - Should not contain business logic
   - Focuses on presentation and user interaction

**Critical Review Points:**
- ❌ Domain layer should NEVER import from `infra` or UI projects
- ✅ Dependencies should flow inward (UI → Domain ← Infra)
- ✅ All external data sources should be abstracted behind ports

### Microfrontend Architecture

The application uses Webpack Module Federation with:

- **Host** (`projects/host/`) - Port 4200
  - Shell application with routing and layout
  - Loads remote microfrontends dynamically
  - Provides navigation and theme management

- **Remote Catalog** (`projects/remote-catalog/`) - Port 4201
  - Pokemon listing with search and pagination
  - Exposed module: `CatalogModule`

- **Remote Detail** (`projects/remote-detail/`) - Port 4202
  - Individual Pokemon details with charts
  - Exposed module: `DetailModule`

- **Remote Compare** (`projects/remote-compare/`) - Port 4203
  - Side-by-side Pokemon comparison
  - Exposed module: `CompareModule`

**Critical Review Points:**
- ✅ Remotes should be independently deployable
- ✅ Shared dependencies (Angular, RxJS, domain) should be singleton
- ❌ Avoid tight coupling between remotes
- ✅ Use routing and query params for inter-remote communication

## Code Review Checklist

### Architecture Compliance

- [ ] Does the change respect hexagonal architecture boundaries?
- [ ] Are domain layer dependencies correct (no infra/UI imports)?
- [ ] Are new external dependencies properly abstracted behind ports?
- [ ] If adding to infrastructure, does it implement an existing port?

### Angular Best Practices

- [ ] Are components using signals for reactive state management?
- [ ] Are services provided at the appropriate level (root, component, module)?
- [ ] Are change detection strategies optimized (OnPush where applicable)?
- [ ] Are lifecycle hooks used correctly and cleaned up properly?
- [ ] Are template bindings type-safe?

### Code Quality

- [ ] Is the code following single responsibility principle?
- [ ] Are functions/methods small and focused?
- [ ] Are magic numbers/strings extracted to constants?
- [ ] Is error handling comprehensive and user-friendly?
- [ ] Are edge cases handled?

### TypeScript Best Practices

- [ ] Are types explicitly defined (avoid `any`)?
- [ ] Are interfaces used for contracts?
- [ ] Are enums or string literal types used for constants?
- [ ] Is null/undefined handling explicit?
- [ ] Are generics used appropriately for reusable code?

### Performance Considerations

- [ ] Are observables properly unsubscribed (using takeUntilDestroyed, async pipe)?
- [ ] Is change detection optimized (OnPush strategy)?
- [ ] Are large lists virtualized if needed?
- [ ] Are expensive computations memoized or computed?
- [ ] Are lazy loading and code splitting used appropriately?

### Accessibility

- [ ] Are semantic HTML elements used?
- [ ] Are ARIA labels provided where needed?
- [ ] Is keyboard navigation supported?
- [ ] Are color contrasts sufficient?
- [ ] Are focus states visible?

### Testing

- [ ] Are unit tests included for new functionality?
- [ ] Do tests follow existing patterns in the codebase?
- [ ] Are edge cases covered?
- [ ] Are mocks used appropriately?
- [ ] Is test coverage maintained or improved?

### Documentation

- [ ] Are JSDoc comments comprehensive and following project standards?
- [ ] Are complex algorithms or business logic explained?
- [ ] Are public APIs documented with examples?
- [ ] Are breaking changes clearly documented?

## Common Anti-Patterns to Flag

### Hexagonal Architecture Violations

❌ **Domain importing from Infrastructure**
```typescript
// WRONG - in domain layer
import { PokeApiAdapter } from '@infra/adapters';

// CORRECT - use dependency injection with ports
constructor(private repository: PokemonRepository) {}
```

❌ **Business Logic in UI Components**
```typescript
// WRONG
export class PokemonCardComponent {
  calculateTypeEffectiveness() {
    // complex business logic here
  }
}

// CORRECT - business logic in domain services
export class PokemonCardComponent {
  constructor(private comparisonService: ComparisonService) {}
  
  get typeEffectiveness() {
    return this.comparisonService.calculateTypeEffectiveness(...);
  }
}
```

### Angular Anti-Patterns

❌ **Manual Subscription Without Cleanup**
```typescript
// WRONG
ngOnInit() {
  this.service.getData().subscribe(data => this.data = data);
}

// CORRECT - use async pipe or takeUntilDestroyed
data$ = this.service.getData();
// OR
ngOnInit() {
  this.service.getData()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(data => this.data = data);
}
```

❌ **Mutating Input Properties**
```typescript
// WRONG
@Input() pokemon!: Pokemon;
ngOnInit() {
  this.pokemon.name = this.pokemon.name.toUpperCase();
}

// CORRECT - create new reference or use computed
@Input() pokemon!: Pokemon;
uppercaseName = computed(() => this.pokemon.name.toUpperCase());
```

### Performance Anti-Patterns

❌ **Heavy Computations in Templates**
```html
<!-- WRONG -->
<div>{{ calculateExpensiveValue() }}</div>

<!-- CORRECT - use memoization or signals -->
<div>{{ expensiveValue() }}</div>
```

❌ **Not Using OnPush Strategy**
```typescript
// WRONG - for presentational components
@Component({
  selector: 'pc-pokemon-card',
  // default change detection
})

// CORRECT
@Component({
  selector: 'pc-pokemon-card',
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## Analysis Guidelines

### Proposing Alternatives

When analyzing implementation approaches:

1. **Identify Trade-offs**: Clearly state pros and cons of each approach
2. **Consider Context**: Align with project architecture (hexagonal, microfrontend)
3. **Performance Impact**: Analyze bundle size, runtime performance
4. **Maintainability**: Evaluate code clarity and future extensibility
5. **Testing**: Consider testability of each approach

### Example Analysis Format

```markdown
## Alternative Implementations for [Feature]

### Option 1: [Approach Name]
**Pros:**
- Benefit 1
- Benefit 2

**Cons:**
- Drawback 1
- Drawback 2

**Architecture Alignment:** [How it fits with hexagonal architecture]
**Performance Impact:** [Bundle size, runtime considerations]

### Option 2: [Approach Name]
...

### Recommendation
[Clear recommendation with justification]
```

### Technical Debt Assessment

When evaluating technical debt:

1. **Impact**: How does it affect development velocity?
2. **Risk**: What are the potential consequences if not addressed?
3. **Effort**: Estimation of work required to resolve
4. **Priority**: Recommended prioritization (High/Medium/Low)

## Project-Specific Conventions

### Naming Conventions

- **Components**: PascalCase, descriptive names (e.g., `PokemonCardComponent`)
- **Services**: PascalCase with `Service` suffix (e.g., `PokemonCatalogService`)
- **Interfaces/Ports**: PascalCase (e.g., `PokemonRepository`)
- **Models**: PascalCase (e.g., `PokemonDetail`)
- **Files**: kebab-case matching class name (e.g., `pokemon-card.component.ts`)

### Component Selectors

- **UI Library Atoms**: `pc-[name]` (e.g., `pc-button`)
- **UI Library Molecules**: `pc-[name]` (e.g., `pc-header`)
- **Feature Components**: `poke-[name]` (e.g., `poke-catalog`)

### File Organization

```
component-name/
├── component-name.component.ts      # Component class
├── component-name.component.html    # Template
├── component-name.component.css     # Styles
├── component-name.component.spec.ts # Tests
└── index.ts                         # Public API exports
```

### Import Order

1. Angular core imports
2. Third-party libraries
3. Domain layer imports
4. Infrastructure layer imports (only in infra projects)
5. UI library imports
6. Relative imports

## Questions to Ask During Review

1. **Architecture**: Does this change maintain proper layer separation?
2. **Maintainability**: Will future developers understand this code easily?
3. **Scalability**: How will this perform with large datasets (e.g., 1000+ Pokemon)?
4. **User Experience**: Does this improve or maintain UX quality?
5. **Breaking Changes**: Does this affect existing APIs or behavior?
6. **Migration Path**: If breaking, is there a clear migration path?
7. **Edge Cases**: What happens with empty data, errors, or edge cases?

## Review Tone and Approach

- **Be Constructive**: Focus on improvement, not criticism
- **Provide Context**: Explain WHY a change is suggested
- **Offer Solutions**: Don't just point out problems, suggest fixes
- **Acknowledge Good Work**: Highlight well-written code
- **Ask Questions**: If unclear, ask for clarification rather than assuming
- **Prioritize Feedback**: Distinguish between blocking issues and nice-to-haves

### Feedback Categories

- **🔴 Critical**: Must be fixed (security, architecture violations, bugs)
- **🟡 Important**: Should be addressed (performance, maintainability)
- **🟢 Suggestion**: Nice-to-have improvements
- **💡 Learning**: Educational comments for knowledge sharing

## Useful Commands for Analysis

```bash
# Check project structure
tree projects/ -L 3

# Find component usage
grep -r "PokemonCardComponent" projects/

# Check imports to detect boundary violations
grep -r "from '@infra" projects/domain/

# Analyze bundle size
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/host/stats.json

# Run linting
npm run lint

# Check test coverage
npm test -- --coverage
```

## Resources

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Microfrontend Architecture](https://micro-frontends.org/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Web Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
