# Infrastructure Library

The **Infrastructure** library contains the **secondary adapters** that implement the port interfaces defined in the Domain library. These adapters handle external concerns such as HTTP communication, data persistence, and integration with third-party APIs.

## Purpose

In the context of Hexagonal Architecture, this library sits in the outer layer and provides concrete implementations of the domain's port interfaces. It translates between the domain's pure business models and external data formats (such as REST APIs).

## Key Concepts

### Secondary Adapters

Secondary adapters are implementations that the domain depends on through port interfaces. They handle:
- External API communication
- Data transformation (API DTOs ↔ Domain Models)
- Error handling and retry logic
- Caching strategies (if implemented)

### Dependency Inversion

The infrastructure layer depends on the domain layer (through port interfaces), but the domain never depends on infrastructure. This allows:
- Easy testing of domain logic without real HTTP calls
- Swapping implementations without changing business logic
- Multiple implementations for different environments

## Directory Structure

```
projects/infra/src/lib/
└── adapters/
    ├── pokeapi.adapter.ts         # Catalog API implementation
    └── pokeapi-detail.adapter.ts  # Detail API implementation
```

## Adapters

### `PokeApiAdapter`

Implements `PokemonRepository` port from the domain library.

**Responsibilities:**
- Fetches Pokemon list from PokeAPI
- Handles pagination
- Transforms PokeAPI responses to domain models
- Implements search functionality

**Key Methods:**
```typescript
class PokeApiAdapter implements PokemonRepository {
  getPokemonList(pagination: PaginationParams, filter?: PokemonFilter): Observable<PokemonPage>
  getPokemonById(id: number): Observable<PokemonSummary>
  getPokemonByName(name: string): Observable<PokemonSummary>
  searchPokemon(query: string, limit: number): Observable<PokemonSummary[]>
}
```

**Injection Token:** `POKEMON_REPOSITORY`

### `PokeApiDetailAdapter`

Implements `PokemonDetailRepository` port from the domain library.

**Responsibilities:**
- Fetches detailed Pokemon information from PokeAPI
- Transforms detailed API responses to domain models
- Handles Pokemon stats, abilities, and characteristics

**Key Methods:**
```typescript
class PokeApiDetailAdapter implements PokemonDetailRepository {
  getPokemonDetail(id: number): Observable<PokemonDetail>
  getPokemonDetailByName(name: string): Observable<PokemonDetail>
}
```

**Injection Token:** `POKEMON_DETAIL_REPOSITORY`

## PokeAPI Integration

### Base URL
```
https://pokeapi.co/api/v2/
```

### Endpoints Used

| Endpoint | Purpose | Adapter |
|----------|---------|---------|
| `GET /pokemon?offset={offset}&limit={limit}` | List Pokemon with pagination | `PokeApiAdapter` |
| `GET /pokemon/{id}` | Get Pokemon by ID | Both adapters |
| `GET /pokemon/{name}` | Get Pokemon by name | Both adapters |

### Response Mapping

The adapters transform PokeAPI DTOs into domain models:

**PokeAPI Response → Domain Model**

```typescript
// PokeAPI returns:
{
  id: 1,
  name: "bulbasaur",
  sprites: {
    front_default: "https://..."
  },
  types: [
    { type: { name: "grass" }, slot: 1 },
    { type: { name: "poison" }, slot: 2 }
  ]
}

// Adapter transforms to:
{
  id: 1,
  name: "bulbasaur",
  spriteUrl: "https://...",
  types: [
    { name: "grass", slot: 1 },
    { name: "poison", slot: 2 }
  ]
}
```

### Error Handling

Adapters handle common HTTP errors:
- **404 Not Found** - Pokemon doesn't exist
- **Network Errors** - Connectivity issues
- **Rate Limiting** - Too many requests (rare with PokeAPI)

Errors are propagated to the domain layer as Observable errors, allowing services and components to handle them appropriately.

