import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  PokemonPage, 
  PokemonFilter, 
  PaginationParams, 
  PokemonSummary 
} from '../models/pokemon.model';
import { POKEMON_REPOSITORY } from '../ports/pokemon.repository';

/**
 * Domain service for Pokemon catalog operations
 * This service encapsulates the business logic for listing and searching Pokemon
 */
@Injectable()
export class PokemonCatalogService {
  private readonly repository = inject(POKEMON_REPOSITORY);

  /**
   * Retrieves a paginated list of Pokemon with optional filtering
   * @param pagination - Pagination parameters (page, pageSize)
   * @param filter - Optional filter criteria (search, types)
   * @returns Observable of PokemonPage containing the results
   */
  getPokemonList(pagination: PaginationParams, filter?: PokemonFilter): Observable<PokemonPage> {
    return this.repository.getPokemonList(pagination, filter);
  }

  /**
   * Retrieves a single Pokemon by its ID
   * @param id - Pokemon ID
   * @returns Observable of PokemonSummary
   */
  getPokemonById(id: number): Observable<PokemonSummary> {
    return this.repository.getPokemonById(id);
  }

  /**
   * Retrieves a single Pokemon by its name
   * @param name - Pokemon name
   * @returns Observable of PokemonSummary
   */
  getPokemonByName(name: string): Observable<PokemonSummary> {
    return this.repository.getPokemonByName(name);
  }

  /**
   * Search Pokemon by name (convenience method with default pagination)
   * @param query - Search query
   * @param limit - Maximum results to return (default: 5)
   * @returns Observable of PokemonSummary array
   */
  searchPokemon(query: string, limit = 5): Observable<PokemonPage> {
    return this.repository.getPokemonList(
      { page: 1, pageSize: limit },
      { search: query }
    );
  }
}

/**
 * Injection token for the PokemonCatalogService
 */
export const POKEMON_CATALOG_SERVICE = new InjectionToken<PokemonCatalogService>('PokemonCatalogService');
