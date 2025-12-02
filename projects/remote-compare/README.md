# Remote Compare

The **Remote Compare** microfrontend provides the Pokemon comparison feature, allowing users to view two Pokemon side-by-side and compare their stats, types, abilities, and characteristics.

## Purpose

This microfrontend handles:
- **Side-by-Side Comparison** - Display two Pokemon next to each other
- **Stat Comparison** - Visual comparison of base stats with differences highlighted
- **Type Comparison** - Compare Pokemon types
- **Ability Comparison** - Compare abilities and characteristics
- **Visual Comparison** - Compare sprites and appearance
- **Stat Differential** - Calculate and display which Pokemon is stronger in each category

## Exposed Module

This microfrontend exposes `CompareModule` via Module Federation:

```javascript
// webpack.config.js
exposes: {
  './CompareModule': './projects/remote-compare/src/app/compare/compare.module.ts',
}
```

**Remote Name:** `remote-compare`  
**Port:** `4230` (development)

## Directory Structure

```
projects/remote-compare/src/app/
├── compare/
│   ├── compare.module.ts        # Entry module (exposed)
│   ├── compare.routes.ts        # Internal routing
│   └── components/
│       └── poke-compare/        # Main comparison component
└── components/
    └── (shared components if any)
```

## Features

### 1. Pokemon Selection

Users can select Pokemon through:
- **Query Parameters** - `?pokemon1=25&pokemon2=1` (Pikachu vs Bulbasaur)
- **ComparisonService** - Pokemon selected from catalog
- **Manual Input** - Search/input fields to select Pokemon

### 2. Side-by-Side Display

Shows both Pokemon with:
- Pokemon sprites/artwork
- Name and ID
- Type badges
- Physical characteristics (height, weight)

### 3. Stat Comparison

Visual comparison of base stats:
- HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed
- Side-by-side bars showing relative values
- Highlighting which Pokemon has higher values
- Percentage difference display
- Total stats comparison

### 4. Differential Analysis

Calculates and displays:
- Stat differences (Pokemon A has +20 Attack over Pokemon B)
- Win/loss/tie indicators for each stat
- Overall stronger Pokemon indicator
- Color-coded results (green for higher, red for lower)

### 5. Type Matchup

Shows type advantages (optional feature):
- Type effectiveness if Pokemon were to battle
- Resistance/weakness analysis
- Color-coded type matchup indicators

## Components

### PokeCompare

Main component managing the comparison feature.

**Query Parameters:**
- `pokemon1: string` - First Pokemon ID or name
- `pokemon2: string` - Second Pokemon ID or name

**Responsibilities:**
- Extract Pokemon from query params or ComparisonService
- Fetch details for both Pokemon via `PokemonDetailService`
- Use `ComparisonService` to calculate differences
- Display comparison in responsive layout

**Key Features:**
- Uses Angular Signals for reactive state
- Handles loading states for both Pokemon
- Error handling for invalid Pokemon IDs
- Responsive layout using Stack/Cluster/Frame

**Location:** `compare/components/poke-compare/`

## Routes

Internal routing configuration:

```typescript
export const COMPARE_ROUTES: Routes = [
  {
    path: '',
    component: PokeCompare
  }
];
```

**Accessed via Host:** `/compare?pokemon1=X&pokemon2=Y`

### Navigation Examples

| URL | Comparison | Description |
|-----|------------|-------------|
| `/compare?pokemon1=25&pokemon2=1` | Pikachu vs Bulbasaur | Compare by IDs |
| `/compare?pokemon1=pikachu&pokemon2=charizard` | Pikachu vs Charizard | Compare by names |
| `/compare` | From ComparisonService | Use selected Pokemon |

## Dependencies

### Domain Services

- **`PokemonDetailService`** - Fetch detailed Pokemon information
- **`ComparisonService`** - Business logic for comparing Pokemon
  - `comparePokemon(pokemon1, pokemon2)` - Calculate stat differences
  - `getSelectedPokemon()` - Retrieve Pokemon selected for comparison

### Infrastructure

- **`PokeApiDetailAdapter`** - Implements `PokemonDetailRepository` port

### UI Components

