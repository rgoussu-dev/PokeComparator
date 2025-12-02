# Testing Mode 🧪

This context file provides guidance for coding agents when testing the Pokecomparator application, including unit tests, integration tests, and end-to-end validation.

## When to Use This Context

Load this context when:
- Writing or updating unit tests for components, services, or utilities
- Running tests to validate changes
- Debugging test failures
- Setting up test infrastructure
- Validating application behavior manually

## Testing Philosophy

The Pokecomparator project follows these testing principles:

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Keep Tests Simple**: Tests should be easier to understand than the code they test
3. **Test in Isolation**: Use mocks/stubs for dependencies
4. **Fast Feedback**: Tests should run quickly to enable rapid iteration
5. **Maintainable Tests**: Tests should be easy to update when requirements change

## Testing Stack

- **Test Framework**: Vitest (configured in the project)
- **Angular Testing Utilities**: `@angular/core/testing`
- **Assertion Library**: Vitest's built-in assertions
- **Test Runner**: Vitest CLI

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests for specific project
npm test -- projects/domain

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- pokemon-card.component.spec.ts
```

### Debugging Tests

```bash
# Run tests in debug mode
npm test -- --inspect-brk

# Run single test file with verbose output
npm test -- --reporter=verbose pokemon-card.component.spec.ts
```

## Unit Testing Patterns

### Testing Components

#### Basic Component Test

```typescript
import { TestBed } from '@angular/core/testing';
import { PokemonCardComponent } from './pokemon-card.component';
import { PokemonSummary } from '@domain/models';

describe('PokemonCardComponent', () => {
  let fixture: ComponentFixture<PokemonCardComponent>;
  let component: PokemonCardComponent;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonCardComponent] // Standalone component
    }).compileComponents();
    
    fixture = TestBed.createComponent(PokemonCardComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should display pokemon name', () => {
    // Arrange
    const mockPokemon: PokemonSummary = {
      id: 1,
      name: 'Bulbasaur',
      url: 'https://pokeapi.co/api/v2/pokemon/1/'
    };
    
    // Act
    fixture.componentRef.setInput('pokemon', mockPokemon);
    fixture.detectChanges();
    
    // Assert
    const compiled = fixture.nativeElement;
    const nameElement = compiled.querySelector('.pokemon-name');
    expect(nameElement.textContent).toContain('Bulbasaur');
  });
  
  it('should emit event when clicked', () => {
    // Arrange
    const mockPokemon: PokemonSummary = {
      id: 1,
      name: 'Bulbasaur',
      url: 'https://pokeapi.co/api/v2/pokemon/1/'
    };
    fixture.componentRef.setInput('pokemon', mockPokemon);
    
    let emittedPokemon: PokemonSummary | undefined;
    component.pokemonSelected.subscribe((pokemon: PokemonSummary) => {
      emittedPokemon = pokemon;
    });
    
    // Act
    component.selectPokemon();
    
    // Assert
    expect(emittedPokemon).toEqual(mockPokemon);
  });
});
```

#### Testing Component with Dependencies

```typescript
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PokeCatalogComponent } from './poke-catalog.component';
import { PokemonCatalogService } from '@domain/services';
import { PokemonPage } from '@domain/models';

