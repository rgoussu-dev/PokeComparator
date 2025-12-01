import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { 
  POKEMON_DETAIL_SERVICE, 
  PokemonDetailService,
  PokemonComparison,
  StatComparison
} from '@domain/src/public-api';
import { NavigationService } from '@ui';

@Component({
  selector: 'pc-poke-compare',
  standalone: false,
  templateUrl: './poke-compare.html',
  styleUrl: './poke-compare.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokeCompare implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pokemonDetailService = inject(POKEMON_DETAIL_SERVICE) as PokemonDetailService;
  private readonly navigationService = inject(NavigationService);
  private readonly destroy$ = new Subject<void>();

  readonly comparison = signal<PokemonComparison | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  // Helper to get stats as array for iteration
  readonly statsArray = signal<StatComparison[]>([]);

  ngOnInit(): void {
    // Set up the back link in the header
    this.navigationService.setBackLink('Back to Catalog', () => this.goToCatalog());

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id1 = params['pokemon1'];
      const id2 = params['pokemon2'];

      if (id1 && id2) {
        this.loadComparison(+id1, +id2);
      } else {
        this.error.set('Please select two Pokémon to compare');
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    // Clear the navigation when leaving the page
    this.navigationService.clearBreadcrumbs();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadComparison(id1: number, id2: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.pokemonDetailService.comparePokemon(id1, id2)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.comparison.set(result);
          this.statsArray.set([
            result.stats.hp,
            result.stats.attack,
            result.stats.defense,
            result.stats.specialAttack,
            result.stats.specialDefense,
            result.stats.speed,
            result.stats.total
          ]);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load comparison:', err);
          this.error.set('Failed to load Pokémon data. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  goToDetail(pokemonId: number): void {
    this.router.navigate(['/detail', pokemonId]);
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

  getWinnerClass(winner: 'pokemon1' | 'pokemon2' | 'tie', position: 'pokemon1' | 'pokemon2'): string {
    if (winner === 'tie') return 'stat-value--tie';
    return winner === position ? 'stat-value--winner' : 'stat-value--loser';
  }
}
