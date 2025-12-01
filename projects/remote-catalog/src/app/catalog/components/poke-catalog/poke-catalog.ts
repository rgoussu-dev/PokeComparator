import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonSummary, POKEMON_REPOSITORY, PokemonFilter } from '@domain/src/public-api';
import { PageChangeEvent } from '@ui';
import { Subject, takeUntil } from 'rxjs';

/** Maximum number of Pokemon that can be selected for comparison */
const MAX_SELECTION = 2;

@Component({
  selector: 'app-poke-catalog',
  templateUrl: './poke-catalog.html',
  styleUrl: './poke-catalog.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokeCatalog implements OnInit, OnDestroy {
  private readonly pokemonRepository = inject(POKEMON_REPOSITORY);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // State signals
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly searchQuery = signal('');
  readonly isLoading = signal(true);

  // Pokemon data signals
  readonly pokemonList = signal<PokemonSummary[]>([]);
  readonly totalItems = signal(0);

  // Selection state
  readonly selectedPokemon = signal<PokemonSummary[]>([]);
  
  /** Computed: Set of selected Pokemon IDs for quick lookup */
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

  onPageChange(event: PageChangeEvent): void {
    this.currentPage.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadPokemon();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1); // Reset to first page on search
    this.loadPokemon();
  }

  onSearchValueChange(value: string): void {
    this.searchQuery.set(value);
  }

  onPokemonClick(pokemon: PokemonSummary): void {
    this.router.navigate(['/detail', pokemon.id]);
  }

  /** Handle selection toggle from pokemon cards */
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

  /** Check if a specific Pokemon is selected */
  isPokemonSelected(pokemonId: number): boolean {
    return this.selectedIds().has(pokemonId);
  }

  /** Clear all selections */
  clearSelection(): void {
    this.selectedPokemon.set([]);
  }

  /** Navigate to comparison view with selected Pokemon */
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

  private loadPokemon(): void {
    this.isLoading.set(true);
    
    const filter: PokemonFilter = this.searchQuery() 
      ? { search: this.searchQuery() } 
      : {};

    this.pokemonRepository.getPokemonList(
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
