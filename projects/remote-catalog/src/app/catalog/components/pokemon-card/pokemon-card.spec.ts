import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokemonSummary } from '@domain/src/public-api';

import { PokemonCard } from './pokemon-card';

describe('PokemonCard', () => {
  let component: PokemonCard;
  let fixture: ComponentFixture<PokemonCard>;

  const mockPokemon: PokemonSummary = {
    id: 25,
    name: 'pikachu',
    spriteUrl: 'https://example.com/pikachu.png',
    types: [{ name: 'electric', slot: 1 }]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pokemon', mockPokemon);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format pokemon id with leading zeros', () => {
    expect(component.formattedId).toBe('#025');
  });

  it('should capitalize pokemon name', () => {
    expect(component.displayName).toBe('Pikachu');
  });

  it('should get primary type', () => {
    expect(component.primaryType).toBe('electric');
  });

  it('should emit cardClick when clicked', () => {
    let emittedPokemon: PokemonSummary | undefined;
    component.cardClick.subscribe(p => emittedPokemon = p);
    
    component.onCardClick();
    
    expect(emittedPokemon).toEqual(mockPokemon);
  });
});