describe('PokeCatalogComponent', () => {
  let component: PokeCatalogComponent;
  let fixture: ComponentFixture<PokeCatalogComponent>;
  let mockCatalogService: jasmine.SpyObj<PokemonCatalogService>;
  
  beforeEach(async () => {
    // Create mock service
    mockCatalogService = jasmine.createSpyObj('PokemonCatalogService', [
      'getPokemonList'
    ]);
    
    await TestBed.configureTestingModule({
      imports: [PokeCatalogComponent],
      providers: [
        { provide: PokemonCatalogService, useValue: mockCatalogService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(PokeCatalogComponent);
    component = fixture.componentInstance;
  });
  
  it('should load pokemon on init', () => {
    // Arrange
    const mockPage: PokemonPage = {
      results: [
        { id: 1, name: 'Bulbasaur', url: 'url1' },
        { id: 2, name: 'Ivysaur', url: 'url2' }
      ],
      total: 2,
      page: 1
    };
    mockCatalogService.getPokemonList.and.returnValue(of(mockPage));
    
    // Act
    fixture.detectChanges(); // Triggers ngOnInit
    
    // Assert
    expect(mockCatalogService.getPokemonList).toHaveBeenCalledWith(1);
    expect(component.pokemonList()).toEqual(mockPage.results);
    expect(component.isLoading()).toBe(false);
  });
  
  it('should handle error when loading fails', () => {
    // Arrange
    const error = new Error('API Error');
    mockCatalogService.getPokemonList.and.returnValue(throwError(() => error));
    
    spyOn(console, 'error'); // Spy on console.error to verify error handling
    
    // Act
    fixture.detectChanges();
    
    // Assert
    expect(component.isLoading()).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Failed to load Pokemon:', error);
  });
});
```

### Testing Services

#### Domain Service Tests

```typescript
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PokemonCatalogService } from './pokemon-catalog.service';
import { PokemonRepository } from '../ports/pokemon-repository';
import { PokemonPage } from '../models';

describe('PokemonCatalogService', () => {
  let service: PokemonCatalogService;
  let mockRepository: jasmine.SpyObj<PokemonRepository>;
  
  beforeEach(() => {
    // Create mock repository
    mockRepository = jasmine.createSpyObj('PokemonRepository', [
      'getPokemonList'
    ]);
    
    TestBed.configureTestingModule({
      providers: [
        PokemonCatalogService,
        { provide: PokemonRepository, useValue: mockRepository }
      ]
    });
    
    service = TestBed.inject(PokemonCatalogService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should fetch pokemon list from repository', (done) => {
    // Arrange
    const mockPage: PokemonPage = {
      results: [{ id: 1, name: 'Bulbasaur', url: 'url' }],
      total: 1,
      page: 1
    };
    mockRepository.getPokemonList.and.returnValue(of(mockPage));
    
    // Act
    service.getPokemonList(1, 20).subscribe(result => {
      // Assert
      expect(result).toEqual(mockPage);
      expect(mockRepository.getPokemonList).toHaveBeenCalledWith(1, 20);
      done();
    });
  });
});
```

#### Infrastructure Adapter Tests

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PokeApiAdapter } from './pokeapi.adapter';
import { PokemonPage } from '@domain/models';

describe('PokeApiAdapter', () => {
  let adapter: PokeApiAdapter;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PokeApiAdapter]
    });
    
    adapter = TestBed.inject(PokeApiAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });
  
  it('should fetch pokemon list from API', (done) => {
    // Arrange
    const mockApiResponse = {
      count: 1118,
      next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' }
      ]
    };
    
    // Act
    adapter.getPokemonList(1, 20).subscribe(result => {
      // Assert
      expect(result.results.length).toBe(2);
      expect(result.results[0].name).toBe('Bulbasaur'); // Note: capitalized
      expect(result.total).toBe(1118);
      done();
    });
    
    // Expect HTTP request
    const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?offset=0&limit=20');
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockApiResponse);
  });
  
  it('should handle HTTP errors', (done) => {
    // Act
    adapter.getPokemonList(1, 20).subscribe({
      next: () => fail('Should have failed'),
      error: (error) => {
        // Assert
        expect(error).toBeTruthy();
        done();
      }
    });
    
    // Simulate error
    const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?offset=0&limit=20');
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
  });
});
```

### Testing Pipes

```typescript
import { TestBed } from '@angular/core/testing';
import { CapitalizePipe } from './capitalize.pipe';

describe('CapitalizePipe', () => {
  let pipe: CapitalizePipe;
  
  beforeEach(() => {
    pipe = new CapitalizePipe();
  });
  
  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  
  it('should capitalize first letter', () => {
    expect(pipe.transform('bulbasaur')).toBe('Bulbasaur');
  });
  
  it('should handle empty string', () => {
    expect(pipe.transform('')).toBe('');
  });
  
  it('should handle null/undefined', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
  });
});
```

### Testing Directives

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HighlightDirective } from './highlight.directive';

@Component({
  template: `<div appHighlight [highlightColor]="color">Test</div>`,
  standalone: true,
  imports: [HighlightDirective]
})
class TestComponent {
  color = 'yellow';
}

describe('HighlightDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let divElement: HTMLElement;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    divElement = fixture.nativeElement.querySelector('div');
  });
  
  it('should apply highlight color', () => {
    fixture.detectChanges();
    expect(divElement.style.backgroundColor).toBe('yellow');
  });
  
  it('should update when color changes', () => {
    component.color = 'red';
    fixture.detectChanges();
    expect(divElement.style.backgroundColor).toBe('red');
  });
});
```

## Testing Signal-Based Components

### Testing Signal Inputs

```typescript
it('should update when signal input changes', () => {
  const fixture = TestBed.createComponent(MyComponent);
  
  // Set initial value
  fixture.componentRef.setInput('count', 5);
  fixture.detectChanges();
  
  expect(fixture.componentInstance.count()).toBe(5);
  
  // Update value
  fixture.componentRef.setInput('count', 10);
  fixture.detectChanges();
  
  expect(fixture.componentInstance.count()).toBe(10);
});
```

### Testing Computed Signals

```typescript
it('should compute value based on signals', () => {
  const component = fixture.componentInstance;
  
  // Assuming component has: doubleCount = computed(() => this.count() * 2)
  fixture.componentRef.setInput('count', 5);
  fixture.detectChanges();
  
  expect(component.doubleCount()).toBe(10);
});
```

### Testing Signal Outputs

```typescript
it('should emit output event', () => {
  const component = fixture.componentInstance;
  let emittedValue: any;
  
  // Subscribe to signal output
  component.valueChanged.subscribe((value: any) => {
    emittedValue = value;
  });
  
  // Trigger event
  component.onChange('test-value');
  
  expect(emittedValue).toBe('test-value');
});
```

## Integration Testing

### Testing Component Integration

```typescript
describe('PokeCatalog Integration', () => {
  let fixture: ComponentFixture<PokeCatalogComponent>;
  let httpMock: HttpTestingController;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PokeCatalogComponent,
        HttpClientTestingModule
      ],
      providers: [
        PokemonCatalogService,
        { provide: PokemonRepository, useClass: PokeApiAdapter }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(PokeCatalogComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it('should load and display pokemon from API', () => {
    const mockResponse = {
      count: 1118,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }
      ]
    };
    
    // Trigger component initialization
    fixture.detectChanges();
    
    // Respond to HTTP request
    const req = httpMock.expectOne(req => req.url.includes('pokeapi.co'));
    req.flush(mockResponse);
    
    // Verify component state
    fixture.detectChanges();
    expect(fixture.componentInstance.pokemonList().length).toBe(1);
    expect(fixture.componentInstance.pokemonList()[0].name).toBe('Bulbasaur');
    
    // Verify DOM
    const cards = fixture.nativeElement.querySelectorAll('.pokemon-card');
    expect(cards.length).toBe(1);
  });
});
```

## Manual Testing Checklist

### Application Startup

- [ ] Run `npm run run:all` successfully
- [ ] Host app loads at http://localhost:4200
- [ ] Remote catalog loads at http://localhost:4201
- [ ] Remote detail loads at http://localhost:4202
- [ ] Remote compare loads at http://localhost:4203
- [ ] No console errors on startup

### Catalog Feature

- [ ] Pokemon list displays correctly
- [ ] Pagination works (next/previous buttons)
- [ ] Search functionality filters results
- [ ] Pokemon cards are clickable
- [ ] Clicking a card navigates to detail page
- [ ] Images load correctly
- [ ] Infinite scroll works (if implemented)

### Detail Feature

- [ ] Detail page loads when accessing /:id route
- [ ] Pokemon name and image display
- [ ] Stats are shown correctly
- [ ] Charts render properly
- [ ] Type badges display with correct colors
- [ ] Back button returns to catalog
- [ ] Compare button is visible and functional

### Compare Feature

- [ ] Compare page accepts two Pokemon via query params
- [ ] Both Pokemon details load
- [ ] Side-by-side comparison is readable
- [ ] Stat differences are highlighted
- [ ] Chart comparisons display correctly
- [ ] Handles invalid Pokemon IDs gracefully

### UI Components (Storybook)

```bash
# Run Storybook
ng run ui:storybook
```

- [ ] Storybook starts at http://localhost:6006
- [ ] All atoms stories render
- [ ] All molecules stories render
- [ ] Component controls work
- [ ] Theme toggle works in stories
- [ ] Accessibility checks pass

### Theme Switching

- [ ] Theme toggle button exists
- [ ] Clicking toggle switches theme
- [ ] Theme persists on page reload
- [ ] All components respond to theme change
- [ ] No flashing or layout shifts during switch

### Responsive Design

Test at different viewport sizes:

- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Large desktop (1440px)

Check:
- [ ] Navigation adapts to screen size
- [ ] Cards/grids reflow properly
- [ ] Text remains readable
- [ ] Images scale appropriately
- [ ] No horizontal scrolling (unless intentional)

### Accessibility

- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus indicators are visible
- [ ] Screen reader announcements are meaningful
- [ ] Color contrast meets WCAG AA standards
- [ ] Images have alt text
- [ ] Forms have associated labels

### Performance

- [ ] Initial load time < 3 seconds
- [ ] Route transitions are smooth
- [ ] No memory leaks (check Chrome DevTools Memory)
- [ ] Images load progressively
- [ ] API calls are not duplicated unnecessarily

### Error Handling

- [ ] Network errors show user-friendly messages
- [ ] Invalid routes show 404 page
- [ ] Invalid Pokemon IDs handled gracefully
- [ ] Form validation errors are clear
- [ ] Console shows no uncaught errors

## Test Coverage Goals

### Coverage Targets

- **Overall**: > 70%
- **Domain layer**: > 90% (critical business logic)
- **Services**: > 85%
- **Components**: > 70%
- **UI library**: > 80%

### Generating Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# View HTML report
open coverage/index.html
```

