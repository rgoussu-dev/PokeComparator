import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Size, ALL_SIZES } from '../../types/size';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';

/**
 * A layout primitive that provides a container with padding, borders, and background styling.
 *
 * @description
 * The Box component is a fundamental layout primitive that wraps content with configurable
 * padding, borders, border radius, background color, and text color. It serves as a building
 * block for creating cards, panels, sections, and other contained UI elements.
 *
 * The component uses dynamic style generation with unique signatures to avoid style conflicts
 * while allowing style reuse across instances with identical configurations. Styles are only
 * regenerated when relevant input properties change, optimizing performance.
 *
 * Key features:
 * - Configurable padding with size tokens or custom values
 * - Optional border with width and radius control
 * - Background and text color customization
 * - Automatic outline fallback when no border is specified
 * - Color inheritance for child elements
 * - Performance-optimized with OnPush change detection
 * - Dynamic style injection with unique signatures
 *
 * The view encapsulation is set to None to allow dynamically injected styles to apply
 * correctly to child components, as styles are injected globally.
 *
 * @example
 * Basic box with padding:
 * ```html
 * <pc-box padding="s-2">
 *   <p>Content with padding</p>
 * </pc-box>
 * ```
 *
 * @example
 * Card-style box with border and background:
 * ```html
 * <pc-box
 *   padding="s-3"
 *   borderWidth="2px"
 *   borderRadius="s-1"
 *   backgroundColor="var(--color-surface)">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </pc-box>
 * ```
 *
 * @example
 * Colored box with custom padding:
 * ```html
 * <pc-box
 *   padding="24px"
 *   backgroundColor="var(--color-primary)"
 *   color="var(--color-on-primary)"
 *   borderRadius="8px">
 *   <strong>Highlighted content</strong>
 * </pc-box>
 * ```
 *
 * @example
 * Box with size token spacing:
 * ```html
 * <pc-box
 *   padding="s-4"
 *   borderWidth="s-0"
 *   borderRadius="s-2">
 *   Large padded box
 * </pc-box>
 * ```
 *
 * @usageNotes
 * - Use size tokens (s-0 through s-6) for consistent spacing across the application
 * - Custom CSS values (e.g., '16px', '1rem') are also supported for all size inputs
 * - When borderWidth is null or '0', an invisible outline is added to prevent layout shift
 * - Color values should use CSS custom properties for theme consistency
 * - Child elements inherit the text color set on the box
 * - Combine with other layout primitives (Stack, Cluster) for complex layouts
 * - The component displays as block and uses unicode-bidi: isolate
 *
 * @see {@link Stack} for vertical layout of boxes
 * @see {@link Cluster} for horizontal wrapping layout
 * @see {@link Size} for available size tokens
 *
 * @publicApi
 */
@Component({
  selector: 'pc-box',
  imports: [],
  template: ` <ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'box' }
})
export class Box implements OnInit, OnChanges {
  /** 
   * Padding inside the box.
   * Can be a Size token (s-0 through s-6) or a custom CSS value.
   */
  @Input() padding: Size | string = 's1';
  
  /** 
   * Width of the border.
   * When null, no border is displayed but an invisible outline prevents layout shift.
   * Can be a Size token or a custom CSS value.
   */
  @Input() borderWidth: Size | string | null = null;
  
  /** 
   * Border radius for rounded corners.
   * Can be a Size token or a custom CSS value (e.g., '8px', '50%').
   */
  @Input() borderRadius: Size | string | null = null;
  
  /** 
   * Background color of the box.
   * Should typically use CSS custom properties (e.g., 'var(--color-surface)').
   */
  @Input() backgroundColor: string | null = null;
  
  /** 
   * Text color for content inside the box.
   * Inherited by all child elements. Use CSS custom properties for theme consistency.
   */
  @Input() color?: string = undefined;

  /** Unique identifier for this box instance, generated from configuration. @internal */
  ident?: string;
  
  /** Current configuration object used for style generation. @internal */
  config: { padding: string; borderWidth: string | null; backgroundColor: string; borderRadius: string | null; color: string } | null = null;

  private readonly el = inject(ElementRef);

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['padding'] || changes['borderWidth'] || changes['backgroundColor'] || changes['color']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-box', this.ident, style);
    const host = this.el.nativeElement as HTMLElement;
    host.classList.add('box');
    host.setAttribute('data-pc-box', this.ident);
  }

  /**
   * Updates configuration and generates unique signature for this box instance.
   * @internal
   */
  private updateConfigAndSignature() {
    const padding = ALL_SIZES.includes(this.padding as Size) 
    ? `var(--${this.padding})` 
    : sanitizeCssValue(this.padding);
    const borderWidth = this.borderWidth != null ? (ALL_SIZES.includes(this.borderWidth as Size) 
    ? `var(--${this.borderWidth})`
     : sanitizeCssValue(this.borderWidth as string)) 
     : null;
    const borderRadius = this.borderRadius != null ? (ALL_SIZES.includes(this.borderRadius as Size) 
    ? `var(--${this.borderRadius})`
    : sanitizeCssValue(this.borderRadius as string)) 
    : null;
    const backgroundColor = sanitizeCssValue(this.backgroundColor || 'transparent');
    const color = sanitizeCssValue(this.color || 'inherit');

    this.config = {
      padding,
      borderWidth,
      backgroundColor,
      borderRadius,
      color
    };

    const signature = `pc-box-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  /**
   * Generates CSS styles for this box instance.
   * Adds display block and unicode-bidi isolate to allow padding to work correctly.
   * When no border is specified, adds an invisible outline to prevent layout shift.
   * @param signature - Unique identifier for this configuration
   * @param config - Configuration object with styling properties
   * @returns CSS string
   * @internal
   */
  private generateStyle(signature: string, config: { 
    padding: string; 
    borderWidth: string | null; 
    borderRadius: string | null;
    backgroundColor: string; 
    color: string }): string {

    const { padding, borderWidth, borderRadius, backgroundColor, color } = config;
    return `
      .box[data-pc-box="${signature}"] { 
          display: block;
          unicode-bidi: isolate;
          padding: ${padding};
          ${backgroundColor != null && `background-color: ${backgroundColor};`}
          ${color != null && `color: ${color};`}
          ${borderWidth != null && borderWidth !== '0' &&  `border: ${borderWidth} solid;`}
          ${borderWidth == null || borderWidth === '0' 
            ? `border: 0 solid; outline: var(--s-1) solid transparent; outline-offset: calc(var(--s-1) * -1);` : ``}  
          ${borderRadius != null && `border-radius: ${borderRadius};`}      
      }
      .box[data-pc-box="${signature}"] * {
        color: inherit;
      }`; 
  }
}
