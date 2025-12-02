import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonSummary, POKEMON_CATALOG_SERVICE, PokemonFilter } from '@domain/src/public-api';
import { PageChangeEvent } from '@ui';
import { Subject, takeUntil } from 'rxjs';

/** Maximum number of Pokemon that can be selected for comparison */
const MAX_SELECTION = 2;

/**
 * Pokemon catalog component displaying a searchable, paginated list of Pokemon.
 *
 * @description
 * The PokeCatalog component is the main feature component of the catalog microfrontend.
 * It provides a complete interface for browsing Pokemon with search functionality,
 * pagination, and selection for comparison. The component uses Angular signals for
 * reactive state management and integrates with the domain layer's PokemonCatalogService.
 *
 * Key features:
 * - Paginated Pokemon list with configurable page size
 * - Real-time search functionality
 * - Pokemon selection for comparison (up to 2)
 * - Navigation to Pokemon detail pages
 * - Navigation to comparison view with selected Pokemon
 * - Loading states and error handling
 * - OnPush change detection for performance
 * - RxJS subscription management with takeUntil
 * - Signal-based reactive state
 *
 * The component serves as a primary adapter in the hexagonal architecture,
 * connecting the UI layer to the domain services.
 *
 * @example
 * Route configuration:
 * ```typescript
 * {
 *   path: 'catalog',
 *   loadChildren: () => loadRemoteModule({
 *     type: 'module',
 *     remoteEntry: 'http://localhost:4201/remoteEntry.js',
 *     exposedModule: './Module'
 *   })
 * }
 * ```
 *
 * @usageNotes
 * - Component is part of the catalog remote module, not standalone
 * - Uses PokemonCatalogService injected via POKEMON_CATALOG_SERVICE token
 * - Maintains selection state for up to MAX_SELECTION (2) Pokemon
 * - When third Pokemon is selected, replaces the second selection
 * - Search resets pagination to page 1
 * - Clicking a Pokemon card navigates to detail view
 * - Compare button appears when 2 Pokemon are selected
 * - All subscriptions are properly cleaned up in ngOnDestroy
 * - Uses signals for reactive UI updates
 * - Computed selectedIds signal provides O(1) lookup for selection state
 *
 * @see {@link PokemonCatalogService} for Pokemon data retrieval
 * @see {@link PokemonCard} for individual Pokemon display
 * @see {@link PaginatedList} for pagination controls
 * @see {@link Searchbar} for search functionality
 *
 * @publicApi
 */
@Component({
  selector: 'pc-poke-catalog',
  standalone: false,
  templateUrl: './poke-catalog.html',
  styleUrl: './poke-catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokeCatalog implements OnInit, OnDestroy {
  /** Injected Pokemon catalog service for data operations. @internal */
  private readonly pokemonCatalogService = inject(POKEMON_CATALOG_SERVICE);
  
  /** Angular router for navigation. @internal */
  private readonly router = inject(Router);
  
  /** Subject for managing subscription lifecycle. @internal */
  private readonly destroy$ = new Subject<void>();

  // State signals
  /** Current page number (1-indexed). */
  readonly currentPage = signal(1);
  
  /** Number of Pokemon per page. */
  readonly pageSize = signal(20);
  
  /** Current search query string. */
  readonly searchQuery = signal('');
  
  /** Loading state indicator. */
  readonly isLoading = signal(true);

  // Pokemon data signals
  /** List of Pokemon for the current page. */
  readonly pokemonList = signal<PokemonSummary[]>([]);
  
  /** Total number of Pokemon matching current filters. */
  readonly totalItems = signal(0);

  // Selection state
  /** Array of currently selected Pokemon (max 2). */
  readonly selectedPokemon = signal<PokemonSummary[]>([]);
  
  /** Computed set of selected Pokemon IDs for quick lookup. */
  readonly selectedIds = computed(() => 
    new Set(this.selectedPokemon().map(p => p.id))
  );

  ngOnInit(): void {
    this.loadPokemon();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles pagination changes from the paginated list component.
   * @param event - Page change event with new page and page size
   */
  onPageChange(event: PageChangeEvent): void {
    this.currentPage.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadPokemon();
  }

  /**
   * Handles search submission, resets to first page and loads filtered results.
   * @param query - Search query string
   */
  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1); // Reset to first page on search
    this.loadPokemon();
  }

  /**
   * Handles real-time search value changes.
   * @param value - Current search input value
   */
  onSearchValueChange(value: string): void {
    this.searchQuery.set(value);
  }

  /**
   * Handles Pokemon card clicks, navigates to detail view.
   * @param pokemon - The clicked Pokemon
   */
  onPokemonClick(pokemon: PokemonSummary): void {
    this.router.navigate(['/detail', pokemon.id]);
  }

  /** 
   * Handles selection toggle from pokemon cards.
   * Maintains maximum of 2 selections, replacing oldest when limit is reached.
   * @param event - Selection change event with Pokemon and selected state
   */
  onSelectionChange(event: { pokemon: PokemonSummary; selected: boolean }): void {
    const current = this.selectedPokemon();
    
    if (event.selected) {
      if (current.length < MAX_SELECTION) {
        // Add to selection if under limit
        this.selectedPokemon.set([...current, event.pokemon]);
      } else {
        // Replace newest selection (last in array) with new one
        this.selectedPokemon.set([current[0], event.pokemon]);
      }
    } else {
      // Remove from selection
      this.selectedPokemon.set(current.filter(p => p.id !== event.pokemon.id));
    }
  }

  /** 
   * Checks if a specific Pokemon is currently selected.
   * @param pokemonId - The Pokemon ID to check
   * @returns True if Pokemon is selected
   */
  isPokemonSelected(pokemonId: number): boolean {
    return this.selectedIds().has(pokemonId);
  }

  /** Clears all Pokemon selections. */
  clearSelection(): void {
    this.selectedPokemon.set([]);
  }

  /** 
   * Navigates to comparison view with the two selected Pokemon.
   * Only navigates if exactly 2 Pokemon are selected.
   */
  goToComparison(): void {
    const [first, second] = this.selectedPokemon();
    if (first && second) {
      this.router.navigate(['/compare'], {
        queryParams: {
          pokemon1: first.id,
          pokemon2: second.id
        }
      });
    }
  }

  /**
   * Loads Pokemon from the catalog service based on current filters and pagination.
   * Updates loading state and handles errors.
   * @internal
   */
  private loadPokemon(): void {
    this.isLoading.set(true);
    
    const filter: PokemonFilter = this.searchQuery() 
      ? { search: this.searchQuery() } 
      : {};

    this.pokemonCatalogService.getPokemonList(
      { page: this.currentPage(), pageSize: this.pageSize() },
      filter
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (page) => {
        this.pokemonList.set(page.items);
        this.totalItems.set(page.totalCount);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load Pokemon:', error);
        this.pokemonList.set([]);
        this.totalItems.set(0);
        this.isLoading.set(false);
      }
    });
  }
}
