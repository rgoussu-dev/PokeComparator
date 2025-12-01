import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { PokemonSummary } from '@domain/src/public-api';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonCard {
  /** The Pokemon data to display */
  pokemon = input.required<PokemonSummary>();

  /** Whether this card is selected for comparison */
  selected = input<boolean>(false);

  /** Emits when the card is clicked */
  cardClick = output<PokemonSummary>();

  /** Emits when the selection checkbox is toggled */
  selectionChange = output<{ pokemon: PokemonSummary; selected: boolean }>();

  /** Returns the Pokemon ID formatted with leading zeros */
  get formattedId(): string {
    return `#${this.pokemon().id.toString().padStart(3, '0')}`;
  }

  /** Returns the Pokemon name with first letter capitalized */
  get displayName(): string {
    const name = this.pokemon().name;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /** Returns the primary type for styling */
  get primaryType(): string {
    return this.pokemon().types[0]?.name ?? 'normal';
  }

  onCardClick(): void {
    this.cardClick.emit(this.pokemon());
  }

  onSelectionToggle(event: Event): void {
    event.stopPropagation(); // Prevent card click when toggling selection
    this.selectionChange.emit({
      pokemon: this.pokemon(),
      selected: !this.selected()
    });
  }
}
