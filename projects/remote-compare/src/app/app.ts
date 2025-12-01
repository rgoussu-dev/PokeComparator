import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from '@ui';

@Component({
  selector: 'pc-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Pokémon Compare');
    
  readonly router = inject(Router);

  links: { label: string; href: string; callback: () => void }[] = [
    { label: 'Compare #1 vs #2', href: '/compare', callback: () => this.router.navigate(['/compare'], { queryParams: { pokemon1: 1, pokemon2: 2 } }) }
  ];

  goHome(): void {
    this.router.navigate(['/']);
  }
}
