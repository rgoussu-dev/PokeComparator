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
  protected readonly title = signal('Pokémon Detail');
    
  readonly router = inject(Router);

  links: { label: string; href: string; callback: () => void }[] = [
    { label: 'Bulbasaur', href: '/detail/1', callback: () => this.router.navigate(['/detail', 1]) }
  ];

  goHome(): void {
    this.router.navigate(['/']);
  }
}
