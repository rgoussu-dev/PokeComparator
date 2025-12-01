import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { PokemonDetail, PokemonComparison } from '../models/pokemon-detail.model';
import { POKEMON_DETAIL_REPOSITORY } from '../ports/pokemon-detail.repository';
import { ComparisonService } from './comparison.service';

/**
 * Domain service for Pokemon detail operations
 * This service encapsulates the business logic for fetching and comparing Pokemon details
 */
@Injectable()
export class PokemonDetailService {
  private readonly repository = inject(POKEMON_DETAIL_REPOSITORY);
  private readonly comparisonService = inject(ComparisonService);

  /**
   * Retrieves detailed Pokemon information by ID
   * @param id - Pokemon ID
   * @returns Observable of PokemonDetail
   */
  getPokemonDetail(id: number): Observable<PokemonDetail> {
    return this.repository.getPokemonDetail(id);
  }

  /**
   * Retrieves detailed Pokemon information by name
   * @param name - Pokemon name
   * @returns Observable of PokemonDetail
   */
  getPokemonDetailByName(name: string): Observable<PokemonDetail> {
    return this.repository.getPokemonDetailByName(name);
  }

  /**
   * Compares two Pokemon by their IDs
   * Fetches both Pokemon details and returns a comparison result
   * @param id1 - First Pokemon ID
   * @param id2 - Second Pokemon ID
   * @returns Observable of PokemonComparison
   */
  comparePokemon(id1: number, id2: number): Observable<PokemonComparison> {
    return forkJoin([
      this.repository.getPokemonDetail(id1),
      this.repository.getPokemonDetail(id2)
    ]).pipe(
      map(([pokemon1, pokemon2]) => this.comparisonService.compare(pokemon1, pokemon2))
    );
  }

  /**
   * Compares two Pokemon by their names
   * @param name1 - First Pokemon name
   * @param name2 - Second Pokemon name
   * @returns Observable of PokemonComparison
   */
  comparePokemonByName(name1: string, name2: string): Observable<PokemonComparison> {
    return forkJoin([
      this.repository.getPokemonDetailByName(name1),
      this.repository.getPokemonDetailByName(name2)
    ]).pipe(
      map(([pokemon1, pokemon2]) => this.comparisonService.compare(pokemon1, pokemon2))
    );
  }
}

/**
 * Injection token for the PokemonDetailService
 */
export const POKEMON_DETAIL_SERVICE = new InjectionToken<PokemonDetailService>('PokemonDetailService');
