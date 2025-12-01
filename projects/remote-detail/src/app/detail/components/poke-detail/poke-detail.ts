import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { 
  POKEMON_DETAIL_REPOSITORY, 
  PokemonDetailRepository,
  PokemonDetail,
  POKEMON_REPOSITORY,
  PokemonRepository,
  PokemonSummary
} from '@domain/src/public-api';
import { Box, Center, Cluster, Stack, Frame, Button, Sidebar, Searchbar } from "@ui";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-poke-detail',
  imports: [CommonModule, Box, Center, Cluster, Stack, Frame, Button, Sidebar, Searchbar],
  templateUrl: './poke-detail.html',
  styleUrl: './poke-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokeDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pokemonDetailRepo = inject(POKEMON_DETAIL_REPOSITORY) as PokemonDetailRepository;
  private readonly pokemonRepo = inject(POKEMON_REPOSITORY) as PokemonRepository;
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  readonly pokemon = signal<PokemonDetail | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  // Search state
  readonly searchQuery = signal('');
  readonly searchResults = signal<PokemonSummary[]>([]);
  readonly isSearching = signal(false);

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadPokemon(+id);
      } else {
        this.error.set('No Pokémon ID provided');
        this.isLoading.set(false);
      }
    });

    // Set up search with debounce
    this.searchSubject$.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          return of({ items: [], totalCount: 0 });
        }
        this.isSearching.set(true);
        return this.pokemonRepo.getPokemonList(
          { page: 1, pageSize: 5 },
          { search: query }
        );
      })
    ).subscribe({
      next: (result) => {
        this.searchResults.set(result.items.slice(0, 5));
        this.isSearching.set(false);
      },
      error: () => {
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPokemon(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.pokemonDetailRepo.getPokemonDetail(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pokemon) => {
          this.pokemon.set(pokemon);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load Pokemon:', err);
          this.error.set('Failed to load Pokémon. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.searchSubject$.next(value);
  }

  onSearch(query: string): void {
    this.searchSubject$.next(query);
  }

  goToCompare(otherPokemon: PokemonSummary): void {
    const current = this.pokemon();
    if (current) {
      this.router.navigate(['/compare'], {
        queryParams: {
          pokemon1: current.id,
          pokemon2: otherPokemon.id
        }
      });
    }
  }

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  formatName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  formatHeight(decimeters: number): string {
    const meters = decimeters / 10;
    return `${meters.toFixed(1)} m`;
  }

  formatWeight(hectograms: number): string {
    const kg = hectograms / 10;
    return `${kg.toFixed(1)} kg`;
  }

  getStatPercentage(value: number, maxValue: number = 255): number {
    return Math.min((value / maxValue) * 100, 100);
  }

  getTotalStats(): number {
    const p = this.pokemon();
    if (!p) return 0;
    return p.stats.hp + p.stats.attack + p.stats.defense + 
           p.stats.specialAttack + p.stats.specialDefense + p.stats.speed;
  }

  getFormattedId(): string {
    const p = this.pokemon();
    if (!p) return '';
    return `#${p.id.toString().padStart(3, '0')}`;
  }

  formatPokemonId(id: number): string {
    return `#${id.toString().padStart(3, '0')}`;
  }
}
