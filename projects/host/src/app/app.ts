import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from '@ui';

@Component({
  selector: 'pc-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('host');
    
  readonly router = inject(Router);

  links: { label: string; href: string; callback: () => void }[] =  [
    { label: 'Catalog', href: '/catalog', callback: () => {
      this.router.navigate(['/catalog']);
    } },
    { label: 'Detail', href: '/detail', callback: () => {
      this.router.navigate(['/detail']);
    } },
    { label: 'Comparator', href: '/compare', callback: () => {
      this.router.navigate(['/compare']);
    } }
  ];

  goHome(): void {
    this.router.navigate(['/']);
  }
}
