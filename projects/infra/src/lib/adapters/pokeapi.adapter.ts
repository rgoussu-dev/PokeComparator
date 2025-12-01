import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of, catchError } from 'rxjs';
import { 
  PokemonRepository, 
  PokemonPage, 
  PokemonFilter, 
  PaginationParams, 
  PokemonSummary,
  PokemonType 
} from '@domain/src/public-api';

/**
 * PokeAPI response types
 */
interface PokeApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

interface PokeApiPokemonResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other?: {
      'official-artwork'?: {
        front_default: string;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
}

/**
 * PokeAPI adapter implementing the PokemonRepository port
 */
@Injectable({
  providedIn: 'root'
})
export class PokeApiAdapter implements PokemonRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  getPokemonList(pagination: PaginationParams, filter?: PokemonFilter): Observable<PokemonPage> {
    const offset = (pagination.page - 1) * pagination.pageSize;
    const limit = pagination.pageSize;

    return this.http.get<PokeApiListResponse>(
      `${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`
    ).pipe(
      switchMap(response => {
        // If we have a search filter, we need to filter the results
        let filteredResults = response.results;
        
        if (filter?.search) {
          const searchLower = filter.search.toLowerCase();
          filteredResults = response.results.filter(p => 
            p.name.toLowerCase().includes(searchLower)
          );
        }

        // Fetch detailed info for each Pokemon
        if (filteredResults.length === 0) {
          return of({
            items: [],
            totalCount: filter?.search ? 0 : response.count,
            currentPage: pagination.page,
            pageSize: pagination.pageSize,
            totalPages: Math.ceil((filter?.search ? 0 : response.count) / pagination.pageSize)
          });
        }

        const pokemonRequests = filteredResults.map(p => 
          this.http.get<PokeApiPokemonResponse>(p.url).pipe(
            catchError(() => of(null))
          )
        );

        return forkJoin(pokemonRequests).pipe(
          map(pokemonDetails => {
            const items: PokemonSummary[] = pokemonDetails
              .filter((p): p is PokeApiPokemonResponse => p !== null)
              .map(p => this.mapToPokemonSummary(p));

            // Filter by type if specified
            let finalItems = items;
            if (filter?.types && filter.types.length > 0) {
              const typesLower = filter.types.map((t: string) => t.toLowerCase());
              finalItems = items.filter(pokemon => 
                pokemon.types.some((t: PokemonType) => typesLower.includes(t.name.toLowerCase()))
              );
            }

            return {
              items: finalItems,
              totalCount: filter?.search || filter?.types ? finalItems.length : response.count,
              currentPage: pagination.page,
              pageSize: pagination.pageSize,
              totalPages: Math.ceil(response.count / pagination.pageSize)
            };
          })
        );
      })
    );
  }

  getPokemonById(id: number): Observable<PokemonSummary> {
    return this.http.get<PokeApiPokemonResponse>(
      `${this.baseUrl}/pokemon/${id}`
    ).pipe(
      map(response => this.mapToPokemonSummary(response))
    );
  }

  getPokemonByName(name: string): Observable<PokemonSummary> {
    return this.http.get<PokeApiPokemonResponse>(
      `${this.baseUrl}/pokemon/${name.toLowerCase()}`
    ).pipe(
      map(response => this.mapToPokemonSummary(response))
    );
  }

  private mapToPokemonSummary(response: PokeApiPokemonResponse): PokemonSummary {
    const types: PokemonType[] = response.types.map(t => ({
      name: t.type.name,
      slot: t.slot
    }));

    // Prefer official artwork, fallback to front_default
    const spriteUrl = response.sprites.other?.['official-artwork']?.front_default 
      ?? response.sprites.front_default
      ?? '';

    return {
      id: response.id,
      name: response.name,
      spriteUrl,
      types
    };
  }
}
