import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Size, ALL_SIZES } from '../../types/size';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';
import { JustifyContent, AlignItems, ALL_JUSTIFY_CONTENT, ALL_ALIGN_ITEMS } from '../../types/alignement';

/**
 * A horizontal wrapping layout primitive for grouping elements with consistent spacing.
 *
 * @description
 * The Cluster component provides a flexbox layout that wraps items horizontally,
 * automatically moving items to new rows when space runs out. It's ideal for
 * navigation menus, tag lists, button groups, and other horizontal collections
 * that need to wrap gracefully.
 *
 * Key features:
 * - Horizontal layout with automatic wrapping
 * - Configurable spacing (gap) between items
 * - Flexible alignment control (justify-content and align-items)
 * - Performance-optimized with dynamic style generation
 * - Automatic cleanup on component destroy
 * - Supports size tokens and custom spacing values
 *
 * The component uses flexbox with flex-wrap: wrap and gap for consistent spacing
 * in both directions, respecting writing modes with unicode-bidi: isolate.
 *
 * @example
 * Basic horizontal cluster:
 * ```html
 * <pc-cluster space="s-2">
 *   <button>Action 1</button>
 *   <button>Action 2</button>
 *   <button>Action 3</button>
 * </pc-cluster>
 * ```
 *
 * @example
 * Centered cluster with custom spacing:
 * ```html
 * <pc-cluster
 *   space="s-3"
 *   justify="center"
 *   align="center">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </pc-cluster>
 * ```
 *
 * @example
 * Space-between cluster (push items apart):
 * ```html
 * <pc-cluster
 *   space="s-1"
 *   justify="space-between"
 *   align="center">
 *   <div>Left content</div>
 *   <div>Right content</div>
 * </pc-cluster>
 * ```
 *
 * @example
 * Tag list with wrapping:
 * ```html
 * <pc-cluster space="s-1" justify="flex-start">
 *   <span class="tag">Angular</span>
 *   <span class="tag">TypeScript</span>
 *   <span class="tag">RxJS</span>
 *   <span class="tag">Signals</span>
 * </pc-cluster>
 * ```
 *
 * @usageNotes
 * - Use for horizontal layouts that should wrap when space is limited
 * - The gap property ensures consistent spacing both horizontally and vertically
 * - Common justify values: 'flex-start' (default), 'center', 'space-between', 'space-around'
 * - Common align values: 'flex-start', 'center', 'baseline', 'stretch'
 * - Size tokens (s-0 through s-6) provide consistent spacing
 * - Custom spacing values like '16px' or '1rem' are also supported
 * - Combine with Box for padded containers
 * - Use for navigation menus, button groups, chip lists, and toolbars
 *
 * @see {@link Stack} for vertical layout
 * @see {@link Box} for adding padding around cluster
 * @see {@link Size} for available size tokens
 * @see {@link JustifyContent} for available justify values
 * @see {@link AlignItems} for available align values
 *
 * @publicApi
 */
@Component({
  selector: 'pc-cluster',
  imports: [],
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'cluster' }
})
export class Cluster implements OnInit, OnChanges, OnDestroy {
  /** 
   * Horizontal alignment of items within the container.
   * Common values: 'flex-start', 'center', 'space-between', 'space-around', 'space-evenly'
   */
  @Input() justify: JustifyContent = 'flex-start';
  
  /** 
   * Vertical alignment of items within rows.
   * Common values: 'flex-start', 'center', 'flex-end', 'baseline', 'stretch'
   */
  @Input() align: AlignItems = 'flex-start';
  
  /** 
   * Spacing (gap) between items in both directions.
   * Can be a Size token (s-0 through s-6) or a custom CSS value.
   */
  @Input() space: Size | string = 's1';

  /** Unique identifier for this cluster instance, generated from configuration. @internal */
  ident?: string;
  
  /** Current configuration object used for style generation. @internal */
  config: { space: string; justify: string; align: string } | null = null;

  private readonly element = inject(ElementRef);

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['space'] || changes['justify'] || changes['align']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  /**
   * Updates configuration and generates unique signature for this cluster instance.
   * @internal
   */
  updateConfigAndSignature() {
    const space = ALL_SIZES.includes(this.space as Size) ? `var(--${this.space})` : sanitizeCssValue(this.space as string);
    const justify = ALL_JUSTIFY_CONTENT.includes(this.justify as JustifyContent) ? this.justify : sanitizeCssValue(this.justify as string);
    const align = ALL_ALIGN_ITEMS.includes(this.align as AlignItems) ? this.align : sanitizeCssValue(this.align as string);

    this.config = { space, justify, align };

    const signature = `pc-cluster-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-cluster');
      host.classList.remove('cluster');
    } catch {
      console.warn('Could not clean up Cluster attributes on destroy');
    }
  }

  /**
   * Generates CSS styles for this cluster instance.
   * Uses flexbox with wrap and gap for consistent spacing.
   * @param signature - Unique identifier for this configuration
   * @param config - Configuration object with spacing and alignment properties
   * @returns CSS string
   * @internal
   */
  private generateStyle(signature: string, config: { space: string; justify: string; align: string }): string {
    const { space, justify, align } = config;
    return `
    .cluster[data-pc-cluster="${signature}"] {
      unicode-bidi: isolate;
      display: flex;
      flex-wrap: wrap;
      gap: ${space || 'var(--space, 1rem)'};
      justify-content: ${justify || 'flex-start'};
      align-items: ${align || 'flex-start'};
    }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-cluster', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('cluster');
    host.setAttribute('data-pc-cluster', this.ident);
  }
}
