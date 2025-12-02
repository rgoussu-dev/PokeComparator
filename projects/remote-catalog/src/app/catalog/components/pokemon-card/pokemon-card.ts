import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { PokemonSummary } from '@domain/src/public-api';

/**
 * A card component for displaying Pokemon summary information.
 *
 * @description
 * The PokemonCard component presents a Pokemon's basic information in a
 * visually appealing card format. It displays the Pokemon's image, name,
 * ID, and types, and supports selection for comparison functionality.
 *
 * Key features:
 * - Displays Pokemon sprite/image
 * - Shows formatted Pokemon ID with leading zeros
 * - Displays capitalized Pokemon name
 * - Shows Pokemon types with color coding
 * - Supports selection via checkbox for comparison
 * - Emits events for card clicks and selection changes
 * - Uses OnPush change detection for performance
 * - Type-based styling using CSS classes
 *
 * The component is designed to be used within lists and grids,
 * particularly in the Pokemon catalog microfrontend.
 *
 * @example
 * Basic Pokemon card:
 * ```html
 * <pc-pokemon-card
 *   [pokemon]="pokemonData"
 *   (cardClick)="navigateToDetail($event)">
 * </pc-pokemon-card>
 * ```
 *
 * @example
 * With selection for comparison:
 * ```html
 * <pc-pokemon-card
 *   [pokemon]="pokemon"
 *   [selected]="isSelected(pokemon.id)"
 *   (cardClick)="viewDetails($event)"
 *   (selectionChange)="toggleSelection($event)">
 * </pc-pokemon-card>
 * ```
 *
 * @example
 * In a grid layout:
 * ```html
 * <pc-grid min="250px" space="s-2">
 *   @for (pokemon of pokemonList; track pokemon.id) {
 *     <pc-pokemon-card
 *       [pokemon]="pokemon"
 *       [selected]="selectedIds.has(pokemon.id)"
 *       (cardClick)="onPokemonClick($event)"
 *       (selectionChange)="onSelectionChange($event)">
 *     </pc-pokemon-card>
 *   }
 * </pc-grid>
 * ```
 *
 * @usageNotes
 * - The pokemon input is required and must be a PokemonSummary object
 * - Card click events are emitted when the card body is clicked
 * - Selection change events include both the pokemon and new selected state
 * - Checkbox click stops event propagation to prevent triggering card click
 * - The formattedId getter adds leading zeros (e.g., #001, #025, #150)
 * - The displayName getter capitalizes the first letter of the name
 * - The primaryType getter returns the first type for CSS styling
 * - Component uses OnPush change detection for optimal performance
 * - Works well with PaginatedList component for catalog display
 *
 * @see {@link PokemonSummary} for the Pokemon data model
 * @see {@link PokeCatalog} for the catalog container component
 * @see {@link Grid} for grid layout
 *
 * @publicApi
 */
@Component({
  selector: 'pc-pokemon-card',
  standalone: false,
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonCard {
  /** The Pokemon data to display. Required input containing Pokemon information. */
  pokemon = input.required<PokemonSummary>();

  /** Whether this card is currently selected for comparison. */
  selected = input<boolean>(false);

  /** Emitted when the card body is clicked. Passes the Pokemon data. */
  cardClick = output<PokemonSummary>();

  /** Emitted when the selection checkbox is toggled. Includes Pokemon and new selection state. */
  selectionChange = output<{ pokemon: PokemonSummary; selected: boolean }>();

  /** 
   * Returns the Pokemon ID formatted with leading zeros.
   * @returns Formatted ID string (e.g., '#001', '#025', '#150')
   */
  get formattedId(): string {
    return `#${this.pokemon().id.toString().padStart(3, '0')}`;
  }

  /** 
   * Returns the Pokemon name with first letter capitalized.
   * @returns Capitalized Pokemon name
   */
  get displayName(): string {
    const name = this.pokemon().name;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /** 
   * Returns the primary type for CSS styling.
   * @returns Primary type name or 'normal' if no types exist
   */
  get primaryType(): string {
    return this.pokemon().types[0]?.name ?? 'normal';
  }

  /**
   * Handles card click events and emits the Pokemon data.
   * @internal
   */
  onCardClick(): void {
    this.cardClick.emit(this.pokemon());
  }

  /**
   * Handles selection checkbox toggle and emits selection change.
   * Stops event propagation to prevent triggering card click.
   * @param event - The checkbox click event
   * @internal
   */
  onSelectionToggle(event: Event): void {
    event.stopPropagation(); // Prevent card click when toggling selection
    this.selectionChange.emit({
      pokemon: this.pokemon(),
      selected: !this.selected()
    });
  }
}
