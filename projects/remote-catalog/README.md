# Remote Catalog

The **Remote Catalog** microfrontend provides the Pokemon catalog listing feature, allowing users to browse, search, and select Pokemon from a paginated list.

## Purpose

This microfrontend handles:
- **Pokemon Listing** - Display paginated grid of Pokemon cards
- **Search** - Search Pokemon by name or ID
- **Navigation** - Navigate to detail pages when Pokemon are selected
- **Selection** - Store selected Pokemon for comparison

## Exposed Module

This microfrontend exposes `CatalogModule` via Module Federation:

```javascript
// webpack.config.js
exposes: {
  './CatalogModule': './projects/remote-catalog/src/app/catalog/catalog.module.ts',
}
```

**Remote Name:** `remote-catalog`  
**Port:** `4210` (development)

## Directory Structure

```
projects/remote-catalog/src/app/
├── catalog/
│   ├── catalog.module.ts        # Entry module (exposed)
│   ├── catalog.routes.ts        # Internal routing
│   └── components/
│       ├── poke-catalog/        # Main catalog component
│       └── pokemon-card/        # Pokemon card component
└── components/
    └── (shared components if any)
```

## Features

### 1. Pokemon Grid Display

Displays Pokemon in a responsive grid layout with:
- Pokemon sprite image
- Pokemon name (capitalized)
- Pokemon ID (#001, #002, etc.)
- Type badges

### 2. Pagination

Navigate through Pokemon with:
- Previous/Next buttons
- Page size selection (10, 20, 50 per page)
- Total count display
- Current page indicator

### 3. Search Functionality

Search Pokemon by:
- Name (partial matching)
- ID number
- Real-time filtering as you type

### 4. Pokemon Selection

Click on Pokemon cards to:
- Navigate to detail view
- Add to comparison list (via domain service)

## Components

### PokeCatalog

Main container component managing the catalog feature.

**Responsibilities:**
- Fetch Pokemon list from `PokemonCatalogService`
- Handle pagination state
- Handle search queries
- Render Pokemon grid

**Key Features:**
- Uses Angular Signals for reactive state
- Integrates with `PaginatedList` molecule from UI library
- Error handling for API failures

**Location:** `catalog/components/poke-catalog/`

### PokemonCard

Presentational component displaying individual Pokemon information.

**Inputs:**
- `pokemon: PokemonSummary` - Pokemon data to display

**Outputs:**
- `cardClick: EventEmitter<number>` - Emits Pokemon ID when clicked

**Features:**
- Displays Pokemon sprite
- Shows Pokemon types with color coding
- Hover effects
- Responsive sizing

**Location:** `catalog/components/pokemon-card/`

## Routes

Internal routing configuration:

```typescript
export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    component: PokeCatalog
  }
];
```

**Accessed via Host:** `/catalog`

### Navigation Examples

| Action | Navigation | Description |
|--------|------------|-------------|
| View catalog | `/catalog` | Main Pokemon list |
| Click Pokemon | `/detail/:id` | Navigate to detail (via router) |
| Add to compare | (stays on page) | Stores in ComparisonService |

## Dependencies

### Domain Services

- **`PokemonCatalogService`** - Business logic for fetching Pokemon
- **`ComparisonService`** - Manages Pokemon comparison state

### Infrastructure

- **`PokeApiAdapter`** - Implements `PokemonRepository` port

### UI Components

- **`PaginatedList`** - Container with pagination controls
- **`Searchbar`** - Search input component
- **`Stack`**, **`Container`**, **`Box`** - Layout primitives
- **`Cluster`**, **`Frame`**, **`Center`** - Layout helpers

## Module Configuration

```typescript
@NgModule({
  imports: [
    PaginatedList, 
    Searchbar,  
    Stack, 
    Container,
    Box, 
    Cluster, 
    Frame, 
    Center,
    RouterModule.forChild(CATALOG_ROUTES)
  ],
  declarations: [PokeCatalog, PokemonCard],
  providers: [
    provideHttpClient(),
    { provide: POKEMON_REPOSITORY, useClass: PokeApiAdapter },
    ComparisonService,
    { provide: POKEMON_CATALOG_SERVICE, useClass: PokemonCatalogService }
  ]
})
export class CatalogModule {}
```

**Key Points:**
- Provides own instance of domain services
- Binds `PokeApiAdapter` to `POKEMON_REPOSITORY` port
- Uses `forChild` routing to integrate with host router

## Running

### Standalone Development

Run the catalog microfrontend independently:

```bash
ng serve remote-catalog
```

Access at: `http://localhost:4210`

> **Note:** Running standalone requires the infrastructure adapters to be available (which they are as they're in `@infra`).

### With Host

Start all applications:

```bash
npm run run:all
```

Access via host at: `http://localhost:4200/catalog`

## Building

Build the microfrontend:

```bash
ng build remote-catalog
```

Build artifacts include:
- `remoteEntry.js` - Module Federation entry point
- Chunked JavaScript files
- Assets and stylesheets

## Testing

Run unit tests:

```bash
ng test remote-catalog
```

**Testing Focus:**
- Component rendering with mock data
- Search filtering logic
- Pagination state management
- Event emission from PokemonCard
- Error handling

## State Management

### Local State

The catalog uses component-level Signals for:
- Current page number
- Page size
- Search query
- Pokemon list
- Loading state
- Error state

### Shared State

Uses `ComparisonService` (from domain) for:
- Selected Pokemon for comparison
- Shared across catalog and compare features

**Example:**
```typescript
// In PokeCatalog
private comparisonService = inject(ComparisonService);

addToComparison(pokemonId: number) {
  this.comparisonService.addPokemon(pokemonId);
}
```

## Performance Optimizations

### Lazy Loading

- Module only loads when user navigates to `/catalog`
- Reduces initial bundle size for host application

### Pagination

- Fetches only current page of Pokemon
- Reduces API calls and memory usage

### OnPush Change Detection

Components use `ChangeDetectionStrategy.OnPush` for optimal performance:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Image Optimization

- Uses Pokemon sprites (small file size)
- Lazy loads images with `loading="lazy"` attribute
- Caches images in browser

## Accessibility

- **Keyboard Navigation** - Tab through Pokemon cards
- **ARIA Labels** - Screen reader support for cards
- **Focus Indicators** - Clear focus states
- **Semantic HTML** - Proper heading hierarchy

## Styling

### Theme Support

Respects theme toggle from host application:
- Light mode
- Dark mode
- Uses CSS custom properties from UI library

### Responsive Design

Grid adapts to screen sizes:
- Mobile: 1 column
- Tablet: 2-3 columns
- Desktop: 4-5 columns

## Troubleshooting

### Pokemon Not Loading

**Symptoms:** Empty grid or loading spinner stuck

**Solutions:**
1. Check browser console for API errors
2. Verify PokeAPI is accessible: `https://pokeapi.co/api/v2/pokemon`
3. Check network tab for failed requests
4. Verify `PokeApiAdapter` is properly provided

### Search Not Working

**Symptoms:** Search input doesn't filter results

**Solutions:**
1. Check if search is implemented client-side or server-side
2. Verify search query is being passed to service
3. Check network requests include search parameter

### Navigation to Detail Fails

**Symptoms:** Clicking Pokemon card doesn't navigate

**Solutions:**
1. Verify router is configured in host
2. Check detail remote is running (port 4220)
3. Check browser console for routing errors

## Future Enhancements

- [ ] Infinite scroll instead of pagination
- [ ] Filter by Pokemon type
- [ ] Sort options (by ID, name, type)
- [ ] Favorites/bookmark feature
- [ ] Grid/list view toggle
- [ ] Skeleton loading states

## Related Documentation

- [Host Application](../host/README.md)
- [Domain Library](../domain/README.md) - Business logic used
- [UI Library](../ui/README.md) - Components used
- [Module Federation Setup](../../docs/architecture/microfrontend-setup.md)