- **`Box`**, **`Stack`**, **`Cluster`** - Layout primitives
- **`Container`**, **`Center`**, **`Frame`** - Layout helpers

## Module Configuration

```typescript
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(COMPARE_ROUTES),
    Box, Center, Cluster, Container, Stack, Frame
  ],
  declarations: [PokeCompare],
  providers: [
    provideHttpClient(),
    { provide: POKEMON_DETAIL_REPOSITORY, useClass: PokeApiDetailAdapter },
    ComparisonService,
    { provide: POKEMON_DETAIL_SERVICE, useClass: PokemonDetailService }
  ]
})
export class CompareModule {}
```

**Key Points:**
- Provides `ComparisonService` for comparison logic
- Binds `PokeApiDetailAdapter` to repository port
- Uses `forChild` routing

## Running

### Standalone Development

Run the comparison microfrontend independently:

```bash
ng serve remote-compare
```

Access at: `http://localhost:4230?pokemon1=25&pokemon2=1`

### With Host

Start all applications:

```bash
npm run run:all
```

Access via host at: `http://localhost:4200/compare?pokemon1=25&pokemon2=1`

## Building

Build the microfrontend:

```bash
ng build remote-compare
```

Build artifacts include:
- `remoteEntry.js` - Module Federation entry point
- Chunked JavaScript files
- Assets and stylesheets

## Testing

Run unit tests:

```bash
ng test remote-compare
```

**Testing Focus:**
- Query parameter extraction
- Pokemon data loading
- Comparison calculation logic
- Stat difference display
- Error handling (invalid IDs, missing Pokemon)
- Loading states for both Pokemon

## Data Flow

```
User navigates to /compare?pokemon1=25&pokemon2=1
           ↓
PokeCompare component activates
           ↓
Extract query params (pokemon1=25, pokemon2=1)
           ↓
PokemonDetailService.getPokemonDetail(25)
PokemonDetailService.getPokemonDetail(1)
           ↓
Both API calls complete
           ↓
ComparisonService.comparePokemon(pikachu, bulbasaur)
           ↓
Calculate stat differences
           ↓
Display comparison result
```

## Comparison Logic

The `ComparisonService` (from domain library) provides:

```typescript
export interface PokemonComparison {
  pokemon1: PokemonDetail;
  pokemon2: PokemonDetail;
  statComparisons: StatComparison[];
  winner: 'pokemon1' | 'pokemon2' | 'tie';
}

export interface StatComparison {
  statName: string;
  pokemon1Value: number;
  pokemon2Value: number;
  difference: number;
  percentageDifference: number;
  winner: 'pokemon1' | 'pokemon2' | 'tie';
}
```

### Usage Example

```typescript
private comparisonService = inject(ComparisonService);

comparePokemons() {
  const pokemon1 = this.pokemon1Signal();
  const pokemon2 = this.pokemon2Signal();
  
  if (pokemon1 && pokemon2) {
    const comparison = this.comparisonService.comparePokemon(pokemon1, pokemon2);
    this.comparisonResult.set(comparison);
  }
}
```

## Visual Design

### Layout Options

**Desktop:**
```
┌──────────────┬──────────────┐
│  Pokemon 1   │  Pokemon 2   │
│  [Image]     │  [Image]     │
│  Name        │  Name        │
│  Types       │  Types       │
├──────────────┴──────────────┤
│     Stat Comparison          │
│  HP:     [===] vs [===]     │
│  Attack: [====] vs [==]     │
│  ...                         │
└──────────────────────────────┘
```

**Mobile:**
```
┌────────────────┐
│   Pokemon 1    │
│   [Image]      │
│   Details      │
├────────────────┤
│   Pokemon 2    │
│   [Image]      │
│   Details      │
├────────────────┤
│ Stat Compare   │
│ HP: P1 > P2    │
│ Attack: P2 > P1│
└────────────────┘
```

### Color Coding

- **Green** - Higher/better value
- **Red** - Lower/worse value
- **Gray/Neutral** - Tie

## State Management

### Local State

Uses component-level Signals for:
- Pokemon 1 details
- Pokemon 2 details
- Comparison result
- Loading states (separate for each Pokemon)
- Error states

### Query Parameters