## Usage Example

### Registering the Adapter

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { POKEMON_REPOSITORY } from '@domain/ports/pokemon.repository';
import { POKEMON_DETAIL_REPOSITORY } from '@domain/ports/pokemon-detail.repository';
import { PokeApiAdapter } from '@infra/adapters/pokeapi.adapter';
import { PokeApiDetailAdapter } from '@infra/adapters/pokeapi-detail.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    { provide: POKEMON_REPOSITORY, useClass: PokeApiAdapter },
    { provide: POKEMON_DETAIL_REPOSITORY, useClass: PokeApiDetailAdapter }
  ]
};
```

### Using in a Service

The domain services automatically receive the adapter through dependency injection:

```typescript
@Injectable()
export class PokemonCatalogService {
  // POKEMON_REPOSITORY is injected here
  private readonly repository = inject(POKEMON_REPOSITORY);
  
  getPokemonList(pagination: PaginationParams) {
    // This calls PokeApiAdapter.getPokemonList()
    return this.repository.getPokemonList(pagination);
  }
}
```

## Adding New Adapters

To add a new adapter (e.g., for a different API or local storage):

### 1. Create the Adapter Class

```typescript
// projects/infra/src/lib/adapters/my-adapter.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PokemonRepository, PokemonPage } from '@domain';

@Injectable()
export class MyCustomAdapter implements PokemonRepository {
  getPokemonList(pagination: PaginationParams): Observable<PokemonPage> {
    // Your implementation
  }
  
  // Implement other required methods...
}
```

### 2. Register the Adapter

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: POKEMON_REPOSITORY, useClass: MyCustomAdapter }
  ]
};
```

### 3. Test the Adapter

Create unit tests that verify:
- Correct transformation of data
- Error handling
- Edge cases

## Caching Strategy

Currently, no caching is implemented in the adapters. If caching is needed:

**Options:**
1. **HTTP Interceptor** - Cache at HTTP level
2. **Service-Level Cache** - Cache in domain services
3. **Adapter-Level Cache** - Cache within adapters using RxJS operators like `shareReplay()`

**Recommended Approach:**
```typescript
@Injectable()
export class CachedPokeApiAdapter implements PokemonRepository {
  private cache = new Map<string, Observable<any>>();
  
  getPokemonById(id: number): Observable<PokemonSummary> {
    const key = `pokemon-${id}`;
    
    if (!this.cache.has(key)) {
      this.cache.set(key, 
        this.http.get(`/pokemon/${id}`).pipe(
          map(this.transformToDomain),
          shareReplay(1)
        )
      );
    }
    
    return this.cache.get(key)!;
  }
}
```

## Building

To build the library:

```bash
ng build infra
```

Build artifacts will be placed in `dist/infra/`.

## Testing

Run unit tests:

```bash
ng test infra
```

**Testing Strategy:**
- Use `HttpClientTestingModule` to mock HTTP requests
- Verify correct API endpoint construction
- Verify data transformation logic
- Test error scenarios

**Example Test:**
```typescript
it('should transform PokeAPI response to domain model', () => {
  const apiResponse = { /* PokeAPI format */ };
  const expected = { /* Domain model format */ };
  
  adapter.getPokemonById(1).subscribe(result => {
    expect(result).toEqual(expected);
  });
  
  const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1');
  req.flush(apiResponse);
});
```

## Architecture Benefits

Having a separate infrastructure layer provides:
- **Testability**: Domain can be tested without real HTTP calls
- **Flexibility**: Easy to switch APIs or add multiple data sources
- **Isolation**: API changes don't affect domain logic
- **Mocking**: Can create mock adapters for development/testing

## Related Documentation

- [Domain Library](../domain/README.md) - Defines the ports this library implements
- [Hexagonal Architecture](../../docs/architecture/hexagonal-architecture.md)
- [PokeAPI Documentation](https://pokeapi.co/docs/v2)