### Analyzing Coverage

Focus on:
1. **Uncovered branches**: Edge cases not tested
2. **Uncovered functions**: Dead code or missing tests
3. **Low-covered files**: Identify testing gaps

## Debugging Test Failures

### Common Issues and Solutions

#### Issue: Test timeout

```typescript
// Increase timeout for async tests
it('should load data', (done) => {
  // Test code
  done();
}, 10000); // 10 second timeout
```

#### Issue: Async timing issues

```typescript
// Use fakeAsync and tick
import { fakeAsync, tick } from '@angular/core/testing';

it('should debounce input', fakeAsync(() => {
  component.onInput('test');
  tick(300); // Simulate time passing
  expect(component.debouncedValue).toBe('test');
}));
```

#### Issue: Change detection not triggering

```typescript
// Explicitly trigger change detection
fixture.detectChanges();
```

#### Issue: HTTP request not being made

```typescript
// Check if HttpClientTestingModule is imported
// Verify the request expectation matches actual URL
const req = httpMock.expectOne(req => {
  console.log('Request URL:', req.url); // Debug
  return req.url.includes('expected-path');
});
```

## Testing Best Practices

### Do's ✅

- **Test user-facing behavior**: What users see and interact with
- **Use descriptive test names**: Clearly state what's being tested
- **Follow AAA pattern**: Arrange, Act, Assert
- **Keep tests independent**: Each test should run in isolation
- **Mock external dependencies**: Don't rely on APIs or databases
- **Test edge cases**: Empty arrays, null values, errors
- **Clean up after tests**: Reset state, verify HTTP mocks