Reads from URL:
```typescript
private route = inject(ActivatedRoute);

ngOnInit() {
  this.route.queryParams.subscribe(params => {
    const id1 = params['pokemon1'];
    const id2 = params['pokemon2'];
    this.loadPokemon(id1, id2);
  });
}
```

### Shared State

Uses `ComparisonService` for:
- Getting pre-selected Pokemon (from catalog)
- Storing comparison results
- Sharing state with other features

## Performance Optimizations

### Parallel Loading

Load both Pokemon simultaneously:
```typescript
forkJoin({
  pokemon1: this.detailService.getPokemonDetail(id1),
  pokemon2: this.detailService.getPokemonDetail(id2)
}).subscribe(result => {
  this.pokemon1.set(result.pokemon1);
  this.pokemon2.set(result.pokemon2);
});
```

### OnPush Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Memoization

Cache comparison calculations:
```typescript
private comparisonCache = new Map<string, PokemonComparison>();

getComparison(id1: number, id2: number): PokemonComparison {
  const key = `${id1}-${id2}`;
  if (!this.comparisonCache.has(key)) {
    // Calculate and cache
  }
  return this.comparisonCache.get(key)!;
}
```

## Accessibility

- **Semantic HTML** - Tables for stat comparisons
- **ARIA Labels** - Screen reader support for comparisons
- **Keyboard Navigation** - Tab through elements
- **Color + Text** - Don't rely on color alone (use icons/text for higher/lower)
- **Alt Text** - Descriptive alt text for Pokemon images

## Styling

### Responsive Design

- Mobile: Vertical stacked layout
- Tablet: Side-by-side with smaller images
- Desktop: Full side-by-side with detailed stats

### Visual Indicators

```css
.stat-higher {
  color: var(--color-success);
  font-weight: bold;
}

.stat-lower {
  color: var(--color-danger);
  opacity: 0.7;
}

.stat-tie {
  color: var(--color-neutral);
}
```

## Error Handling

### Invalid Pokemon ID

**Scenario:** `/compare?pokemon1=99999&pokemon2=1`

**Handling:**
- Display error for invalid Pokemon
- Allow user to select different Pokemon
- Show partial results if one Pokemon is valid

### Missing Query Parameters

**Scenario:** `/compare` (no params)

**Handling:**
- Check ComparisonService for selected Pokemon
- If none selected, show Pokemon selection interface
- Prompt user to select two Pokemon

### API Errors

**Scenario:** PokeAPI is unreachable

**Handling:**
- Display error state with retry button
- Show cached data if available
- Provide navigation back to catalog

## Integration with Other Features

### From Catalog

User can add Pokemon to comparison from catalog:
1. Click "Add to Compare" on Pokemon card
2. ComparisonService stores selection
3. Navigate to `/compare` once two are selected
4. Component reads from ComparisonService

### To Detail

User can navigate to individual detail pages:
- Click Pokemon name/image in comparison
- Navigate to `/detail/:id`

## Troubleshooting

### Pokemon Not Comparing

**Solutions:**
1. Check query parameters are correct
2. Verify both Pokemon IDs are valid
3. Check console for API errors
4. Verify `ComparisonService` is provided

### Stats Not Displaying

**Solutions:**
1. Check Pokemon data has stats property
2. Verify comparison calculation logic
3. Check template bindings

### Layout Issues

**Solutions:**
1. Verify responsive layout components (Stack, Cluster)
2. Check CSS for layout conflicts
3. Test on different screen sizes

## Future Enhancements

- [ ] Compare more than 2 Pokemon simultaneously
- [ ] Save/share comparison results (URL with both IDs)
- [ ] Export comparison as image
- [ ] Historical comparisons (save comparison history)
- [ ] Advanced filters (compare by generation, type, etc.)
- [ ] Type matchup simulation
- [ ] Move pool comparison
- [ ] Evolution chain comparison
- [ ] Battle simulation

## Related Documentation

- [Host Application](../host/README.md)
- [Remote Catalog](../remote-catalog/README.md) - Pokemon selection source
- [Remote Detail](../remote-detail/README.md) - Individual Pokemon details
- [Domain Library](../domain/README.md) - `ComparisonService`
- [Module Federation Setup](../../docs/architecture/microfrontend-setup.md)
