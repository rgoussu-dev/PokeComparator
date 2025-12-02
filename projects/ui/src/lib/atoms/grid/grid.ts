import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';
import { Size, ALL_SIZES } from '../../types/size';

/**
 * A responsive grid layout primitive with automatic column sizing.
 *
 * @description
 * The Grid component provides an auto-fit CSS Grid layout that automatically
 * determines the number of columns based on available space and minimum column width.
 * It uses the modern `repeat(auto-fit, minmax(min(...), 1fr))` pattern to create
 * truly responsive grids without media queries.
 *
 * Key features:
 * - Automatic column count based on available space
 * - Configurable minimum column width
 * - Consistent gap spacing between items
 * - Responsive without media queries
 * - Items stretch to fill available height
 * - Progressive enhancement with @supports
 * - Performance-optimized with dynamic style generation
 *
 * The component leverages CSS Grid's auto-fit and minmax functions to create
 * flexible, responsive layouts that adapt to container width automatically.
 *
 * @example
 * Basic responsive grid:
 * ```html
 * <pc-grid min="250px" space="s-2">
 *   <div>Card 1</div>
 *   <div>Card 2</div>
 *   <div>Card 3</div>
 *   <div>Card 4</div>
 * </pc-grid>
 * ```
 *
 * @example
 * Grid with size token spacing:
 * ```html
 * <pc-grid min="300px" space="s-3">
 *   <article>Article 1</article>
 *   <article>Article 2</article>
 *   <article>Article 3</article>
 * </pc-grid>
 * ```
 *
 * @example
 * Compact grid for smaller items:
 * ```html
 * <pc-grid min="150px" space="s-1">
 *   <img src="thumb1.jpg" alt="Thumbnail 1">
 *   <img src="thumb2.jpg" alt="Thumbnail 2">
 *   <img src="thumb3.jpg" alt="Thumbnail 3">
 * </pc-grid>
 * ```
 *
 * @example
 * Grid with custom spacing:
 * ```html
 * <pc-grid min="20rem" space="2rem">
 *   <section>Section 1</section>
 *   <section>Section 2</section>
 * </pc-grid>
 * ```
 *
 * @usageNotes
 * - The `min` value determines when columns wrap to a new row
 * - Using `min()` function prevents columns from being narrower than container width
 * - Items automatically stretch to fill available vertical space (align-items: stretch)
 * - Size tokens (s-0 through s-6) provide consistent spacing
 * - Custom CSS values are supported for both min and space
 * - Works well for card layouts, image galleries, product grids
 * - Columns will be as wide as possible while respecting the minimum width
 * - The grid uses grid-gap (not gap) for wider browser support
 * - Combine with Box components for consistent card styling
 *
 * @see {@link Stack} for vertical layouts
 * @see {@link Cluster} for horizontal wrapping layouts
 * @see {@link Box} for card containers
 * @see {@link Size} for available size tokens
 *
 * @publicApi
 */
@Component({
  selector: 'pc-grid',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'grid' }
})
export class Grid implements OnInit, OnChanges, OnDestroy {
  /** 
   * Minimum width for grid columns.
   * Determines when columns wrap to new rows. Common values: '250px', '300px', '20rem'
   */
  @Input() min: Size | string = '250px';
  
  /** 
   * Gap spacing between grid items.
   * Can be a Size token (s-0 through s-6) or a custom CSS value.
   */
  @Input() space: Size | string = 's1';

  /** Unique identifier for this grid instance, generated from configuration. @internal */
  ident?: string;
  
  /** Current configuration object used for style generation. @internal */
  config: { min: string; space: string } | null = null;

  private readonly element = inject(ElementRef);

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['min'] || changes['space']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  /**
   * Updates configuration and generates unique signature for this grid instance.
   * @internal
   */
  updateConfigAndSignature() {
    const min = sanitizeCssValue(this.min);
    const space = ALL_SIZES.includes(this.space as Size) ? `var(--${this.space})` : sanitizeCssValue(this.space as string);
    this.config = { min, space };
    const signature = `pc-grid-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-grid');
      host.classList.remove('grid');
    } catch {
      console.warn('Could not clean up Grid attributes on destroy');
    }
  }

  /**
   * Generates CSS styles for this grid instance.
   * Uses auto-fit with minmax and min() for responsive column layout.
   * @param signature - Unique identifier for this configuration
   * @param config - Configuration object with minimum width and spacing
   * @returns CSS string
   * @internal
   */
  private generateStyle(signature: string, config: { min: string; space: string }): string {
    const { min, space } = config;
    return `
      .grid[data-pc-grid="${signature}"] {
        display: grid;
        grid-gap: ${space};
        align-items: stretch;
      }
      @supports (width: min(${min}, 100%)) {
        .grid[data-pc-grid="${signature}"] {
          grid-template-columns: repeat(auto-fit, minmax(min(${min}, 100%), 1fr));
        }
      }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-grid', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('grid');
    host.setAttribute('data-pc-grid', this.ident);
  }
}
