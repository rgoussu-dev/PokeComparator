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
  protected readonly title = signal('Pokémon Catalog');
    
  readonly router = inject(Router);

  links: { label: string; href: string; callback: () => void }[] = [
    { label: 'Catalog', href: '/catalog', callback: () => this.router.navigate(['/catalog']) }
  ];

  goHome(): void {
    this.router.navigate(['/']);
  }
}
