/**
 * Represents a Pokemon's type (e.g., fire, water, grass)
 */
export interface PokemonType {
  name: string;
  slot: number;
}

/**
 * Represents basic Pokemon information for catalog listing
 */
export interface PokemonSummary {
  id: number;
  name: string;
  spriteUrl: string;
  types: PokemonType[];
}

/**
 * Represents a paginated response from the Pokemon repository
 */
export interface PokemonPage {
  items: PokemonSummary[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Filter criteria for querying Pokemon
 */
export interface PokemonFilter {
  search?: string;
  types?: string[];
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}
