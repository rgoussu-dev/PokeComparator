# Domain Library

The **Domain** library is the heart of the Pokecomparator application, implementing the business logic layer following **Hexagonal Architecture** (Ports & Adapters pattern). This library is technology-agnostic and contains no framework-specific code beyond Angular's dependency injection.

## Purpose

The Domain library encapsulates all business rules, domain entities, and use cases for the Pokemon comparison application. It acts as the core of the hexagonal architecture, defining contracts (ports) that outer layers must implement while remaining independent of external concerns like data sources or UI frameworks.

## Key Concepts

### Hexagonal Architecture

This library follows the Hexagonal Architecture pattern where:
- **Domain** sits at the center, containing pure business logic
- **Ports** define interfaces for external dependencies (secondary ports) and use cases (primary ports)
- **Adapters** (in the `infra` library) implement these ports

### Core Components

The domain library is organized into three main directories:

1. **`models/`** - Domain entities and value objects
2. **`ports/`** - Interface definitions (contracts for adapters)
3. **`services/`** - Business logic and use cases

## Directory Structure

```
projects/domain/src/lib/
├── models/
│   ├── pokemon.model.ts          # Catalog-related models
│   └── pokemon-detail.model.ts   # Detailed Pokemon models
├── ports/
│   ├── pokemon.repository.ts        # Catalog data port
│   └── pokemon-detail.repository.ts # Detail data port
└── services/
    ├── pokemon-catalog.service.ts # Catalog business logic
    ├── pokemon-detail.service.ts  # Detail business logic
    └── comparison.service.ts      # Comparison logic
```

## Models

### `pokemon.model.ts`

Defines core domain entities for the Pokemon catalog:

- **`PokemonType`** - Represents a Pokemon's type (e.g., fire, water, grass)
- **`PokemonSummary`** - Basic Pokemon information for catalog listing
  - `id: number`
  - `name: string`
  - `spriteUrl: string`
  - `types: PokemonType[]`
- **`PokemonPage`** - Paginated response container
  - `items: PokemonSummary[]`
  - `totalCount: number`
  - `currentPage: number`
  - `pageSize: number`
  - `totalPages: number`
- **`PokemonFilter`** - Filter criteria for querying Pokemon
  - `search?: string`
  - `types?: string[]`
- **`PaginationParams`** - Pagination parameters
  - `page: number`
  - `pageSize: number`

### `pokemon-detail.model.ts`

Defines detailed domain entities for individual Pokemon:

- **`PokemonDetail`** - Complete Pokemon information including:
  - Base stats (HP, Attack, Defense, etc.)
  - Abilities
  - Physical characteristics (height, weight)
  - Types
  - Sprites

## Ports

Ports are interfaces that define contracts for external dependencies. They allow the domain to remain decoupled from specific implementations.

### `pokemon.repository.ts`

Defines the contract for Pokemon catalog data access:

```typescript
export interface PokemonRepository {
  getPokemonList(pagination: PaginationParams, filter?: PokemonFilter): Observable<PokemonPage>;
  getPokemonById(id: number): Observable<PokemonSummary>;
  getPokemonByName(name: string): Observable<PokemonSummary>;
  searchPokemon(query: string, limit: number): Observable<PokemonSummary[]>;
}
```

**Injection Token:** `POKEMON_REPOSITORY`

### `pokemon-detail.repository.ts`

Defines the contract for detailed Pokemon data access:

```typescript
export interface PokemonDetailRepository {
  getPokemonDetail(id: number): Observable<PokemonDetail>;
  getPokemonDetailByName(name: string): Observable<PokemonDetail>;
}
```

**Injection Token:** `POKEMON_DETAIL_REPOSITORY`

## Services

Services contain the business logic and orchestrate operations using the repository ports.

### `PokemonCatalogService`

Handles Pokemon catalog operations:

- `getPokemonList(pagination, filter?)` - Retrieves paginated Pokemon list
- `getPokemonById(id)` - Retrieves a single Pokemon by ID
- `getPokemonByName(name)` - Retrieves a single Pokemon by name
- `searchPokemon(query, limit?)` - Searches Pokemon by name

### `PokemonDetailService`

Manages detailed Pokemon information:

- `getPokemonDetail(id)` - Retrieves complete Pokemon details by ID
- `getPokemonDetailByName(name)` - Retrieves complete Pokemon details by name

### `ComparisonService`

Handles Pokemon comparison logic:

- `comparePokemon(pokemon1, pokemon2)` - Compares two Pokemon and returns comparison data
- Calculates stat differences
- Determines strengths and weaknesses

## Usage Example

### In a Component

```typescript
import { Component, inject } from '@angular/core';
import { PokemonCatalogService } from '@domain/services/pokemon-catalog.service';
import { PaginationParams } from '@domain/models/pokemon.model';

@Component({
  selector: 'app-pokemon-list',
  template: `...`
})
export class PokemonListComponent {
  private catalogService = inject(PokemonCatalogService);
  
  loadPokemon() {
    const pagination: PaginationParams = { page: 1, pageSize: 20 };
    
    this.catalogService.getPokemonList(pagination).subscribe(page => {
      console.log(`Loaded ${page.items.length} Pokemon`);
    });
  }
}
```

### Providing the Service

```typescript
import { ApplicationConfig } from '@angular/core';
import { PokemonCatalogService } from '@domain/services/pokemon-catalog.service';
import { POKEMON_REPOSITORY } from '@domain/ports/pokemon.repository';
import { PokeApiAdapter } from '@infra/adapters/pokeapi.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    PokemonCatalogService,
    { provide: POKEMON_REPOSITORY, useClass: PokeApiAdapter }
  ]
};
```

## Extending the Domain

### Adding a New Model

1. Create or edit a file in `models/`
2. Define the interface/type
3. Export it from the model file
4. Document with JSDoc comments

### Adding a New Port

1. Create a new file in `ports/`
2. Define the interface with method signatures
3. Create an `InjectionToken` for the port
4. Export both the interface and token

### Adding a New Service

1. Create a new file in `services/`
2. Implement the service using `@Injectable()`
3. Inject required ports using their tokens
4. Implement business logic methods
5. Add comprehensive JSDoc documentation

## Building

To build the library:

```bash
ng build domain
```

Build artifacts will be placed in `dist/domain/`.

## Testing

Run unit tests:

```bash
ng test domain
```

The domain library should have high test coverage as it contains pure business logic without external dependencies.

## Architecture Benefits

By keeping the domain layer pure and isolated:
- **Testability**: Easy to unit test without mocking frameworks or HTTP
- **Portability**: Can be used across different applications or platforms
- **Maintainability**: Business logic changes don't affect infrastructure
- **Flexibility**: Can swap out data sources without touching business logic

## Related Documentation

- [Hexagonal Architecture](../../docs/architecture/hexagonal-architecture.md)
- [Infrastructure Library](../infra/README.md) - Implements domain ports
- [Architecture Overview](../../docs/architecture/README.md)
