import { Observable } from 'rxjs';
import { PokemonPage, PokemonFilter, PaginationParams, PokemonSummary } from '../models/pokemon.model';
import { InjectionToken } from '@angular/core';

/**
 * Port interface for Pokemon data retrieval
 * Following hexagonal architecture, this is the outbound port that adapters will implement
 */
export interface PokemonRepository {
  /**
   * Retrieves a paginated list of Pokemon
   * @param pagination - Pagination parameters
   * @param filter - Optional filter criteria
   * @returns Observable of PokemonPage
   */
  getPokemonList(pagination: PaginationParams, filter?: PokemonFilter): Observable<PokemonPage>;

  /**
   * Retrieves a single Pokemon by ID
   * @param id - Pokemon ID
   * @returns Observable of PokemonSummary
   */
  getPokemonById(id: number): Observable<PokemonSummary>;

  /**
   * Retrieves a single Pokemon by name
   * @param name - Pokemon name
   * @returns Observable of PokemonSummary
   */
  getPokemonByName(name: string): Observable<PokemonSummary>;
}

/**
 * Injection token for the PokemonRepository
 */
export const POKEMON_REPOSITORY = new InjectionToken<PokemonRepository>('PokemonRepository');
