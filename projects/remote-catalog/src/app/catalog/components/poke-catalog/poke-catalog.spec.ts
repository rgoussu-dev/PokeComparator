import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { POKEMON_REPOSITORY, PokemonRepository, PokemonPage } from '@domain/src/public-api';

import { PokeCatalog } from './poke-catalog';

describe('PokeCatalog', () => {
  let component: PokeCatalog;
  let fixture: ComponentFixture<PokeCatalog>;

  const mockPokemonPage: PokemonPage = {
    items: [
      { id: 1, name: 'bulbasaur', spriteUrl: 'https://example.com/1.png', types: [{ name: 'grass', slot: 1 }] },
      { id: 2, name: 'ivysaur', spriteUrl: 'https://example.com/2.png', types: [{ name: 'grass', slot: 1 }] }
    ],
    totalCount: 151,
    currentPage: 1,
    pageSize: 20,
    totalPages: 8
  };

  const mockPokemonRepository: Partial<PokemonRepository> = {
    getPokemonList: () => of(mockPokemonPage)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokeCatalog],
      providers: [
        provideRouter([]),
        { provide: POKEMON_REPOSITORY, useValue: mockPokemonRepository }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokeCatalog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(20);
    expect(component.searchQuery()).toBe('');
  });

  it('should reset to page 1 on search', () => {
    component.currentPage.set(3);
    component.onSearch('pikachu');
    expect(component.currentPage()).toBe(1);
    expect(component.searchQuery()).toBe('pikachu');
  });

  it('should update page on page change', () => {
    component.onPageChange({ page: 2, pageSize: 20 });
    expect(component.currentPage()).toBe(2);
  });
});
