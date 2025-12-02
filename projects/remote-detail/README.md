# Remote Detail

The **Remote Detail** microfrontend provides the individual Pokemon detail view, displaying comprehensive information about a single Pokemon including stats, types, abilities, and visual representations.

## Purpose

This microfrontend handles:
- **Pokemon Detail View** - Display complete Pokemon information
- **Stats Visualization** - Show base stats (HP, Attack, Defense, etc.)
- **Type Display** - Visual type badges with colors
- **Abilities** - List Pokemon abilities
- **Physical Info** - Height, weight, and other characteristics
- **Navigation** - Navigate back to catalog or to comparison

## Exposed Module

This microfrontend exposes `DetailModule` via Module Federation:

```javascript
// webpack.config.js
exposes: {
  './DetailModule': './projects/remote-detail/src/app/detail/detail.module.ts',
}
```

**Remote Name:** `remote-detail`  
**Port:** `4220` (development)

## Directory Structure

```
projects/remote-detail/src/app/
├── detail/
│   ├── detail.module.ts         # Entry module (exposed)
│   ├── detail.routes.ts         # Internal routing
│   └── components/
│       └── poke-detail/         # Main detail component
└── components/
    └── (shared components if any)
```

## Features

### 1. Pokemon Information Display

Shows comprehensive Pokemon data:
- **Official Artwork** - High-quality Pokemon image
- **Basic Info** - Name, ID, types
- **Physical Characteristics** - Height, weight
- **Pokedex Entry** - Pokemon description (if available)

### 2. Stats Display

Visual representation of base stats:
- HP (Hit Points)
- Attack
- Defense
- Special Attack
- Special Defense
- Speed

**Visualization Options:**
- Bar charts
- Radar/spider charts
- Numeric values with progress bars

### 3. Type Information

Displays Pokemon types with:
- Type badges (color-coded)
- Type effectiveness information (optional)
- Dual-type combinations

### 4. Abilities

Lists Pokemon abilities:
- Ability name
- Ability description
- Hidden abilities (if any)

### 5. Quick Actions

- **Add to Comparison** - Add this Pokemon to comparison list
- **Navigate to Comparison** - Go to comparison page if two Pokemon selected
- **Back to Catalog** - Return to Pokemon list

## Components

### PokeDetail

Main component displaying Pokemon details.

**Route Parameter:**
- `id: string` - Pokemon ID from route (e.g., `/detail/25` for Pikachu)

**Responsibilities:**
- Fetch Pokemon details from `PokemonDetailService`
- Display Pokemon information in organized layout
- Handle loading and error states
- Integrate with comparison service

**Key Features:**
- Uses Angular Signals for reactive state
- Route parameter extraction with `ActivatedRoute`
- Error handling for non-existent Pokemon
- Responsive layout with Sidebar/Switcher layouts

**Location:** `detail/components/poke-detail/`

## Routes

Internal routing configuration:

```typescript
export const DETAIL_ROUTES: Routes = [
  {
    path: ':id',
    component: PokeDetail
  }
];
```

**Accessed via Host:** `/detail/:id`

### Navigation Examples

| URL | Pokemon | Description |
|-----|---------|-------------|
| `/detail/1` | Bulbasaur | Detail for Pokemon ID 1 |
| `/detail/25` | Pikachu | Detail for Pokemon ID 25 |
| `/detail/150` | Mewtwo | Detail for Pokemon ID 150 |

## Dependencies

### Domain Services

- **`PokemonDetailService`** - Business logic for fetching Pokemon details
- **`PokemonCatalogService`** - For quick search/navigation features
- **`ComparisonService`** - Manages Pokemon comparison state

### Infrastructure

- **`PokeApiDetailAdapter`** - Implements `PokemonDetailRepository` port
- **`PokeApiAdapter`** - Implements `PokemonRepository` port (for search)

### UI Components

- **`Box`**, **`Stack`**, **`Cluster`** - Layout primitives
- **`Center`**, **`Frame`** - Layout helpers
- **`Button`** - Action buttons
- **`Sidebar`**, **`Switcher`** - Responsive layouts
- **`Searchbar`** - Quick Pokemon search (optional)

## Module Configuration

```typescript
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DETAIL_ROUTES),
    Box, Center, Cluster, Stack, Frame,
    Button, Sidebar, Searchbar, Switcher
  ],
  declarations: [PokeDetail],
  providers: [
    provideHttpClient(),
    { provide: POKEMON_DETAIL_REPOSITORY, useClass: PokeApiDetailAdapter },
    { provide: POKEMON_REPOSITORY, useClass: PokeApiAdapter },
    ComparisonService,
    { provide: POKEMON_DETAIL_SERVICE, useClass: PokemonDetailService },
    { provide: POKEMON_CATALOG_SERVICE, useClass: PokemonCatalogService }
  ]
})
export class DetailModule {}
```

**Key Points:**
- Provides both detail and catalog services (for additional features)
- Binds adapters to repository ports
- Uses `forChild` routing for integration with host

## Running

### Standalone Development

Run the detail microfrontend independently:

```bash
ng serve remote-detail
```

