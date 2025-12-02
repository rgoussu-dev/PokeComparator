/**
 * A container query primitive for enabling responsive design based on container width.
 *
 * @description
 * The Container component establishes a CSS container query context, allowing child
 * elements to respond to the container's dimensions rather than the viewport.
 * This is based on the Container primitive from Every Layout and enables
 * component-based responsive design.
 *
 * Container queries are a powerful alternative to viewport-based media queries,
 * allowing components to adapt based on their parent container's size. This is
 * especially useful in component-based architectures where the same component
 * might be used in different contexts (sidebar vs main content, for example).
 *
 * Key features:
 * - Establishes container query context with container-type: inline-size
 * - Optional named containers for targeting specific ancestors
 * - Allows nested containers (queries target closest ancestor by default)
 * - Enables truly reusable, context-aware components
 * - Complements intrinsic layout primitives
 * - Performance-optimized with dynamic style generation
 *
 * @example
 * Basic unnamed container:
 * ```html
 * <pc-container>
 *   <div class="responsive-component">
 *     Content that responds to container width
 *   </div>
 * </pc-container>
 * 
 * <!-- In CSS -->
 * @container (min-width: 400px) {
 *   .responsive-component {
 *     grid-template-columns: repeat(2, 1fr);
 *   }
 * }
 * ```
 *
 * @example
 * Named container for targeted queries:
 * ```html
 * <pc-container name="cardContainer">
 *   <div class="card-content">
 *     Card that adapts to cardContainer width
 *   </div>
 * </pc-container>
 * 
 * <!-- In CSS -->
 * @container cardContainer (min-width: 500px) {
 *   .card-content {
 *     display: flex;
 *     gap: var(--s-2);
 *   }
 * }
 * ```
 *
 * @example
 * Nested containers:
 * ```html
 * <pc-container name="outer">
 *   <pc-container name="inner">
 *     <div class="component">
 *       Can query both outer and inner containers
 *     </div>
 *   </pc-container>
 * </pc-container>
 * ```
 *
 * @usageNotes
 * - Use for creating responsive components that work in any context
 * - Named containers allow descendant elements at any depth to query them
 * - Without a name, use `@container (min-width: ...)` to query closest ancestor
 * - With a name, use `@container myName (min-width: ...)` from any descendant
 * - Container queries work with width (inline-size), not height
 * - Containers can be nested; each query targets the nearest matching ancestor
 * - Particularly useful for card layouts, dashboards, and reusable components
 * - Browser support for container queries is modern (2022+), consider fallbacks
 * - Combine with Grid and Stack for powerful responsive layouts
 *
 * @see Every Layout: https://every-layout.dev/layouts/container/
 * @see {@link Grid} for responsive grid layouts
 * @see {@link Box} for card containers
 * @see {@link Stack} for vertical layouts
 *
 * @publicApi
 */
import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { generateSignature, injectStyle } from '../helpers/atom-config-helper';

@Component({
  selector: 'pc-container',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'container' }
})
export class Container implements OnInit, OnChanges, OnDestroy {
  /** 
   * Optional name for this container.
   * When provided, enables targeted container queries from any descendant using `@container name (...)`.
   * Without a name, descendants can only query using `@container (...)` which targets the closest ancestor.
   */
  @Input() name?: string;

  /** Unique identifier for this container instance, generated from configuration. @internal */
  ident?: string;
  
  /** Current configuration object used for style generation. @internal */
  config: { name?: string } | null = null;

  private readonly element = inject(ElementRef);

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['name']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  /**
   * Updates configuration and generates unique signature for this container instance.
   * @internal
   */
  updateConfigAndSignature() {
    this.config = { name: this.name };
    const signature = `pc-container-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-container');
      host.classList.remove('container');
    } catch {
      console.warn('Could not clean up Container attributes on destroy');
    }
  }

  /**
   * Generates CSS styles for this container instance.
   * Sets container-type to enable container queries.
   * @param signature - Unique identifier for this configuration
   * @param config - Configuration object with optional container name
   * @returns CSS string
   * @internal
   */
  private generateStyle(signature: string, config: { name?: string }): string {
    const { name } = config;
    return `
      .container[data-pc-container="${signature}"] {
        ${name ? `container-name: ${name};` : ''}
        container-type: inline-size;
       
      }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-container', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('container');
    host.setAttribute('data-pc-container', this.ident);
  }
}