### Don'ts ❌

- **Don't test implementation details**: Focus on behavior
- **Don't test framework code**: Angular is already tested
- **Don't make tests too complex**: If test is complex, code might be too
- **Don't ignore failing tests**: Fix them or remove them
- **Don't duplicate tests**: One test per behavior
- **Don't test multiple things in one test**: Keep focused

## Test Organization

### File Structure

```
component-name/
├── component-name.component.ts
├── component-name.component.html
├── component-name.component.css
├── component-name.component.spec.ts  # Tests here
└── index.ts
```

### Test File Template

```typescript
import { TestBed } from '@angular/core/testing';
import { ComponentName } from './component-name.component';

describe('ComponentName', () => {
  // Setup
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentName]
    }).compileComponents();
  });
  
  // Creation test
  describe('Component Creation', () => {
    it('should create', () => {
      // Test
    });
  });
  
  // Rendering tests
  describe('Rendering', () => {
    it('should display X when Y', () => {
      // Test
    });
  });
  
  // Interaction tests
  describe('User Interactions', () => {
    it('should emit event when clicked', () => {
      // Test
    });
  });
  
  // Edge cases
  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      // Test
    });
  });
});
```

## Continuous Testing

### Watch Mode

```bash
# Run tests in watch mode for active development
npm test -- --watch

# Run specific test file in watch mode
npm test -- --watch pokemon-card.spec.ts
```

### Pre-commit Testing

Ensure tests pass before committing:

```bash
# Run linting and tests
npm run lint && npm test
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest/Vitest Expect API](https://vitest.dev/api/expect.html)