Access at: `http://localhost:4220/25` (for Pikachu)

### With Host

Start all applications:

```bash
npm run run:all
```

Access via host at: `http://localhost:4200/detail/25`

## Building

Build the microfrontend:

```bash
ng build remote-detail
```

Build artifacts include:
- `remoteEntry.js` - Module Federation entry point
- Chunked JavaScript files
- Assets and stylesheets

## Testing

Run unit tests:

```bash
ng test remote-detail
```

**Testing Focus:**
- Component rendering with mock Pokemon data
- Route parameter extraction
- Error handling (invalid ID, API errors)
- Add to comparison functionality
- Chart rendering (if charts are used)
- Loading state display

## Data Flow

```
User navigates to /detail/25
           ↓
PokeDetail component activates
           ↓
Extract route param (id = 25)
           ↓
PokemonDetailService.getPokemonDetail(25)
           ↓
PokeApiDetailAdapter.getPokemonDetail(25)
           ↓
HTTP GET https://pokeapi.co/api/v2/pokemon/25
           ↓
Transform API response to PokemonDetail model
           ↓
Display in component
```

## Chart Integration

If using charts (e.g., ng2-charts or Chart.js):

### Installation

```bash
npm install chart.js ng2-charts
```

### Usage Example

```typescript
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  imports: [BaseChartDirective]
})
export class PokeDetail {
  radarChartData: ChartConfiguration<'radar'>['data'] = {
    labels: ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'],
    datasets: [{
      data: [45, 49, 49, 65, 65, 45], // Stats from Pokemon
      label: 'Bulbasaur'
    }]
  };
}
```

```html
<canvas baseChart 
  [data]="radarChartData" 
  type="radar">
</canvas>
```

## State Management

### Local State

Uses component-level Signals for:
- Pokemon detail data
- Loading state
- Error state
- Selected tab (if using tabs for different sections)

### Shared State

Uses `ComparisonService` for:
- Adding Pokemon to comparison list
- Checking if Pokemon already selected
- Navigation to comparison page

**Example:**
```typescript
private comparisonService = inject(ComparisonService);

addToComparison() {
  if (this.pokemonDetail()) {
    this.comparisonService.addPokemon(this.pokemonDetail()!.id);
  }
}

isInComparison(): boolean {
  return this.comparisonService.isSelected(this.pokemonDetail()?.id);
}
```

## Performance Optimizations

### Lazy Loading

- Module only loads when navigating to detail route
- Reduces initial bundle size

### OnPush Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Image Optimization

- Uses official Pokemon artwork
- Lazy loads images
- Proper `loading="lazy"` attributes
- Fallback images for missing sprites

## Accessibility

- **Semantic HTML** - Proper heading hierarchy (h1, h2, h3)
- **ARIA Labels** - Screen reader support for stats
- **Keyboard Navigation** - Tab through interactive elements
- **Focus Management** - Proper focus indicators
- **Alt Text** - Descriptive alt text for Pokemon images

## Styling

### Responsive Design

Layout adapts to screen sizes:
- Mobile: Stacked vertical layout
- Tablet: 2-column layout
- Desktop: Sidebar layout or multi-column

### Type Colors

Pokemon types have distinct colors:
```css
.type-fire { background: #F08030; }
.type-water { background: #6890F0; }
.type-grass { background: #78C850; }
/* etc... */
```

### Theme Support

Respects light/dark theme from host application.

## Error Handling

### Invalid Pokemon ID

**Scenario:** User navigates to `/detail/99999`

**Handling:**
- Display friendly error message
- Show "Pokemon not found" state
- Provide link back to catalog
- Log error for debugging

### API Errors

**Scenario:** PokeAPI is unreachable

**Handling:**
- Display error state with retry button
- Cache previously loaded Pokemon (optional)
- Show user-friendly error message

## Troubleshooting

### Pokemon Data Not Loading

**Solutions:**
1. Check route parameter extraction
2. Verify API endpoint: `https://pokeapi.co/api/v2/pokemon/:id`
3. Check network tab for failed requests
4. Verify `PokeApiDetailAdapter` is provided

### Charts Not Rendering

**Solutions:**
1. Ensure Chart.js is installed
2. Check console for chart errors
3. Verify chart data format
4. Check canvas element exists in template

### Navigation from Catalog Fails

**Solutions:**
1. Verify router link in catalog: `[routerLink]="['/detail', pokemon.id]"`
2. Check host routing configuration
3. Verify detail remote is running

## Future Enhancements

- [ ] Evolution chain display
- [ ] Moves and TM compatibility
- [ ] Breeding information
- [ ] Location data (where to find)
- [ ] Multiple sprites/forms
- [ ] Shiny variant toggle
- [ ] Strengths/weaknesses calculator
- [ ] Related Pokemon suggestions

## Related Documentation

- [Host Application](../host/README.md)
- [Remote Catalog](../remote-catalog/README.md) - Navigation source
- [Remote Compare](../remote-compare/README.md) - Comparison feature
- [Domain Library](../domain/README.md) - `PokemonDetailService`
- [Module Federation Setup](../../docs/architecture/microfrontend-setup.md)
