import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button, Center, Cluster, Cover, Stack } from '@ui';

/**
 * Landing page component for the PokeComparator application.
 *
 * @description
 * The HomeComponent serves as the landing page for the host application,
 * providing a welcome screen with a call-to-action to explore the Pokemon catalog.
 * It uses layout primitives to create a centered, visually appealing introduction
 * to the application's features.
 *
 * Key features:
 * - Centered hero layout using Cover primitive
 * - Call-to-action button to navigate to catalog
 * - Responsive stacked layout
 * - Clean, simple introduction to the app
 *
 * The component is typically displayed at the root path ('/') and serves
 * as the entry point for new users.
 *
 * @example
 * Route configuration:
 * ```typescript
 * {
 *   path: '',
 *   component: HomeComponent
 * }
 * ```
 *
 * @usageNotes
 * - Displayed at the root path of the application
 * - Uses Cover layout for vertical centering
 * - Center primitive constrains content width
 * - Stack arranges content vertically
 * - Primary CTA navigates to the catalog microfrontend
 * - This is the first screen users see when accessing the app
 *
 * @see {@link Cover} for vertical centering layout
 * @see {@link Center} for horizontal centering and width constraint
 * @see {@link Stack} for vertical content arrangement
 * @see {@link Button} for the call-to-action button
 *
 * @publicApi
 */
@Component({
  selector: 'pc-home',
  imports: [Cover, Stack, Button, Center, Cluster],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  /** Angular router for navigation. @internal */
  private readonly router = inject(Router);

  /**
   * Navigates to the Pokemon catalog page.
   * @internal
   */
  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }
}
