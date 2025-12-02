import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Center, Cover, Stack } from '@ui';

/**
 * 404 Not Found error page component.
 *
 * @description
 * The NotFoundComponent displays a user-friendly error page when a user
 * navigates to a route that doesn't exist. It provides helpful navigation
 * options to guide users back to valid parts of the application.
 *
 * Key features:
 * - Centered error message layout
 * - Clear 404 error indication
 * - Navigation links back to valid routes
 * - Friendly, non-technical messaging
 * - Responsive layout using primitives
 *
 * This component is typically configured as a wildcard route ('**')
 * to catch all unmatched routes and provide a better user experience
 * than a blank page or browser error.
 *
 * @example
 * Route configuration:
 * ```typescript
 * {
 *   path: '**',
 *   component: NotFoundComponent
 * }
 * ```
 *
 * @usageNotes
 * - Should be the last route in your route configuration (wildcard)
 * - Uses Cover for vertical centering of error content
 * - Center primitive constrains content width for readability
 * - Stack arranges error message and navigation options
 * - Provides RouterLink back to home or other valid routes
 * - Keep messaging friendly and helpful, not technical
 * - Consider adding links to main sections of your app
 *
 * @see {@link Cover} for vertical centering layout
 * @see {@link Center} for horizontal centering
 * @see {@link Stack} for vertical arrangement
 * @see {@link Button} for navigation buttons
 *
 * @publicApi
 */
@Component({
  selector: 'pc-not-found',
  imports: [RouterLink, Button, Center, Cover, Stack],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {}
