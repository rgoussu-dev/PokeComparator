import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, SimpleChanges, ViewEncapsulation, OnInit, OnChanges } from '@angular/core';
import { ALL_SIZES, Size } from '../../types/size';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';

/**
 * A layout primitive for horizontally centering content with optional constraints.
 *
 * @description
 * The Center component provides horizontal centering of content with configurable
 * maximum width, text alignment, intrinsic centering, and gutter spacing.
 * It uses `margin-inline: auto` for centering and supports multiple centering modes
 * for different use cases.
 *
 * Key features:
 * - Horizontal centering using auto margins
 * - Optional maximum width constraint
 * - Text centering mode for typography
 * - Intrinsic centering mode for flex-based centering
 * - Configurable gutter (padding) on sides
 * - Content-box sizing for precise control
 * - Performance-optimized with dynamic style generation
 *
 * The component is particularly useful for creating centered content areas,
 * hero sections, centered cards, and constrained text blocks.
 *
 * @example
 * Basic centered content with max width:
 * ```html
 * <pc-center maxWidth="60ch">
 *   <p>This content is centered with a maximum width of 60 characters.</p>
 * </pc-center>
 * ```
 *
 * @example
 * Centered with text alignment:
 * ```html
 * <pc-center maxWidth="50ch" [centerText]="true">
 *   <h1>Centered Heading</h1>
 *   <p>Centered paragraph text</p>
 * </pc-center>
 * ```
 *
 * @example
 * Intrinsic centering (flex-based):
 * ```html
 * <pc-center [intrinsic]="true">
 *   <button>Centered Button</button>
 * </pc-center>
 * ```
 *
 * @example
 * Centered with gutter spacing:
 * ```html
 * <pc-center maxWidth="70ch" gutterWidth="s-3">
 *   <article>
 *     Article content with side padding
 *   </article>
 * </pc-center>
 * ```
 *
 * @example
 * Hero section with centered content:
 * ```html
 * <pc-center maxWidth="80ch" gutterWidth="s-2" [centerText]="true">
 *   <h1>Welcome to Our App</h1>
 *   <p>A brief description of what we do</p>
 * </pc-center>
 * ```
 *
 * @usageNotes
 * - Use `maxWidth` to constrain content width (common values: '60ch', '70ch', '1200px')
 * - The 'ch' unit is ideal for readable text line lengths (45-75 characters)
 * - Set `centerText` to true for centered typography (heading sections, hero text)
 * - Set `intrinsic` to true for flexbox-based centering of inline content
 * - Use `gutterWidth` to add padding on sides (prevents content touching edges)
 * - The component uses content-box sizing for predictable max-width behavior
 * - Combine with Stack for vertically centered layouts
 * - Size tokens (s-0 through s-6) work for both maxWidth and gutterWidth
 * - Custom CSS values are also supported (e.g., '1200px', '4rem')
 *
 * @see {@link Stack} for vertical layouts
 * @see {@link Box} for adding background and borders
 * @see {@link Size} for available size tokens
 *
 * @publicApi
 */
@Component({
  selector: 'pc-center',
  imports: [],
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'center' }
})
export class Center implements OnInit, OnChanges {
  /** 
   * Maximum width of the centered content.
   * Common values: '60ch' for readable text, '1200px' for wide layouts.
   * When null, no maximum width is applied.
   */
  @Input() maxWidth: Size | null = null;
  
  /** 
   * Whether to center text content.
   * Applies text-align: center to all content.
   */
  @Input() centerText = false;
  
  /** 
   * Whether to use intrinsic (flex-based) centering.
   * Changes layout to flexbox with centered alignment.
   */
  @Input() intrinsic = false;
  
  /** 
   * Horizontal padding (gutter) on sides.
   * Prevents content from touching container edges.
   * Can be a Size token or custom CSS value.
   */
  @Input() gutterWidth: Size | null = null;

  /** Unique identifier for this center instance, generated from configuration. @internal */
  ident: string | null = null;
  
  /** Current configuration object used for style generation. @internal */
  config: { maxWidth: string  | null; centerText: boolean; intrinsic: boolean; gutterWidth: string | null; } 
  | null = null;

  private readonly element = inject(ElementRef);
  
  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['maxWidth'] || changes['centerText'] || changes['intrinsic'] || changes['gutterWidth']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  /**
   * Injects generated styles and updates host attributes.
   * @internal
   */
  updateStyle() {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-center', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('center');
    host.setAttribute('data-pc-center', this.ident);

  }
  
  /**
   * Updates configuration and generates unique signature for this center instance.
   * @internal
   */
  updateConfigAndSignature() {
    this.config = {
      maxWidth: this.maxWidth == null ? null : ALL_SIZES.includes(this.maxWidth) ? `var(--${this.maxWidth})` : sanitizeCssValue(this.maxWidth),
      centerText: this.centerText,
      intrinsic: this.intrinsic,
      gutterWidth: this.gutterWidth == null ? null : ALL_SIZES.includes(this.gutterWidth) ? `var(--${this.gutterWidth})` : sanitizeCssValue(this.gutterWidth),
    };

    const signature = `pc-center-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  /**
   * Generates CSS styles for this center instance.
   * Uses content-box sizing and auto margins for centering.
   * @param signature - Unique identifier for this configuration
   * @param config - Configuration object with centering properties
   * @returns CSS string
   * @internal
   */
  private generateStyle(signature: string, config: { maxWidth: string | null; centerText: boolean; intrinsic: boolean; gutterWidth: string | null; }): string {
    const { maxWidth, centerText, intrinsic, gutterWidth } = config;
    return `
    .center[data-pc-center="${signature}"] {
        display: block;
        unicode-bidi: isolate;
        box-sizing: content-box;
        margin-inline: auto;
        ${maxWidth != null ? `max-inline-size: ${maxWidth};` : ''}
        ${centerText ? 'text-align: center;' : ''}
        ${intrinsic ? '    display:flex; flex-direction: column; align-items: center;' : ''}
        ${gutterWidth != null ? `padding-inline-start: ${gutterWidth}; padding-inline-end: ${gutterWidth};` : ''}
  }
    `;
  }
}
