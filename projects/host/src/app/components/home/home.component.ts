import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button, Center, Cluster, Cover, Stack } from '@ui';

@Component({
  selector: 'pc-home',
  imports: [Cover, Stack, Button, Center, Cluster],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly router = inject(Router);

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }
}
