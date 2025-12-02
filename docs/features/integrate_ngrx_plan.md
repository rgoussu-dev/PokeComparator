# NgRx Integration Plan for Pokecomparator

## Executive Summary

This document outlines a comprehensive plan to integrate NgRx for state management across the Pokecomparator application. The migration integrates NgRx **directly into the domain library**, treating application state as an integral part of the domain logic — not as a separate concern.

### Architectural Decision: State Management in Domain

**Rationale:** Application state (what Pokemon are loaded, what's selected for comparison, pagination state, caching rules) is fundamentally **business logic**. The decision to cache Pokemon details, the rules for maximum selection count, and the shape of the application state are all domain concerns. Therefore, NgRx belongs in the domain layer, not in a separate library.

**Benefits:**
- **Cohesion**: State management lives alongside the models it manages
- **Single Dependency**: No additional library to share via Module Federation
- **Domain Encapsulation**: UI components interact with domain through a unified API (selectors + actions)
- **Rich Domain Models**: Business logic (e.g., `PokemonDetail.compare()`) co-located with model definitions via TypeScript namespaces
- **Cleaner Hexagon**: Effects orchestrate data fetching; pure domain functions handle business logic

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [NgRx Integration Goals](#2-ngrx-integration-goals)
3. [Architectural Considerations](#3-architectural-considerations)
4. [Implementation Strategy](#4-implementation-strategy)
5. [Impact Analysis by Project/Library](#5-impact-analysis-by-projectlibrary)
6. [Component-Level Breakdown](#6-component-level-breakdown)
7. [Migration Phases](#7-migration-phases)
8. [Documentation Updates](#8-documentation-updates)
9. [Testing Strategy](#9-testing-strategy)
10. [Risks and Mitigations](#10-risks-and-mitigations)

---

## 1. Current State Analysis

### 1.1 Current State Management Patterns

The application currently uses **Angular Signals** for component-level reactive state management:

| Component | Current State Pattern | State Complexity |
|-----------|----------------------|------------------|
| `PokeCatalog` | Signals (`pokemonList`, `currentPage`, `selectedPokemon`, etc.) | Medium |
| `PokeDetail` | Signals (`pokemon`, `isLoading`, `error`, `searchResults`) | Medium |
| `PokeCompare` | Signals (`comparison`, `isLoading`, `error`, `statsArray`) | Low |
| Host App | Minimal (routing only) | Low |

### 1.2 Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Current Flow                                                                 │
│                                                                              │
│  UI Component ──(calls)──> Domain Service ──(uses)──> Port Interface        │
│       │                         │                            │               │
│       │                         │                            ▼               │
│       │                         │                    Infrastructure Adapter  │
│       │                         │                            │               │
│       │                         │                            ▼               │
│       │                         │                        PokeAPI            │
│       │                         │                            │               │
│       ◄─────(Observable)────────┴────────────────────────────┘               │
│       │                                                                      │
│       ▼                                                                      │
│  Local Signal Update                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Current State Locations

| State Type | Location | Shared? |
|------------|----------|---------|
| Pokemon List | `PokeCatalog` component | No |
| Pagination | `PokeCatalog` component | No |
| Search Query | `PokeCatalog`, `PokeDetail` | Duplicated |
| Selected Pokemon | `PokeCatalog` component | No |
| Pokemon Details | `PokeDetail` component | No |
| Comparison Data | `PokeCompare` component | No |
| Loading States | Each component | Duplicated |
| Error States | Each component | Duplicated |

### 1.4 Current Pain Points

1. **State Duplication**: Search functionality and loading patterns are duplicated across components
2. **No State Persistence**: Navigation between microfrontends loses state
3. **Cross-Component Communication**: Limited to URL parameters
4. **Debugging**: No centralized way to inspect application state
5. **Side Effects**: Scattered across components in subscription handlers

---

## 2. NgRx Integration Goals

### 2.1 Primary Goals

1. **Centralized State Management**: Single source of truth for application state
2. **Predictable State Updates**: Actions → Reducers → State flow
3. **Cross-Microfrontend State Sharing**: Share state between catalog, detail, and compare views
4. **Enhanced Debugging**: Redux DevTools integration
5. **Side Effect Management**: Centralized handling via NgRx Effects

### 2.2 Non-Goals

1. ❌ Replace all signals (component-level UI state can remain as signals)
2. ❌ Create a separate state library (state IS domain)
3. ❌ Create tight coupling between microfrontends
4. ❌ Keep pass-through services (business logic moves to model namespaces)

### 2.3 Success Criteria

- [ ] Pokemon catalog state persists across navigation
- [ ] Selected Pokemon for comparison accessible from any microfrontend
- [ ] Loading and error states managed consistently
- [ ] Redux DevTools shows complete application state
- [ ] Unit test coverage maintained or improved

---

## 3. Architectural Considerations

### 3.1 NgRx Placement in Hexagonal Architecture

With NgRx integrated into the domain library, the architecture becomes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Proposed Architecture                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      PRIMARY ADAPTERS (UI)                           │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐           │    │
│  │  │  Host App      │ │ Remote Catalog │ │ Remote Detail  │           │    │
│  │  │  ┌──────────┐  │ │ ┌──────────┐   │ │ ┌──────────┐   │           │    │
│  │  │  │Component │  │ │ │Component │   │ │ │Component │   │           │    │
│  │  │  │(signals) │  │ │ │(signals) │   │ │ │(signals) │   │           │    │
│  │  │  └────┬─────┘  │ │ └────┬─────┘   │ │ └────┬─────┘   │           │    │
│  │  └───────┼────────┘ └──────┼─────────┘ └──────┼─────────┘           │    │
│  │          │  dispatch()     │  select()        │                      │    │
│  │          └────────────────┬┴──────────────────┘                      │    │
│  └───────────────────────────┼─────────────────────────────────────────┘    │
│                              │                                               │
│  ┌───────────────────────────┼─────────────────────────────────────────┐    │
│  │                    DOMAIN (HEXAGON) - @domain                        │    │
│  │                           ▼                                          │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                    NgRx State Management                     │    │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │    │
│  │  │  │   Actions    │  │   Reducers   │  │  Selectors   │       │    │    │
│  │  │  │ (commands &  │  │ (state       │  │ (derived     │       │    │    │
│  │  │  │  events)     │  │  transitions)│  │  state)      │       │    │    │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘       │    │    │
│  │  │                           │                                  │    │    │
│  │  │                           ▼                                  │    │    │
│  │  │                  ┌─────────────────┐                         │    │    │
│  │  │                  │  NgRx Effects   │                         │    │    │
│  │  │                  │  (side effects, │                         │    │    │
│  │  │                  │   orchestration)│                         │    │    │
│  │  │                  └────────┬────────┘                         │    │    │
│  │  └───────────────────────────┼─────────────────────────────────┘    │    │
│  │                              │                                       │    │
│  │                              │ uses                                  │    │
│  │                              ▼                                       │    │
│  │                   ┌─────────────┐                                   │    │
│  │                   │    Ports    │                                   │    │
│  │                   │ (Interfaces)│                                   │    │
│  │                   └─────────────┘                                   │    │
│  │                                                                     │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │                   Models + Namespaces                        │   │    │
│  │  │  ┌─────────────────────────────────────────────────────────┐│   │    │
│  │  │  │ PokemonDetail (interface)                               ││   │    │
│  │  │  │ PokemonDetail.compare(p1, p2) → PokemonComparison       ││   │    │
│  │  │  │ PokemonDetail.calculateTotalStats(p) → number           ││   │    │
│  │  │  └─────────────────────────────────────────────────────────┘│   │    │
│  │  │  PokemonSummary, PokemonComparison, StatComparison, etc.    │   │    │
│  │  │  + State interfaces: AppState, CatalogState, DetailState    │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    SECONDARY ADAPTERS (INFRA)                         │   │
│  │                           ▲                                           │   │
│  │                   ┌─────────────┐                                     │   │
│  │                   │  Adapters   │                                     │   │
│  │                   │(PokeApiXxx) │                                     │   │
│  │                   └─────────────┘                                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key insight:** The NgRx store, reducers, selectors, and effects all live within the domain boundary. They orchestrate domain services and manage application state as a first-class domain concern.

### 3.2 State Structure Design

```typescript
// Proposed Root State Interface
interface AppState {
  catalog: CatalogState;
  detail: DetailState;
  compare: CompareState;
  ui: UIState;
}

interface CatalogState {
  pokemon: PokemonSummary[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  filter: PokemonFilter;
  loading: boolean;
  error: string | null;
}

interface DetailState {
  selectedPokemon: PokemonDetail | null;
  loading: boolean;
  error: string | null;
  cache: Record<number, PokemonDetail>; // Cache by Pokemon ID
}

interface CompareState {
  pokemon1: PokemonDetail | null;
  pokemon2: PokemonDetail | null;
  comparison: PokemonComparison | null;
  selectedForComparison: PokemonSummary[]; // Max 2
  loading: boolean;
  error: string | null;
}

interface UIState {
  searchQuery: string;
  theme: 'light' | 'dark';
}
```

### 3.3 Microfrontend State Strategy

Given the microfrontend architecture, we have two options:

#### Option A: Shared Store via Module Federation (Recommended)

```
┌────────────────────────────────────────────────────────────────────────┐
│                         Host Application                                │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    Root Store (Singleton)                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │ catalog  │  │  detail  │  │ compare  │  │    ui    │        │   │
│  │  │  slice   │  │  slice   │  │  slice   │  │  slice   │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                              │                                         │
│                              │ Shared via Module Federation            │
│       ┌──────────────────────┼──────────────────────┐                 │
│       ▼                      ▼                      ▼                 │
│  ┌─────────────┐      ┌─────────────┐       ┌─────────────┐          │
│  │   Catalog   │      │   Detail    │       │   Compare   │          │
│  │    Remote   │      │   Remote    │       │   Remote    │          │
│  │  (consumes  │      │  (consumes  │       │  (consumes  │          │
│  │   store)    │      │   store)    │       │   store)    │          │
│  └─────────────┘      └─────────────┘       └─────────────┘          │
└────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Single source of truth
- State persists across navigation
- Simpler mental model

**Cons:**
- Tighter coupling between microfrontends
- All state logic in host/shared library

#### Option B: Feature Stores per Remote (Alternative)

Each remote manages its own feature state, with shared actions for cross-communication.

**Pros:**
- More isolation
- Easier independent deployment

**Cons:**
- More complex synchronization
- Potential state duplication

**Recommendation:** Option A (Shared Store) aligns better with the current architecture where domain services are already shared.

---

## 4. Implementation Strategy

### 4.1 Domain Library Extension

Extend the existing `@domain` library to include NgRx state management.

**Key Change:** Domain services are removed. Business logic moves to **model namespaces** (e.g., `PokemonDetail.compare()`). Effects inject repositories (ports) directly.

```
projects/domain/
├── ng-package.json
├── package.json                      # Add @ngrx/* peer dependencies
├── README.md                         # UPDATE: Document state management + namespaces
├── tsconfig.lib.json
├── tsconfig.spec.json
└── src/
    ├── public-api.ts                 # UPDATE: Export state artifacts
    └── lib/
        ├── models/
        │   ├── pokemon.model.ts      # PokemonSummary, PokemonPage, etc.
        │   ├── pokemon-detail.model.ts # PokemonDetail interface + namespace
        │   ├── pokemon-comparison.model.ts # PokemonComparison, StatComparison
        │   └── state.model.ts        # NEW: State interfaces
        ├── ports/
        │   ├── pokemon.repository.ts
        │   └── pokemon-detail.repository.ts
        └── state/                    # NEW: NgRx state directory
            ├── index.ts              # Barrel export
            ├── app.state.ts          # Root state interface & feature keys
            ├── domain.providers.ts   # NgRx provider functions
            ├── catalog/
            │   ├── index.ts
            │   ├── catalog.actions.ts
            │   ├── catalog.reducer.ts
            │   ├── catalog.reducer.spec.ts
            │   ├── catalog.selectors.ts
            │   ├── catalog.selectors.spec.ts
            │   ├── catalog.effects.ts
            │   └── catalog.effects.spec.ts
            ├── detail/
            │   ├── index.ts
            │   ├── detail.actions.ts
            │   ├── detail.reducer.ts
            │   ├── detail.reducer.spec.ts
            │   ├── detail.selectors.ts
            │   ├── detail.selectors.spec.ts
            │   ├── detail.effects.ts
            │   └── detail.effects.spec.ts
            ├── compare/
            │   ├── index.ts
            │   ├── compare.actions.ts
            │   ├── compare.reducer.ts
            │   ├── compare.reducer.spec.ts
            │   ├── compare.selectors.ts
            │   ├── compare.selectors.spec.ts
            │   ├── compare.effects.ts
            │   └── compare.effects.spec.ts
            └── ui/
                ├── index.ts
                ├── ui.actions.ts
                ├── ui.reducer.ts
                └── ui.selectors.ts
```

### 4.2 Dependencies to Add

```json
// projects/domain/package.json - add as peerDependencies
{
  "peerDependencies": {
    "@ngrx/store": "^19.0.0",
    "@ngrx/effects": "^19.0.0",
    "@ngrx/entity": "^19.0.0"
  }
}

// Root package.json - add as dependencies
{
  "dependencies": {
    "@ngrx/store": "^19.0.0",
    "@ngrx/effects": "^19.0.0",
    "@ngrx/store-devtools": "^19.0.0",
    "@ngrx/entity": "^19.0.0"
  },
  "devDependencies": {
    "@ngrx/schematics": "^19.0.0"
  }
}
```

### 4.3 Domain Public API Updates

```typescript
// projects/domain/src/public-api.ts

/*
 * Public API Surface of domain
 */

// Models (includes namespace functions like PokemonDetail.compare())
export * from './lib/models/pokemon.model';
export * from './lib/models/pokemon-detail.model';   // Interface + namespace
export * from './lib/models/pokemon-comparison.model';
export * from './lib/models/state.model';            // NEW: State interfaces

// Ports (for infra adapters and Effects)
export * from './lib/ports/pokemon.repository';
export * from './lib/ports/pokemon-detail.repository';

// State Management (NEW)
export * from './lib/state';                         // Actions, selectors, providers
```

**Note:** Services are removed. Business logic is now available via:
- `PokemonDetail.compare(p1, p2)` — comparison logic
- `PokemonDetail.calculateTotalStats(p)` — stat aggregation
- Effects inject ports directly for data fetching

### 4.4 Rich Domain Models with Namespaces

Business logic that was previously in services is now co-located with model definitions using TypeScript's **namespace merging** pattern:

```typescript
// projects/domain/src/lib/models/pokemon-detail.model.ts

export interface PokemonDetail {
  id: number;
  name: string;
  stats: PokemonStats;
  types: PokemonType[];
  physical: { height: number; weight: number };
  sprites: PokemonSprites;
  // ... other properties
}

// Namespace merges with the interface — provides domain logic
export namespace PokemonDetail {
  /**
   * Compares two Pokemon and returns a detailed comparison result
   */
  export function compare(p1: PokemonDetail, p2: PokemonDetail): PokemonComparison {
    const stats = compareStats(p1, p2);
    const physical = comparePhysical(p1, p2);
    const typeComparison = compareTypes(p1, p2);
    
    const allStats = [stats.hp, stats.attack, stats.defense, 
                      stats.specialAttack, stats.specialDefense, stats.speed];
    const statsWonByP1 = allStats.filter(s => s.winner === 'pokemon1').length;
    const statsWonByP2 = allStats.filter(s => s.winner === 'pokemon2').length;
    
    return {
      pokemon1: p1,
      pokemon2: p2,
      stats,
      physical,
      typeComparison,
      overallWinner: determineWinner(statsWonByP1, statsWonByP2, stats.total),
      statsWonByPokemon1: statsWonByP1,
      statsWonByPokemon2: statsWonByP2
    };
  }

  /**
   * Calculates the total base stats for a Pokemon
   */
  export function calculateTotalStats(pokemon: PokemonDetail): number {
    return (
      pokemon.stats.hp +
      pokemon.stats.attack +
      pokemon.stats.defense +
      pokemon.stats.specialAttack +
      pokemon.stats.specialDefense +
      pokemon.stats.speed
    );
  }

  // Private helpers (not exported)
  function compareStats(p1: PokemonDetail, p2: PokemonDetail): StatsComparison { /* ... */ }
  function comparePhysical(p1: PokemonDetail, p2: PokemonDetail): PhysicalComparison { /* ... */ }
  function compareTypes(p1: PokemonDetail, p2: PokemonDetail): TypeComparison { /* ... */ }
  function determineWinner(p1Wins: number, p2Wins: number, total: StatComparison): Winner { /* ... */ }
}
```

**Benefits of this pattern:**
- **Discoverability**: `PokemonDetail.` shows all available operations in IDE
- **Co-location**: Logic lives with the data it operates on
- **Pure functions**: Easy to test without DI
- **Tree-shakeable**: Unused functions are eliminated from bundle
- **Works with plain objects**: No class instantiation needed

### 4.5 No Webpack Changes Required

Since state management is in `@domain`, which is already shared via Module Federation, **no webpack configuration changes are needed**. The domain library is already configured as a singleton shared mapping.

---

## 5. Impact Analysis by Project/Library

### 5.1 Domain Library (`projects/domain/`)

| Impact | Description |
|--------|-------------|
| **Level** | � High |
| **Changes** | Major additions: state models, actions, reducers, selectors, effects |
| **Reason** | State management is now part of the domain — this is the core of the migration |

**Files to Create:**

| File | Purpose |
|------|---------|
| `lib/models/state.model.ts` | State interfaces (AppState, CatalogState, etc.) |
| `lib/state/index.ts` | Barrel export for all state artifacts |
| `lib/state/app.state.ts` | Root state interface and feature keys |
| `lib/state/domain.providers.ts` | Provider functions for store setup |
| `lib/state/catalog/*` | Catalog feature state (actions, reducer, selectors, effects) |
| `lib/state/detail/*` | Detail feature state |
| `lib/state/compare/*` | Compare feature state |
| `lib/state/ui/*` | Shared UI state (search, theme) |

**Files to Update:**

| File | Changes |
|------|---------|
| `package.json` | Add @ngrx/* as peerDependencies |
| `public-api.ts` | Export state artifacts, remove service exports |
| `README.md` | Document state management + namespace pattern |
| `models/pokemon-detail.model.ts` | Add namespace with `compare()`, `calculateTotalStats()` |

**Files to Delete:**
- `services/comparison.service.ts` — Logic moves to `PokemonDetail` namespace
- `services/pokemon-catalog.service.ts` — Pass-through; Effects use ports directly
- `services/pokemon-detail.service.ts` — Pass-through; Effects use ports directly

**Existing Files - No Changes:**
- `ports/*.ts` — Port interfaces unchanged (now used directly by Effects)
- `models/pokemon.model.ts` — Unchanged

### 5.2 Infrastructure Library (`projects/infra/`)

| Impact | Description |
|--------|-------------|
| **Level** | 🟢 Low |
| **Changes** | None |
| **Reason** | Adapters implement ports; Effects inject ports directly |

**Files Affected:**
- None

### 5.3 UI Library (`projects/ui/`)

| Impact | Description |
|--------|-------------|
| **Level** | 🟢 Low |
| **Changes** | Potentially minor adjustments for signal-to-observable bridges |
| **Reason** | UI library components are presentational and receive data via inputs |

**Files Affected:**
- Minimal changes, if any

### 5.4 Host Application (`projects/host/`)

| Impact | Description |
|--------|-------------|
| **Level** | 🟡 Medium |
| **Changes** | Store initialization, DevTools setup |
| **Reason** | Host bootstraps the root store using providers from `@domain` |

**Files Affected:**

| File | Changes |
|------|---------|
| [app.config.ts](../projects/host/src/app/app.config.ts) | Add `provideStore()`, `provideEffects()`, `provideStoreDevtools()` from domain |
| [main.ts](../projects/host/src/main.ts) | No changes |
| [webpack.config.js](../projects/host/webpack.config.js) | No changes (domain already shared) |

### 5.5 Remote Catalog (`projects/remote-catalog/`)

| Impact | Description |
|--------|-------------|
| **Level** | 🔴 High |
| **Changes** | Refactor PokeCatalog to use store selectors and dispatch actions |
| **Reason** | Heaviest state management of all remotes |

**Files Affected:**

| File | Current State | Required Changes |
|------|---------------|------------------|
| [catalog.module.ts](../projects/remote-catalog/src/app/catalog/catalog.module.ts) | Provides domain services | Update providers to use domain state |
| [poke-catalog.ts](../projects/remote-catalog/src/app/catalog/components/poke-catalog/poke-catalog.ts) | Signals + RxJS subscriptions | Inject `Store`, use selectors, dispatch actions |
| [pokemon-card.ts](../projects/remote-catalog/src/app/catalog/components/pokemon-card/pokemon-card.ts) | Presentational | Minimal changes (receive data via inputs) |
| [webpack.config.js](../projects/remote-catalog/webpack.config.js) | Standard config | No changes (domain already shared) |

### 5.6 Remote Detail (`projects/remote-detail/`)

| Impact | Description |
|--------|-------------|
| **Level** | 🔴 High |
| **Changes** | Refactor PokeDetail to use store |
| **Reason** | Manages Pokemon detail state and search |

**Files Affected:**

| File | Current State | Required Changes |
|------|---------------|------------------|
| [detail.module.ts](../projects/remote-detail/src/app/detail/detail.module.ts) | Provides domain services | Update providers to use domain state |
| [poke-detail.ts](../projects/remote-detail/src/app/detail/components/poke-detail/poke-detail.ts) | Signals + RxJS | Inject `Store`, use selectors, dispatch actions |
| [webpack.config.js](../projects/remote-detail/webpack.config.js) | Standard config | No changes (domain already shared) |

### 5.7 Remote Compare (`projects/remote-compare/`)

| Impact | Description |
|--------|-------------|
| **Level** | 🔴 High |
| **Changes** | Refactor PokeCompare to use store |
| **Reason** | Comparison state and selected Pokemon management |

**Files Affected:**

| File | Current State | Required Changes |
|------|---------------|------------------|
| [compare.module.ts](../projects/remote-compare/src/app/compare/compare.module.ts) | Provides domain services | Update providers to use domain state |
| [poke-compare.ts](../projects/remote-compare/src/app/compare/components/poke-compare/poke-compare.ts) | Signals + RxJS | Inject `Store`, use selectors, dispatch actions |
| [webpack.config.js](../projects/remote-compare/webpack.config.js) | Standard config | No changes (domain already shared) |

---

## 6. Component-Level Breakdown

### 6.1 PokeCatalog Component

**Current Implementation:**
```typescript
// Current signals
readonly currentPage = signal(1);
readonly pageSize = signal(20);
readonly searchQuery = signal('');
readonly isLoading = signal(true);
readonly pokemonList = signal<PokemonSummary[]>([]);
readonly totalItems = signal(0);
readonly selectedPokemon = signal<PokemonSummary[]>([]);
```

**Target Implementation:**
```typescript
// NgRx Selectors
pokemonList$ = this.store.select(selectPokemonList);
pagination$ = this.store.select(selectPagination);
isLoading$ = this.store.select(selectCatalogLoading);
selectedForComparison$ = this.store.select(selectSelectedForComparison);

// Local UI signals (kept for template performance)
readonly selectedIds = toSignal(
  this.store.select(selectSelectedIds),
  { initialValue: new Set<number>() }
);

// Actions
onPageChange(event: PageChangeEvent): void {
  this.store.dispatch(CatalogActions.changePage({ 
    page: event.page, 
    pageSize: event.pageSize 
  }));
}

onSearch(query: string): void {
  this.store.dispatch(CatalogActions.search({ query }));
}

onSelectionChange(event: { pokemon: PokemonSummary; selected: boolean }): void {
  if (event.selected) {
    this.store.dispatch(CompareActions.selectPokemon({ pokemon: event.pokemon }));
  } else {
    this.store.dispatch(CompareActions.deselectPokemon({ pokemonId: event.pokemon.id }));
  }
}
```

**Required Actions:**
```typescript
// catalog.actions.ts
export const CatalogActions = createActionGroup({
  source: 'Catalog',
  events: {
    'Load Pokemon': emptyProps(),
    'Load Pokemon Success': props<{ page: PokemonPage }>(),
    'Load Pokemon Failure': props<{ error: string }>(),
    'Change Page': props<{ page: number; pageSize: number }>(),
    'Search': props<{ query: string }>(),
    'Clear Search': emptyProps(),
  }
});
```

### 6.2 PokeDetail Component

**Current Implementation:**
```typescript
readonly pokemon = signal<PokemonDetail | null>(null);
readonly isLoading = signal(true);
readonly error = signal<string | null>(null);
readonly searchQuery = signal('');
readonly searchResults = signal<PokemonSummary[]>([]);
```

**Target Implementation:**
```typescript
// NgRx Selectors
pokemon$ = this.store.select(selectSelectedPokemon);
isLoading$ = this.store.select(selectDetailLoading);
error$ = this.store.select(selectDetailError);
searchResults$ = this.store.select(selectSearchResults);

// Actions
ngOnInit(): void {
  this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
    const id = params['id'];
    if (id) {
      this.store.dispatch(DetailActions.loadPokemon({ id: +id }));
    }
  });
}

onSearchChange(value: string): void {
  this.store.dispatch(UIActions.setSearchQuery({ query: value }));
  this.store.dispatch(CatalogActions.searchPokemon({ query: value, limit: 5 }));
}
```

**Required Actions:**
```typescript
// detail.actions.ts
export const DetailActions = createActionGroup({
  source: 'Detail',
  events: {
    'Load Pokemon': props<{ id: number }>(),
    'Load Pokemon By Name': props<{ name: string }>(),
    'Load Pokemon Success': props<{ pokemon: PokemonDetail }>(),
    'Load Pokemon Failure': props<{ error: string }>(),
    'Clear Selected': emptyProps(),
  }
});
```

### 6.3 PokeCompare Component

**Current Implementation:**
```typescript
readonly comparison = signal<PokemonComparison | null>(null);
readonly isLoading = signal(true);
readonly error = signal<string | null>(null);
readonly statsArray = signal<StatComparison[]>([]);
```

**Target Implementation:**
```typescript
// NgRx Selectors
comparison$ = this.store.select(selectComparison);
isLoading$ = this.store.select(selectCompareLoading);
error$ = this.store.select(selectCompareError);
statsArray$ = this.store.select(selectStatsArray);

// Actions
ngOnInit(): void {
  this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
    const id1 = params['pokemon1'];
    const id2 = params['pokemon2'];
    if (id1 && id2) {
      this.store.dispatch(CompareActions.loadComparison({ id1: +id1, id2: +id2 }));
    }
  });
}
```

**Required Actions:**
```typescript
// compare.actions.ts
export const CompareActions = createActionGroup({
  source: 'Compare',
  events: {
    'Select Pokemon': props<{ pokemon: PokemonSummary }>(),
    'Deselect Pokemon': props<{ pokemonId: number }>(),
    'Clear Selection': emptyProps(),
    'Load Comparison': props<{ id1: number; id2: number }>(),
    'Load Comparison Success': props<{ comparison: PokemonComparison }>(),
    'Load Comparison Failure': props<{ error: string }>(),
  }
});
```

---

## 7. Migration Phases

### Phase 1: Foundation (Week 1)

**Goals:**
- Set up NgRx infrastructure within the domain library
- Create state directory structure
- Define root state interfaces

**Tasks:**

| # | Task | Estimated Effort |
|---|------|-----------------|
| 1.1 | Install NgRx dependencies (root + domain peerDeps) | 0.5h |
| 1.2 | Create `lib/state/` directory structure in domain | 1h |
| 1.3 | Create state model interfaces (`lib/models/state.model.ts`) | 2h |
| 1.4 | Create `lib/state/app.state.ts` with root state and feature keys | 1h |
| 1.5 | Create `lib/state/domain.providers.ts` with NgRx provider functions | 2h |
| 1.6 | Update domain `public-api.ts` to export state artifacts | 0.5h |
| 1.7 | Configure store in host app using domain providers | 1.5h |
| 1.8 | Verify store loads in DevTools | 1h |
| | **Phase 1 Total** | **9.5h** |

**Deliverables:**
- [ ] State directory structure created in domain
- [ ] Root state interfaces defined
- [ ] `PokemonDetail` namespace with `compare()` and `calculateTotalStats()`
- [ ] Services directory removed
- [ ] Store provider functions exported from domain
- [ ] Host bootstraps store
- [ ] Redux DevTools showing empty state

### Phase 2: Catalog Feature Migration (Week 2)

**Goals:**
- Migrate catalog state management to NgRx within domain
- Implement catalog actions, reducer, effects, and selectors

**Tasks:**

| # | Task | Estimated Effort |
|---|------|-----------------|
| 2.1 | Create `lib/state/catalog/catalog.actions.ts` | 1h |
| 2.2 | Create `lib/state/catalog/catalog.reducer.ts` | 2h |
| 2.3 | Create `lib/state/catalog/catalog.selectors.ts` | 1.5h |
| 2.4 | Create `lib/state/catalog/catalog.effects.ts` (injects ports directly) | 3h |
| 2.5 | Write unit tests for reducer | 2h |
| 2.6 | Write unit tests for selectors | 1h |
| 2.7 | Write unit tests for effects | 2h |
| 2.8 | Refactor `PokeCatalog` component to use store | 4h |
| 2.9 | Update `catalog.module.ts` providers | 1h |
| 2.10 | End-to-end testing of catalog feature | 2h |
| | **Phase 2 Total** | **19.5h** |

**Deliverables:**
- [ ] Catalog state in NgRx store
- [ ] PokeCatalog using selectors and dispatch
- [ ] Unit tests passing
- [ ] Catalog functionality unchanged

### Phase 3: Detail Feature Migration (Week 3)

**Goals:**
- Migrate detail state to NgRx within domain
- Implement caching for Pokemon details

**Tasks:**

| # | Task | Estimated Effort |
|---|------|-----------------|
| 3.1 | Create `lib/state/detail/detail.actions.ts` | 1h |
| 3.2 | Create `lib/state/detail/detail.reducer.ts` with caching logic | 2h |
| 3.3 | Create `lib/state/detail/detail.selectors.ts` | 1h |
| 3.4 | Create `lib/state/detail/detail.effects.ts` | 2.5h |
| 3.5 | Write unit tests | 4h |
| 3.6 | Refactor `PokeDetail` component to use store | 3h |
| 3.7 | Update `detail.module.ts` providers | 1h |
| 3.8 | Test navigation from catalog to detail (state persistence) | 1.5h |
| | **Phase 3 Total** | **16h** |

**Deliverables:**
- [ ] Detail state in NgRx store
- [ ] Pokemon detail caching working
- [ ] Navigation preserves state

### Phase 4: Compare Feature Migration (Week 4)

**Goals:**
- Migrate compare state to NgRx within domain
- Connect selection from catalog to compare

**Tasks:**

| # | Task | Estimated Effort |
|---|------|-----------------|
| 4.1 | Create `lib/state/compare/compare.actions.ts` | 1h |
| 4.2 | Create `lib/state/compare/compare.reducer.ts` | 2h |
| 4.3 | Create `lib/state/compare/compare.selectors.ts` | 1.5h |
| 4.4 | Create `lib/state/compare/compare.effects.ts` | 2.5h |
| 4.5 | Write unit tests | 4h |
| 4.6 | Refactor `PokeCompare` component to use store | 3h |
| 4.7 | Update `compare.module.ts` providers | 1h |
| 4.8 | Test full selection-to-comparison flow | 2h |
| | **Phase 4 Total** | **17h** |

**Deliverables:**
- [ ] Compare state in NgRx store
- [ ] Selection persists from catalog to compare
- [ ] Full comparison flow working

### Phase 5: UI State & Polish (Week 5)

**Goals:**
- Migrate shared UI state (search, theme) within domain
- Clean up any remaining signal-based state
- Performance optimization

**Tasks:**

| # | Task | Estimated Effort |
|---|------|-----------------|
| 5.1 | Create `lib/state/ui/` state slice | 2h |
| 5.2 | Integrate search query across features | 3h |
| 5.3 | Add theme state (if applicable) | 1h |
| 5.4 | Performance audit and optimization | 4h |
| 5.5 | Code cleanup and refactoring | 3h |
| 5.6 | Final integration testing | 4h |
| | **Phase 5 Total** | **17h** |

**Deliverables:**
- [ ] Shared UI state working
- [ ] Performance acceptable
- [ ] All features functional

### Phase 6: Documentation & Cleanup (Week 6)

**Goals:**
- Update all documentation
- Clean up deprecated code
- Knowledge transfer

**Tasks:**

| # | Task | Estimated Effort |
|---|------|-----------------|
| 6.1 | Update architecture documentation | 4h |
| 6.2 | Update data flow documentation | 3h |
| 6.3 | Create NgRx state documentation | 4h |
| 6.4 | Update component documentation | 2h |
| 6.5 | Update README files | 2h |
| 6.6 | Remove deprecated code | 2h |
| 6.7 | Final code review | 3h |
| | **Phase 6 Total** | **20h** |

**Deliverables:**
- [ ] All documentation updated
- [ ] Clean codebase
- [ ] Knowledge transfer complete

### Total Estimated Effort

| Phase | Hours |
|-------|-------|
| Phase 1: Foundation | 12h |
| Phase 2: Catalog Migration | 19.5h |
| Phase 3: Detail Migration | 16h |
| Phase 4: Compare Migration | 17h |
| Phase 5: UI State & Polish | 17h |
| Phase 6: Documentation | 20h |
| **Total** | **101.5h** |

---

## 8. Documentation Updates

### 8.1 New Documentation

| Document | Location | Description |
|----------|----------|-------------|
| Domain State Management | `projects/domain/README.md` (section) | Document state management within domain |
| NgRx Architecture Guide | `docs/architecture/ngrx-state-management.md` | Detailed NgRx patterns and conventions |

### 8.2 Documents to Update

| Document | Changes Required |
|----------|-----------------|
| [hexagonal-architecture.md](../architecture/hexagonal-architecture.md) | Update diagram to show NgRx within domain, explain why state is domain |
| [data-flow.md](../architecture/data-flow.md) | Update flow diagrams to include store dispatch/select patterns |
| [microfrontend-setup.md](../architecture/microfrontend-setup.md) | Document how store is shared (via domain singleton) |
| [README.md](../README.md) (root) | Add NgRx to tech stack |
| [domain/README.md](../projects/domain/README.md) | Major update: document state management, actions, selectors, effects |
| [AGENTS.md](../AGENTS.md) | Add NgRx patterns to coding guidelines |

### 8.3 Proposed Domain README Section: State Management

```markdown
## State Management

The domain library includes NgRx-based state management as an integral part of the business logic.

### Why State is Domain

Application state — what Pokemon are loaded, pagination rules, caching strategies, 
comparison selection limits — these are all **business concerns**, not infrastructure 
or UI concerns. Therefore, state management lives within the domain.

### Rich Domain Models

Business logic is co-located with model definitions using TypeScript namespaces:

\`\`\`typescript
import { PokemonDetail } from '@domain';

// Use namespace functions for domain logic
const comparison = PokemonDetail.compare(pokemon1, pokemon2);
const totalStats = PokemonDetail.calculateTotalStats(pokemon);
\`\`\`

This pattern provides:
- **Discoverability**: `PokemonDetail.` shows all available operations
- **Co-location**: Logic lives with the data it operates on  
- **Pure functions**: Easy to test, no DI required
- **Tree-shakeable**: Unused functions eliminated from bundle

### State Structure

- `CatalogState`: Pokemon list, pagination, filters
- `DetailState`: Selected Pokemon, cache
- `CompareState`: Selected Pokemon for comparison, comparison results
- `UIState`: Shared UI state (search query, theme)

### Usage in Components

Components dispatch actions and select state:

\`\`\`typescript
// Inject store
private readonly store = inject(Store);

// Select state
pokemonList$ = this.store.select(selectPokemonList);

// Dispatch actions
this.store.dispatch(CatalogActions.loadPokemon());
\`\`\`

### Provider Setup

Host application bootstraps the store:

\`\`\`typescript
import { provideDomainState } from '@domain';

export const appConfig = {
  providers: [
    provideDomainState(),  // Provides store, effects, devtools
    // ... other providers
  ]
};
\`\`\`
```

---

## 9. Testing Strategy

### 9.1 Unit Testing

**Reducers:**
```typescript
describe('catalogReducer', () => {
  it('should return initial state', () => {
    const action = { type: 'UNKNOWN' };
    const state = catalogReducer(undefined, action);
    expect(state).toEqual(initialCatalogState);
  });

  it('should set loading on loadPokemon', () => {
    const action = CatalogActions.loadPokemon();
    const state = catalogReducer(initialCatalogState, action);
    expect(state.loading).toBe(true);
  });
});
```

**Selectors:**
```typescript
describe('Catalog Selectors', () => {
  it('should select pokemon list', () => {
    const result = selectPokemonList.projector(mockCatalogState);
    expect(result).toEqual(mockCatalogState.pokemon);
  });
});
```

**Effects:**
```typescript
describe('CatalogEffects', () => {
  it('should load pokemon on loadPokemon action', () => {
    actions$ = hot('-a', { a: CatalogActions.loadPokemon() });
    const expected = cold('-b', { 
      b: CatalogActions.loadPokemonSuccess({ page: mockPage }) 
    });
    expect(effects.loadPokemon$).toBeObservable(expected);
  });
});
```

### 9.2 Integration Testing

- Test store initialization across microfrontends
- Test state persistence during navigation
- Test action dispatching from components

### 9.3 E2E Testing

- Full user flows (catalog → detail → compare)
- State inspection via Redux DevTools
- Performance benchmarks

---

## 10. Risks and Mitigations

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| NgRx dependency in domain library | Low | Medium | NgRx is a stable, well-maintained library; peerDependencies keep it optional |
| Domain library size increase | Low | Low | State code is lightweight; tree-shaking removes unused exports |
| Module Federation singleton issues | Medium | High | Domain already works as singleton; verify store instance is shared |
| Performance degradation | Low | Medium | Use selectors with memoization, monitor bundle size |
| Breaking existing functionality | Medium | High | Feature flags, parallel implementation, comprehensive tests |
| Angular/NgRx version incompatibility | Low | High | Check compatibility before starting (Angular 21 + NgRx 19) |

### 10.2 Process Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep | Medium | Medium | Strict phase boundaries, MVP approach |
| Underestimated effort | Medium | Medium | Buffer time in estimates, early communication |
| Learning curve | Low | Low | NgRx is well-documented; patterns are established |

### 10.3 Architectural Benefits (Risk Mitigation)

Integrating state into domain (vs. separate library) reduces several risks:

1. **No new library to maintain** — fewer moving parts
2. **No webpack changes** — domain is already shared correctly
3. **Simpler dependency graph** — state follows existing domain sharing
4. **Cohesive testing** — state tests live alongside service tests

### 10.3 Rollback Strategy

If critical issues arise:

1. **Phase-level rollback**: Each phase is independently revertable
2. **Feature flags**: Components can switch between signal and NgRx implementations
3. **Parallel implementation**: Keep original signal implementation until phase is validated

---

## Appendix A: Commands Reference

### Dependency Installation
```bash
# Install NgRx packages
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools @ngrx/entity

# Install NgRx schematics (dev)
npm install -D @ngrx/schematics
```

### Manual File Creation (Preferred)
Since state is integrated into an existing library, manual file creation is recommended:

```bash
# Create state directory structure
mkdir -p projects/domain/src/lib/state/{catalog,detail,compare,ui}

# Create state files
touch projects/domain/src/lib/state/index.ts
touch projects/domain/src/lib/state/app.state.ts
touch projects/domain/src/lib/state/domain.providers.ts

# Create feature files (repeat for detail, compare, ui)
touch projects/domain/src/lib/state/catalog/index.ts
touch projects/domain/src/lib/state/catalog/catalog.actions.ts
touch projects/domain/src/lib/state/catalog/catalog.reducer.ts
touch projects/domain/src/lib/state/catalog/catalog.selectors.ts
touch projects/domain/src/lib/state/catalog/catalog.effects.ts
```

### Testing
```bash
# Run domain library tests (includes state tests)
ng test domain

# Run with coverage
ng test domain --code-coverage
```

---

## Appendix B: Code Templates

### Action Template
```typescript
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const FeatureActions = createActionGroup({
  source: 'Feature',
  events: {
    'Load Data': emptyProps(),
    'Load Data Success': props<{ data: DataType }>(),
    'Load Data Failure': props<{ error: string }>(),
  }
});
```

### Reducer Template
```typescript
import { createReducer, on } from '@ngrx/store';
import { FeatureActions } from './feature.actions';

export interface FeatureState {
  data: DataType | null;
  loading: boolean;
  error: string | null;
}

export const initialState: FeatureState = {
  data: null,
  loading: false,
  error: null
};

export const featureReducer = createReducer(
  initialState,
  on(FeatureActions.loadData, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(FeatureActions.loadDataSuccess, (state, { data }) => ({
    ...state,
    data,
    loading: false
  })),
  on(FeatureActions.loadDataFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);
```

### Selector Template
```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FeatureState } from './feature.reducer';

export const selectFeatureState = createFeatureSelector<FeatureState>('feature');

export const selectData = createSelector(
  selectFeatureState,
  state => state.data
);

export const selectLoading = createSelector(
  selectFeatureState,
  state => state.loading
);

export const selectError = createSelector(
  selectFeatureState,
  state => state.error
);
```

### Effect Template (Using Ports Directly)
```typescript
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';
import { FeatureActions } from './feature.actions';
import { POKEMON_REPOSITORY } from '../../ports/pokemon.repository';

@Injectable()
export class FeatureEffects {
  private readonly actions$ = inject(Actions);
  private readonly repository = inject(POKEMON_REPOSITORY);  // Inject port directly

  loadData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeatureActions.loadData),
      switchMap(({ pagination, filter }) =>
        this.repository.getPokemonList(pagination, filter).pipe(
          map(page => FeatureActions.loadDataSuccess({ page })),
          catchError(error => of(FeatureActions.loadDataFailure({ 
            error: error.message 
          })))
        )
      )
    )
  );
}
```

### Compare Effect Template (Using Namespace Functions)
```typescript
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, forkJoin } from 'rxjs';
import { CompareActions } from './compare.actions';
import { POKEMON_DETAIL_REPOSITORY } from '../../ports/pokemon-detail.repository';
import { PokemonDetail } from '../../models/pokemon-detail.model';  // Interface + namespace

@Injectable()
export class CompareEffects {
  private readonly actions$ = inject(Actions);
  private readonly detailRepository = inject(POKEMON_DETAIL_REPOSITORY);

  loadComparison$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CompareActions.loadComparison),
      switchMap(({ id1, id2 }) =>
        forkJoin([
          this.detailRepository.getPokemonDetail(id1),
          this.detailRepository.getPokemonDetail(id2)
        ]).pipe(
          map(([p1, p2]) => CompareActions.loadComparisonSuccess({ 
            comparison: PokemonDetail.compare(p1, p2)  // <-- Namespace function!
          })),
          catchError(error => of(CompareActions.loadComparisonFailure({ 
            error: error.message 
          })))
        )
      )
    )
  );
}
```

### Domain Providers Template
```typescript
// projects/domain/src/lib/state/domain.providers.ts
import { EnvironmentProviders, makeEnvironmentProviders, isDevMode } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { catalogReducer } from './catalog/catalog.reducer';
import { detailReducer } from './detail/detail.reducer';
import { compareReducer } from './compare/compare.reducer';
import { uiReducer } from './ui/ui.reducer';

import { CatalogEffects } from './catalog/catalog.effects';
import { DetailEffects } from './detail/detail.effects';
import { CompareEffects } from './compare/compare.effects';

/**
 * Provides NgRx state management for the domain.
 * Call this in the host application's providers.
 */
export function provideDomainState(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideStore({
      catalog: catalogReducer,
      detail: detailReducer,
      compare: compareReducer,
      ui: uiReducer
    }),
    provideEffects([
      CatalogEffects,
      DetailEffects,
      CompareEffects
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true
    })
  ]);
}
```

### Host App Configuration
```typescript
// projects/host/src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideDomainState } from '@domain';

import { APP_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(APP_ROUTES),
    provideDomainState()  // <-- NgRx state from domain
  ]
};
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-02 | - | Initial draft |
| 1.1 | 2025-12-02 | - | Services removed; namespace pattern for domain logic (`PokemonDetail.compare()`) |

---

## Related Documents

- [Hexagonal Architecture](../architecture/hexagonal-architecture.md)
- [Data Flow](../architecture/data-flow.md)
- [Microfrontend Setup](../architecture/microfrontend-setup.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
