import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from '@ui';

/**
 * Root component for the host shell application.
 *
 * @description
 * The App component serves as the root component for the microfrontend host application.
 * It provides the shell layout with a header and router outlet, orchestrating the loading
 * and display of remote microfrontend applications (catalog, detail, compare).
 *
 * This component is the entry point of the module federation host and handles:
 * - Main application layout and structure
 * - Primary navigation through the header
 * - Router outlet for loading remote modules
 * - Navigation links to all microfrontend features
 *
 * The host application uses Angular's standalone component architecture and
 * leverages Webpack Module Federation to dynamically load remote applications
 * at runtime.
 *
 * Key features:
 * - Shell layout with header and content area
 * - Navigation to all microfrontend routes
 * - Dynamic remote module loading via router
 * - Logo click navigation to home
 * - Responsive layout structure
 *
 * @example
 * This component is bootstrapped as the root:
 * ```typescript
 * import { App } from './app/app';
 * 
 * bootstrapApplication(App, appConfig);
 * ```
 *
 * @usageNotes
 * - This is the host application's root component
 * - Navigation links point to routes defined in app.routes.ts
 * - Each route loads a remote microfrontend module
 * - The header provides consistent navigation across all views
 * - Logo click navigates back to the home page
 * - All remote applications share this shell layout
 * - Router outlet dynamically loads: catalog, detail, or compare modules
 *
 * @see {@link Header} for the navigation header component
 * @see Router configuration in app.routes.ts for remote module loading
 *
 * @publicApi
 */
@Component({
  selector: 'pc-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  /** Application title signal. Currently set to 'host' for development. @internal */
  protected readonly title = signal('host');
    
  /** Angular router for programmatic navigation. @internal */
  readonly router = inject(Router);

  /** 
   * Navigation links configuration for the header.
   * Each link includes a label, href, and callback for route navigation.
   */
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

  /**
   * Handles logo click events by navigating to the home page.
   * @internal
   */
  goHome(): void {
    this.router.navigate(['/']);
  }
}
